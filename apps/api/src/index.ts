import { Hono } from 'hono'
import clerkWebhook from './routes/webhooks/clerk';
import { successResponse, errorResponse } from './utils/responses';
import meRoute from "./routes/user/me";

const app = new Hono()

app.get("/", (c) => successResponse(c, { message: "API is healthy" }));

app.route("/webhooks/clerk", clerkWebhook);
app.route("/me", meRoute);

// 404 handeler
app.notFound((c) => errorResponse(c, "Route not found", 404));

app.onError((err, c) => {
  console.error("Unhandeled error:", err);
  return errorResponse(c, err.message || "Internal Server Error", 500);
})

export default app
