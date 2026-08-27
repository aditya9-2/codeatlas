import type { ClerkAuthVariables } from "@hono/clerk-auth";

export type Env = {
  Bindings: {
    CLERK_WEBHOOK_SIGNING_SECRET: string;
    CLERK_PUBLISHABLE_KEY: string;
    CLERK_SECRET_KEY: string;
  };
  Variables: ClerkAuthVariables;
};