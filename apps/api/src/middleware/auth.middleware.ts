import {clerkMiddleware, getAuth} from "@hono/clerk-auth";
import {createMiddleware} from "hono/factory";
import type { Env } from "../types/env";
import { errorResponse } from "../utils/responses";

export const setupClerk = clerkMiddleware();

export const requireAuth = createMiddleware<Env>(async(c, next)=> {
    const auth = getAuth(c);

    if(!auth.userId) {
        return errorResponse(c, "Unauthorized access", 401);
    }
    await next();
})
