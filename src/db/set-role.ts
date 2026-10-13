/*
 * Sets a user's role. The role can't be set through sign-up or the auth API,
 * so this is how the first admin is created:
 *
 *   pnpm auth:role you@example.com admin
 *   pnpm auth:role you@example.com customer
 *
 * Imports are relative so this runs under tsx, outside Next.
 */
import { config } from "dotenv";

config({ path: [".env.local", ".env"], quiet: true });

const roles = ["customer", "admin"] as const;

async function main() {
  const [email, role] = process.argv.slice(2);
  if (!email || !roles.includes(role as (typeof roles)[number])) {
    throw new Error("Usage: pnpm auth:role <email> <customer|admin>");
  }

  // Imported after the env is loaded: ./index throws without DATABASE_URL.
  const { eq, sql } = await import("drizzle-orm");
  const { db } = await import("./index");
  const { users } = await import("./schema");

  const updated = await db
    .update(users)
    .set({ role: role as (typeof roles)[number] })
    .where(eq(sql`lower(${users.email})`, email.toLowerCase()))
    .returning({ id: users.id, email: users.email, role: users.role });

  if (updated.length === 0) {
    throw new Error(`No user with email ${email}`);
  }
  console.log(`${updated[0].email} is now ${updated[0].role}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
