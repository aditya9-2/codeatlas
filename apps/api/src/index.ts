import { Hono } from 'hono'
import clerkWebhook from './routes/webhooks/clerk';

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
});

app.route("/webhooks/clerk", clerkWebhook);

export default app
