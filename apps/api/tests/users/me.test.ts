import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@hono/clerk-auth", async () => {
    const actual = await vi.importActual("@hono/clerk-auth");
    return {
        ...actual,
        getAuth: vi.fn(() => ({ userId: "clerk_user_123" })),
    };
});

vi.mock("../../src/services/user.service", () => ({
    getUserByClerkId: vi.fn(async (clerkUserId: string) =>
        clerkUserId === "clerk_user_123"
            ? { id: "internal-uuid-1", clerkUserId, email: "test@example.com", name: "John Doe" }
            : null
    ),
}));

const { default: app } = await import("../../src/index");
const { getAuth } = await import("@hono/clerk-auth");

describe("GET /me", () => {
    beforeEach(() => {
        // reset to the default authenticated-known-user state before each test
        (getAuth as any).mockReturnValue({ userId: "clerk_user_123" });
    });

    it("returns the resolved internal user for an authenticated request", async () => {
        const res = await app.request("/me");
        const json = (await res.json()) as any;

        expect(res.status).toBe(200);
        expect(json).toEqual({
            success: true,
            data: {
                id: "internal-uuid-1",
                clerkUserId: "clerk_user_123",
                email: "test@example.com",
                name: "John Doe",
            },
        });
    });

    it("returns 404 if the Clerk identity has no matching internal user", async () => {
        (getAuth as any).mockReturnValue({ userId: "clerk_unknown" });

        const res = await app.request("/me");
        const json = (await res.json()) as any;

        expect(res.status).toBe(404);
        expect(json.success).toBe(false);
    });
});