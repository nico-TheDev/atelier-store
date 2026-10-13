<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Sartoria Store

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

## Build approach

<TBD, set by /scope>

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
    - Orders, payments, reviews, wishlists and variants are out of scope until asked for. The bag is cookie-based (see below).
  - **Reads**: all storefront catalogue reads go through `src/db/queries/catalog.ts`.
    - It maps rows to the storefront `Product` type in `src/lib/catalog.ts`. Pages and components never import `db` directly.
    - Every query uses `'use cache'` + `cacheLife` + `cacheTag` (`products`, `product:${slug}`), so pages stay prerendered under Cache Components.
    - Any code that writes catalogue data must call `updateTag`/`revalidateTag` on those tags.
  - **Migrations**: use versioned migrations (`db:generate`, then `db:migrate`) and commit `./drizzle`. Don't use `db:push` on shared databases.
  - **Seeding**: `src/db/seed.ts` uses relative imports so it runs under tsx, outside Next.
  - **Build**: it reads the database in `generateStaticParams`, so `DATABASE_URL` must point to a migrated and seeded database.
- **Bag (cart)**: `src/lib/cart.ts` stores it in one httpOnly cookie (`atelier_bag`) holding only `{ productId, size, quantity }`. There are no cart tables, and guests can use it.
  - Prices, names and stock are never read from the cookie. `getBag()` reconciles it against live data from `src/db/queries/cart.ts`. That query is deliberately **uncached** (the one exception to the `'use cache'` rule), so call it only inside `<Suspense>` or a server action.
  - Mutations live in `src/app/bag/actions.ts`. They take ids, sizes and quantities only, re-check live stock, then write the cookie.
  - The bag doesn't reserve stock. Checkout (not built yet) must decrement stock with a conditional `UPDATE … WHERE quantity >= n`.
- **Auth**: Better Auth is configured in `src/lib/auth.ts` (Drizzle adapter, `pg` provider) and mounted at `src/app/api/auth/[...all]/route.ts`. Client code uses `authClient` from `src/lib/auth-client.ts`.
  - `src/lib/auth.ts` imports `../db` by **relative** path on purpose, so the Better Auth CLI can resolve it. Keep it relative instead of switching to `@/`.
  - `nextCookies()` has to stay the **last** plugin, or cookies set in server actions won't be applied.
  - Email/password only. Tables (`users`, `sessions`, `accounts`, `verifications`, `rate_limits`) come from `usePlural` + `generateId: "serial"`. When you add Better Auth plugins or change auth config: run `auth:generate`, re-apply `{ withTimezone: true }` to every `timestamp()` in `src/db/schema/auth.ts`, then run `db:generate` and `db:migrate`.
  - **Session reads** go through `src/lib/session.ts` (`getSession`, `requireUser`, `requireAdmin`). Pages never import `auth`. Call them inside a `<Suspense>` boundary (Cache Components), never at a layout's top level.
  - **Authorization**: `src/proxy.ts` only checks that a session cookie exists, as an early redirect. Every account page and action calls `requireUser`. Every admin page and **every admin server action** calls `requireAdmin()` first (non-admins get a 404).
  - **Roles**: `users.role` is `customer` (default) or `admin`, with `input: false` so clients can't set it. Change it with `pnpm auth:role <email> <customer|admin>`.
  - **Sign-in/sign-up** use `authClient` from a client form (`src/components/auth-form.tsx`), not server actions. Better Auth applies rate limits and origin checks only to HTTP requests to `/api/auth`, and direct `auth.api.*` calls skip them.
- **Styling**: Tailwind CSS v4, CSS-first. There's no `tailwind.config`. Theme tokens live in `@theme` in `src/app/globals.css`, and Turbopack loads CSS through `@tailwindcss/turbopack` (set up in `next.config.ts`).
- Path alias: `@/*` → `src/*`.

## Agent skills

- [better-auth-best-practices](.agents/skills/better-auth-best-practices/): `better-auth/skills`, Better Auth setup and configuration conventions
- [better-auth-security-best-practices](.agents/skills/better-auth-security-best-practices/): `better-auth/skills`, Better Auth security hardening
- [create-auth](.agents/skills/create-auth/): `better-auth/skills`, adding auth flows with Better Auth
- [email-and-password-best-practices](.agents/skills/email-and-password-best-practices/): `better-auth/skills`, the email and password sign in this project uses
- [organization-best-practices](.agents/skills/organization-best-practices/): `better-auth/skills`, the organization plugin (not used yet)
- [two-factor-authentication-best-practices](.agents/skills/two-factor-authentication-best-practices/): `better-auth/skills`, the two factor plugin (not used yet)
- [build-ui](.claude/skills/build-ui/): project skill, building customer facing storefront UI with the existing design system and components

## Context files

<!-- Nested AGENTS.md files are listed here as they are created -->
