import { describe, expect, it, vi } from "vitest";
import { Hono } from "hono";
import type { Env } from "../../src/types/env";

// Mock getAuth so we don't need real clerkMiddleware wired up for a unit test
vi.mock("@hono/clerk-auth", async () => {
    const actual = await vi.importActual("@hono/clerk-auth");
    return {
        ...actual,
        getAuth: vi.fn(() => ({ userId: null })),
    };
});

// Import AFTER the mock so requireAuth picks up the mocked getAuth
const { requireAuth } = await import("../../src/middleware/auth.middleware");

describe("Auth Middleware", () => {
    it("Should block unauthenticated requests with 401", async () => {
        const testApp = new Hono<Env>();

        testApp.get("/protected", requireAuth, (c) => c.json({ ok: true }));

        const res = await testApp.request("/protected");
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json).toEqual({
            success: false,
            error: "Unauthorized access", // matches actual middleware message
        });
    });
});