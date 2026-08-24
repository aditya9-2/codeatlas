import {
    index,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

import { conversations } from "./conversations";

export const messageRoleEnum = pgEnum("message_role", [
    "USER",
    "ASSISTANT",
    "SYSTEM",
]);

export const messages = pgTable(
    "messages",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        conversationId: uuid("conversation_id")
            .notNull()
            .references(() => conversations.id, {
                onDelete: "cascade",
            }),

        role: messageRoleEnum("role").notNull(),

        content: text("content").notNull(),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("messages_conversation_id_idx").on(
            table.conversationId,
        ),
    ],
);