import {
    index,
    integer,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

import { repositories } from "./repositories";

export const ingestionStatusEnum = pgEnum("ingestion_status", [
    "PENDING",
    "PROCESSING",
    "COMPLETED",
    "FAILED",
    "CANCELLED",
]);

export const ingestionJobs = pgTable(
    "ingestion_jobs",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        repositoryId: uuid("repository_id")
            .notNull()
            .references(() => repositories.id, {
                onDelete: "cascade",
            }),

        status: ingestionStatusEnum("status")
            .default("PENDING")
            .notNull(),

        commitSha: text("commit_sha").notNull(),

        filesTotal: integer("files_total").default(0).notNull(),

        filesProcessed: integer("files_processed")
            .default(0)
            .notNull(),

        chunksCreated: integer("chunks_created")
            .default(0)
            .notNull(),

        errorMessage: text("error_message"),

        startedAt: timestamp("started_at", {
            withTimezone: true,
        }),

        completedAt: timestamp("completed_at", {
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
        index("ingestion_jobs_repository_id_idx").on(
            table.repositoryId,
        ),
    ],
);