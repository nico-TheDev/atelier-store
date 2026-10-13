import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { db } from "../db"; // relative so the Better Auth CLI can resolve it

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  // nextCookies must stay last so cookies set in server actions are applied
  plugins: [nextCookies()],
});
