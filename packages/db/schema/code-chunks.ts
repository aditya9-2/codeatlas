import {
    index,
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

import { repositories } from "./repositories";
import { repositoryFiles } from "./repository-files";

export const codeChunks = pgTable(
    "code_chunks",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        repositoryId: uuid("repository_id")
            .notNull()
            .references(() => repositories.id, {
                onDelete: "cascade",
            }),

        fileId: uuid("file_id")
            .notNull()
            .references(() => repositoryFiles.id, {
                onDelete: "cascade",
            }),

        content: text("content").notNull(),

        startLine: integer("start_line").notNull(),

        endLine: integer("end_line").notNull(),

        chunkIndex: integer("chunk_index").notNull(),

        contentHash: text("content_hash").notNull(),

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
        index("code_chunks_repository_id_idx").on(
            table.repositoryId,
        ),

        index("code_chunks_file_id_idx").on(table.fileId),
    ],
);