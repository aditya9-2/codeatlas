import {
    bigint,
    index,
    pgEnum,
    pgTable,
    text,
    timestamp,
    unique,
    uuid,
} from "drizzle-orm/pg-core";

import { projects } from "./projects";

export const repositoryStatusEnum = pgEnum("repository_status", [
    "PENDING",
    "INDEXING",
    "INDEXED",
    "FAILED",
]);

export const repositories = pgTable(
    "repositories",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        projectId: uuid("project_id")
            .notNull()
            .references(() => projects.id, {
                onDelete: "cascade",
            }),

        githubRepoId: bigint("github_repo_id", {
            mode: "number",
        }).notNull(),

        owner: text("owner").notNull(),

        name: text("name").notNull(),

        fullName: text("full_name").notNull(),

        url: text("url").notNull(),

        defaultBranch: text("default_branch").notNull(),

        latestCommitSha: text("latest_commit_sha"),

        status: repositoryStatusEnum("status")
            .default("PENDING")
            .notNull(),

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
        index("repositories_project_id_idx").on(table.projectId),

        unique("repositories_project_github_unique").on(
            table.projectId,
            table.githubRepoId,
        ),
    ],
);