import {
    index,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { repositories } from "./repositories";

export const conversations = pgTable(
    "conversations",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        repositoryId: uuid("repository_id")
            .notNull()
            .references(() => repositories.id, {
                onDelete: "cascade",
            }),

        title: text("title"),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),

        updatedAt: timestamp("updated_at", {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("conversations_user_id_idx").on(table.userId),

        index("conversations_repository_id_idx").on(
            table.repositoryId,
        ),
    ],
);