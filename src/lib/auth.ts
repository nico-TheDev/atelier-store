import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { db } from "../db"; // relative so the Better Auth CLI can resolve it

export const auth = betterAuth({
  appName: "Sartoria",
  database: drizzleAdapter(db, {
    provider: "pg",
    // users, sessions, accounts… to match the plural catalogue tables
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      role: {
        type: ["customer", "admin"],
        required: true,
        defaultValue: "customer",
        // never settable from sign-up or update-user; promote via pnpm auth:promote
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    // no cookieCache: every check reads the DB, so role changes and
    // sign-outs take effect on the next request
  },
  rateLimit: {
    // in-memory counters don't survive serverless instances
    storage: "database",
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
    },
  },
  advanced: {
    // integer identity primary keys, like the rest of the schema
    database: { generateId: "serial" },
  },
  // nextCookies must stay last so cookies set in server actions are applied
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
export type SessionUser = Session["user"];
