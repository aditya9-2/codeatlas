import { createMiddleware } from "hono/factory";
import { getAuth } from "@hono/clerk-auth";
import { getUserByClerkId } from "../services/user.service";
import type { Env } from "../types/env";
import { errorResponse } from "../utils/responses";

export const resolveUser = createMiddleware<Env>(async (c, next) => {
    const auth = getAuth(c);
    if (!auth.userId) {
        return errorResponse(c, "Unauthorized access", 401);
    }

    const user = await getUserByClerkId(auth.userId);
    if (!user) {
        return errorResponse(c, "User not found", 404);
    }

    c.set("currentUser", user);
    await next();
});