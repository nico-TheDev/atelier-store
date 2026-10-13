# Atelier Store

Next.js (App Router) + TypeScript + Tailwind CSS, with Better Auth, Drizzle ORM and Postgres on Neon.

## Setup

```bash
pnpm install
cp .env.example .env.local   # fill in DATABASE_URL and BETTER_AUTH_SECRET
pnpm auth:secret             # prints a value for BETTER_AUTH_SECRET
pnpm dev
```

## Project layout

```
src/
  app/api/auth/[...all]/route.ts   Better Auth route handler
  db/index.ts                      Drizzle client (Neon serverless HTTP driver)
  db/schema/                       Drizzle table definitions (re-exported from index.ts)
  lib/auth.ts                      Better Auth server config
  lib/auth-client.ts               Better Auth React client
drizzle.config.ts                  drizzle-kit config (reads .env.local, then .env)
```

## Scripts

| Script               | Description                                              |
| -------------------- | -------------------------------------------------------- |
| `pnpm dev`           | Start the dev server                                     |
| `pnpm build`         | Production build (requires `DATABASE_URL`)               |
| `pnpm lint`          | ESLint                                                   |
| `pnpm typecheck`     | TypeScript check                                         |
| `pnpm auth:generate` | Generate Better Auth tables into `src/db/schema/auth.ts` |
| `pnpm auth:secret`   | Generate a Better Auth secret                            |
| `pnpm db:generate`   | Generate SQL migrations from the schema                  |
| `pnpm db:migrate`    | Apply migrations                                         |
| `pnpm db:push`       | Push the schema directly (prototyping)                   |
| `pnpm db:seed`       | Load the product catalogue (safe to re-run)              |
| `pnpm db:studio`     | Open Drizzle Studio                                      |

After running `auth:generate`, re-export the new file from `src/db/schema/index.ts`
(`export * from "./auth";`), then run `db:generate` and `db:migrate`.
