import { Hono } from "hono";
import type { Env } from "../../types/env";
import { requireAuth } from "../../middleware/auth.middleware";
import { resolveUser } from "../../middleware/resolve-user.middleware";
import { successResponse } from "../../utils/responses";

const me = new Hono<Env>();

me.get("/", requireAuth, resolveUser, (c) => {
    return successResponse(c, c.get("currentUser"));
});

export default me;