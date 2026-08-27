import { eq } from "drizzle-orm";
import { db, users } from "db";

export interface UpsertUserInput {
  clerkUserId: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}

export async function upsertUser(input: UpsertUserInput) {
  const [user] = await db.insert(users).values({
      clerkUserId: input.clerkUserId,
      email: input.email,
      name: input.name ?? null,
      avatarUrl: input.avatarUrl ?? null,
    }).onConflictDoUpdate({
      target: users.clerkUserId,
      set: {
        email: input.email,
        name: input.name ?? null,
        avatarUrl: input.avatarUrl ?? null,
        updatedAt: new Date(),
      },
    }).returning();

  return user;
}

export async function getUserByClerkId(clerkUserId: string,) {
  
  const [user] = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId)).limit(1);
  return user ?? null;
}

export async function deleteUserByClerkId(clerkUserId: string,) {
  
  const [deletedUser] = await db.delete(users).where(eq(users.clerkUserId, clerkUserId)).returning();
  return deletedUser ?? null;
}