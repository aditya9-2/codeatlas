import { describe, expect, it, vi } from "vitest";
import { Webhook } from "svix";
import app from "../../src";

// Mock the user service so tests don't require an active DB connection
vi.mock("../../src/services/user.service", () => ({
    upsertUser: vi.fn().mockResolvedValue({ id: "user_123", clerkUserId: "user_test_123" }),
    deleteUserByClerkId: vi.fn().mockResolvedValue({ id: "user_123" }),
}));

describe("Clerk Webhook Endpoint", () => {
    const testSecret = "whsec_dGVzdF9zZWNyZXRfZm9yX3N2aXhfdGVzdGluZ18xMjM=";

    it("should reject requests missing Svix headers with 400", async () => {
        const res = await app.request(
            "/webhooks/clerk",
            { method: "POST", body: JSON.stringify({}) },
            { CLERK_WEBHOOK_SIGNING_SECRET: testSecret }
        );

        const json = (await res.json()) as { success: boolean };
        expect(res.status).toBe(400);
        expect(json.success).toBe(false);
    });

    it("should reject invalid signatures with 401", async () => {
        const res = await app.request(
            "/webhooks/clerk",
            {
                method: "POST",
                headers: {
                    "svix-id": "msg_test_123",
                    "svix-timestamp": Math.floor(Date.now() / 1000).toString(),
                    "svix-signature": "v1,invalid_signature",
                    "content-type": "application/json",
                },
                body: JSON.stringify({ type: "user.created" }),
            },
            { CLERK_WEBHOOK_SIGNING_SECRET: testSecret }
        );

        const json = (await res.json()) as { success: boolean };
        expect(res.status).toBe(401);
        expect(json.success).toBe(false);
    });

    it("should accept correctly signed payloads", async () => {
        const payload = JSON.stringify({
            type: "user.created",
            data: {
                id: "user_test_123",
                email_addresses: [{ id: "email_1", email_address: "test@example.com" }],
                primary_email_address_id: "email_1",
                first_name: "John",
                last_name: "Doe",
            },
        });

        const wh = new Webhook(testSecret);
        const timestamp = new Date();
        const signature = wh.sign("msg_test_valid", timestamp, payload);

        const res = await app.request(
            "/webhooks/clerk",
            {
                method: "POST",
                headers: {
                    "svix-id": "msg_test_valid",
                    "svix-timestamp": Math.floor(timestamp.getTime() / 1000).toString(),
                    "svix-signature": signature,
                    "content-type": "application/json",
                },
                body: payload,
            },
            { CLERK_WEBHOOK_SIGNING_SECRET: testSecret }
        );

        const json = (await res.json()) as { success: boolean };
        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
    });
});