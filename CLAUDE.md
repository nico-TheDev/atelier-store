# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

The repo is on Next.js 16.4 and React 19.3, which are newer than most training data. Check `node_modules/next/dist/docs/` (`01-app/` covers the App Router) before using a Next.js API. `next.config.ts` turns on `cacheComponents` and `partialPrefetching`, so caching and rendering follow the Cache Components model, not the older `fetch`/`revalidate` defaults.

## Commands

Use **pnpm** (pinned in `package.json` → `packageManager`). Don't use npm or yarn or add their lockfiles: `pnpm-lock.yaml` is the only lockfile. New packages with install scripts must be approved under `allowBuilds` in `pnpm-workspace.yaml`.

```bash
pnpm dev              # dev server (Turbopack)
pnpm build            # production build; needs DATABASE_URL because src/db/index.ts throws without it
pnpm lint             # ESLint flat config (next core-web-vitals + typescript)
pnpm typecheck        # tsc --noEmit
```

There is no test framework yet.

Database and auth:

```bash
pnpm db:generate        # SQL migrations from src/db/schema into ./drizzle
pnpm db:migrate         # apply migrations
pnpm db:push            # push schema directly (prototyping only)
pnpm db:seed            # load the catalogue from src/db/seed-data.ts (idempotent)
pnpm db:studio
pnpm auth:generate      # write Better Auth tables to src/db/schema/auth.ts
pnpm auth:secret        # print a BETTER_AUTH_SECRET value
```

Env vars go in `.env.local` (template: `.env.example`): `DATABASE_URL` (Neon), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`. drizzle-kit reads `.env.local` first, then `.env`.

## Architecture

- **Database**: `src/db/index.ts` exports one Drizzle `db` that uses the Neon serverless **HTTP** driver (`drizzle-orm/neon-http`). Put table definitions in `src/db/schema/*.ts` and re-export every file from `src/db/schema/index.ts`. Both the `db` client (`schema` option) and drizzle-kit read the schema from there, so a table you don't re-export won't exist for either one. The HTTP driver can't run interactive transactions. Use `db.batch` or a different driver if you need them.
  - **Schema conventions**:
    - integer identity primary keys
    - snake_case column names
    - `timestamptz` timestamps
    - a unique `slug` on anything that appears in a URL
    - money stored as integer cents (`price_cents`, USD only for now)
  - **Catalogue**: `src/db/schema/catalog.ts` defines `categories`, `products` and `product_stock`.
    - Stock is tracked **per size** in `product_stock` (`size` label + `quantity`). It's deliberately not a variant system: no SKU and no per-size price.
    - `images` is a jsonb `Picture[]` (the first image is the listing image), and `details` is `text[]`.
    - Carts, orders, payments, reviews, wishlists and variants are out of scope until asked for.
  - **Reads**: all storefront catalogue reads go through `src/db/queries/catalog.ts`.
    - It maps rows to the storefront `Product` type in `src/lib/catalog.ts`. Pages and components never import `db` directly.
    - Every query uses `'use cache'` + `cacheLife` + `cacheTag` (`products`, `product:${slug}`), so pages stay prerendered under Cache Components.
    - Any code that writes catalogue data must call `updateTag`/`revalidateTag` on those tags.
  - **Migrations**: use versioned migrations (`db:generate`, then `db:migrate`) and commit `./drizzle`. Don't use `db:push` on shared databases.
  - **Seeding**: `src/db/seed.ts` uses relative imports so it runs under tsx, outside Next.
  - **Build**: it reads the database in `generateStaticParams`, so `DATABASE_URL` must point to a migrated and seeded database.
- **Auth**: Better Auth is configured in `src/lib/auth.ts` (Drizzle adapter, `pg` provider) and mounted at `src/app/api/auth/[...all]/route.ts`. Client code uses `authClient` from `src/lib/auth-client.ts`.
  - `src/lib/auth.ts` imports `../db` by **relative** path on purpose, so the Better Auth CLI can resolve it. Keep it relative instead of switching to `@/`.
  - `nextCookies()` has to stay the **last** plugin, or cookies set in server actions won't be applied.
  - The auth tables don't exist yet. When you add Better Auth plugins or change auth config: run `auth:generate`, add `export * from "./auth";` to `src/db/schema/index.ts`, then run `db:generate` and `db:migrate`.
- **Styling**: Tailwind CSS v4, CSS-first. There's no `tailwind.config`. Theme tokens live in `@theme` in `src/app/globals.css`, and Turbopack loads CSS through `@tailwindcss/turbopack` (set up in `next.config.ts`).
- Path alias: `@/*` → `src/*`.
