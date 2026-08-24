import { Hono } from "hono";
import { Webhook } from "svix";

import type { Env } from "../../types/env";

import {
  upsertUser,
  deleteUserByClerkId,
} from "../../services/user.service";

const clerkWebhook = new Hono<Env>();

interface ClerkEmailAddress {
  id: string;
  email_address: string;
}

interface ClerkUserWebhookData {
  id: string;
  email_addresses?: ClerkEmailAddress[];
  primary_email_address_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
}

interface ClerkWebhookEvent {
  type: string;
  data: ClerkUserWebhookData;
}

clerkWebhook.post("/", async (c) => {
  const webhookSecret =
    c.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!webhookSecret) {
    console.error(
      "CLERK_WEBHOOK_SIGNING_SECRET is not configured",
    );

    return c.json(
      {
        success: false,
        error: "Webhook configuration error",
      },
      500,
    );
  }

  const svixId = c.req.header("svix-id");
  const svixTimestamp = c.req.header("svix-timestamp");
  const svixSignature = c.req.header("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return c.json(
      {
        success: false,
        error: "Missing webhook signature headers",
      },
      400,
    );
  }

  const payload = await c.req.text();

  const webhook = new Webhook(webhookSecret);

  let event: ClerkWebhookEvent;

  try {
    event = webhook.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (error) {
    console.error(
      "Invalid Clerk webhook signature",
      error,
    );

    return c.json(
      {
        success: false,
        error: "Invalid webhook signature",
      },
      401,
    );
  }

  try {
    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const { data } = event;

        const primaryEmail =
          data.email_addresses?.find(
            (email) =>
              email.id ===
              data.primary_email_address_id,
          );

        const email =
          primaryEmail?.email_address ??
          data.email_addresses?.[0]?.email_address;

        if (!email) {
          console.error(
            "Clerk user does not have an email address",
            {
              clerkUserId: data.id,
            },
          );

          return c.json(
            {
              success: false,
              error: "User has no email address",
            },
            400,
          );
        }

        const name =
          [data.first_name, data.last_name]
            .filter(Boolean)
            .join(" ") || null;

        const user = await upsertUser({
          clerkUserId: data.id,
          email,
          name,
          avatarUrl: data.image_url ?? null,
        });

        console.log(
          `User ${event.type} synced: ${user.id}`,
        );

        return c.json({
          success: true,
        });
      }

      case "user.deleted": {
        const deletedUser =
          await deleteUserByClerkId(event.data.id);

        console.log(
          `User deleted: ${deletedUser?.id ?? event.data.id}`,
        );

        return c.json({
          success: true,
        });
      }

      default: {
        console.log(
          `Ignoring unsupported Clerk event: ${event.type}`,
        );

        return c.json({
          success: true,
          ignored: true,
        });
      }
    }
  } catch (error) {
    console.error(
      `Failed to process Clerk event: ${event.type}`,
      error,
    );

    return c.json(
      {
        success: false,
        error: "Failed to process webhook",
      },
      500,
    );
  }
});

export default clerkWebhook;