import {
    bigint,
    index,
    pgTable,
    text,
    timestamp,
    unique,
    uuid,
} from "drizzle-orm/pg-core";

import { repositories } from "./repositories";

export const repositoryFiles = pgTable(
    "repository_files",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        repositoryId: uuid("repository_id")
            .notNull()
            .references(() => repositories.id, {
                onDelete: "cascade",
            }),

        path: text("path").notNull(),

        language: text("language"),

        sizeBytes: bigint("size_bytes", {
            mode: "number",
        }).notNull(),

        fileSha: text("file_sha").notNull(),

        contentHash: text("content_hash").notNull(),

        lastIndexedAt: timestamp("last_indexed_at", {
            withTimezone: true,
        }),

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
        index("repository_files_repository_id_idx").on(
            table.repositoryId,
        ),

        unique("repository_files_repository_path_unique").on(
            table.repositoryId,
            table.path,
        ),
    ],
);