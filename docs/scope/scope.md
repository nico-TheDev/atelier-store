# Scope: Sartoria Store

A real online fashion store that takes real payments. Shoppers in the Philippines (the only market for now) browse the catalogue, fill a bag, and check out in English, priced in PHP. Admins run the catalogue and the orders.

**Build approach:** Tracer Bullet (each feature built end to end, database through UI, and working before the next one starts).
**Workflow:** Beta (after `/develop`, run `/check verify`, then `/test`). The project default level of rigor. `/architect` is the recommended first stop for a feature with a real decision, but skippable when you already know the build. Any feature can carry its own tag (e.g. `· GA`) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Stack & architecture | Foundation | existing |
| 2 | Coding standards & tooling | Foundation | in-progress |
| 3 | Catalogue data model | Foundation | existing |
| 4 | Design system & UI foundation | Foundation | existing |
| 5 | Storefront home | Existing | existing |
| 6 | Product page | Existing | existing |
| 7 | Collections | Existing | existing |
| 8 | Search | Existing | existing |
| 9 | Bag | Existing | existing |
| 10 | Sign in & sign up | Existing | existing |
| 11 | Account profile & security | Existing | existing |
| 12 | Admin access & cache refresh | Existing | existing |
| 13 | Admin product editing | Slice 1 | planned |
| 14 | Admin stock by size | Slice 1 | planned |
| 15 | Orders data model | Slice 2 | planned |
| 16 | Shipping & tax in the Philippines | Slice 2 | planned |
| 17 | Checkout & payment | Slice 2 | planned |
| 18 | Transactional email | Slice 3 | planned |
| 19 | Order history in account | Slice 3 | planned |
| 20 | Admin order management | Slice 3 | planned |
| 21 | Legal pages & cookie consent | Slice 4 | planned |
| 22 | Client service pages | Slice 4 | planned |
| 23 | SEO extras | Slice 4 | planned |
| 24 | Analytics & error monitoring | Slice 4 | planned |
| 25 | Filter & sort listings | Slice 4 | planned |
| 26 | Promo codes & discounts | Slice 3 | planned |
| 27 | Peso pricing | Foundation | planned |

## Foundations

### 1. Stack & architecture · existing
Next.js App Router with Cache Components, Drizzle on Neon, Better Auth, Tailwind v4. code in `./`

### 2. Coding standards & tooling · in-progress
Conventions are captured and lint plus typecheck run clean. Still missing: a formatter, pre commit checks, and a test framework, which the Beta workflow needs for `/test`.
**Done when:** root `AGENTS.md` reflects the real stack, and lint, format, pre commit and the test runner all run clean.
- [x] Capture conventions + tooling choices: `/audit`
- [ ] Install the tooling: `/develop tooling`
- [ ] Check it runs clean: `/test`
code in `./`

### 3. Catalogue data model · existing
Categories, products, and stock per size, with seed data and versioned migrations. code in `src/db/schema/catalog.ts`

### 4. Design system & UI foundation · existing
Theme tokens, base and component styles, shared components, and the `build-ui` project skill. code in `src/app/globals.css`, `src/styles/`, `src/components/`

### 27. Peso pricing
Switch the store from USD to PHP, since the Philippines is the only market for now. Prices stay integer minor units (centavos), so only the currency, formatting and seed prices change, plus the matching notes in `AGENTS.md`.
**Done when:** every price on the storefront, bag and product structured data shows in PHP, the footer locale line says Philippines, and seed prices are realistic peso amounts.
- [ ] Build it: `/develop peso pricing`

## Already built

### 5. Storefront home · existing
Prerendered home page from cached catalogue reads. code in `src/app/page.tsx`

### 6. Product page · existing
Gallery, details, size picker and add to bag. code in `src/app/products/[slug]/`

### 7. Collections · existing
Category listings plus a New In collection. code in `src/app/collections/`

### 8. Search · existing
Keyword search across name, colour, description and category. code in `src/app/search/`, `src/db/queries/catalog.ts`

### 9. Bag · existing
Guest friendly bag in one httpOnly cookie, checked against live stock. Its checkout step is planned in feature 17. code in `src/app/bag/`, `src/lib/cart.ts`

### 10. Sign in & sign up · existing
Email and password through Better Auth, with safe redirects. code in `src/app/(auth)/`, `src/components/auth-form.tsx`

### 11. Account profile & security · existing
Edit name and change password, guarded by `requireUser`. code in `src/app/account/`

### 12. Admin access & cache refresh · existing
Admin only area (404 for everyone else) with a button to refresh the catalogue cache. Real editing comes in Slice 1. code in `src/app/admin/`

## Slice 1: Admin catalogue editing

### 13. Admin product editing · needs a decision
Create and edit products, prices, images, details and categories from `/admin`, so the catalogue no longer depends on the seed file.
**Done when:** an admin can create, edit and archive a product and its category, the storefront shows the change right after saving, and every admin action returns 404 for non admins.
- [ ] Design it (spec): `/architect admin product editing`

### 14. Admin stock by size · needs a decision
Set and adjust stock for each size of a product, safely alongside checkout taking stock off.
**Done when:** an admin can set the quantity for each size, the product page reflects it right away, and an admin edit never overwrites a sale that happened at the same moment.
- [ ] Design it (spec): `/architect admin stock by size`

## Slice 2: Checkout & orders

### 15. Orders data model · needs a decision · GA
Orders and order lines that freeze the price, name and size at purchase, plus addresses, status, and support for guest and signed in buyers.
**Done when:** an order keeps its prices and items even after the product changes, and its status moves through a defined lifecycle (placed, paid, shipped, refunded, cancelled).
- [ ] Design it (spec): `/architect orders data model`

### 16. Shipping & tax in the Philippines · needs a decision · GA
Domestic shipping rates (for example Metro Manila vs provincial zones) and how the 12% VAT shows on prices and receipts.
**Done when:** a shopper anywhere in the Philippines sees the shipping cost and tax before paying, and checkout refuses an address outside the Philippines.
- [ ] Design it (spec): `/architect shipping & tax in the philippines`

### 17. Checkout & payment · needs a decision · GA
Bag to address to payment to confirmation, for guests and signed in customers, taking stock off only when payment succeeds.
**Done when:** a shopper can pay for their bag and land on a confirmation page, stock drops with a conditional update so it never goes negative, the bag empties, and a failed or abandoned payment creates no paid order.
- [ ] Design it (spec): `/architect checkout & payment`

## Slice 3: After purchase

### 18. Transactional email · needs a decision
Order confirmation, shipping updates, password reset and email verification.
**Done when:** a buyer gets a confirmation email after paying, a user can reset a forgotten password by email, and a new account verifies its address.
- [ ] Design it (spec): `/architect transactional email`

### 19. Order history in account · needs a decision
Signed in customers see their past orders and where each one stands.
**Done when:** `/account` lists the customer's orders with status and totals, each order opens to its items, and nobody can see another customer's order.
- [ ] Design it (spec): `/architect order history in account`

### 20. Admin order management · needs a decision · GA
Admins see every order, mark orders shipped, and issue refunds or cancellations.
**Done when:** an admin can find an order, mark it shipped (which emails the buyer), and refund or cancel it with stock returned, and every action is admin only.
- [ ] Design it (spec): `/architect admin order management`

### 26. Promo codes & discounts · needs a decision · GA
Percent or fixed amount codes that admins create and shoppers enter at checkout, for launch and seasonal campaigns.
**Done when:** a shopper can apply a valid code and see the discount before paying, expired or used up codes are refused with a clear message, the order keeps the discount it was paid with, and only admins can create codes.
- [ ] Design it (spec): `/architect promo codes & discounts`

## Slice 4: Launch readiness

### 21. Legal pages & cookie consent · needs a decision · GA
Privacy policy, terms of sale and accessibility statement, plus a cookie consent banner that tracking respects.
**Done when:** the footer legal links open real pages, and no non essential cookie or tracker loads before the visitor agrees.
- [ ] Design it (spec): `/architect legal pages & cookie consent`

### 22. Client service pages · needs a decision
Shipping, returns, size guide, care and a contact page, so the footer links stop leading nowhere.
**Done when:** every client service footer link opens a real page, and a visitor can send a message from the contact page.
- [ ] Design it (spec): `/architect client service pages`

### 23. SEO extras
Sitemap, robots file, product structured data, social cards and a branded 404 page.
**Done when:** the sitemap lists every product and collection, product pages carry valid structured data, admin and account pages are not indexed, and unknown URLs show the 404 page.
- [ ] Build it: `/develop seo extras`

### 24. Analytics & error monitoring · needs a decision
Track the buying funnel (view, add to bag, checkout, purchase) and get alerted when something breaks.
**Done when:** funnel events are recorded only after consent, a purchase shows up with its value, and server and client errors raise an alert.
- [ ] Design it (spec): `/architect analytics & error monitoring`

### 25. Filter & sort listings · needs a decision
Filter collections and search results by size in stock, price and category, and sort by newest or price.
**Done when:** a shopper can combine filters and a sort, the URL reflects them so a filtered view can be shared, an empty result shows a clear message, and listing pages stay fast.
- [ ] Design it (spec): `/architect filter & sort listings`

## Deferred
Out of scope for the current build pass, kept so the plan stays honest.
- **Journal**: editorial stories (the home page and footer already link to `/journal`) · needs a decision
- **Brand pages**: about, sustainability, careers (linked from the footer)
- **More countries & currencies**: selling outside the Philippines, with prices beyond PHP · needs a decision · GA
- **Guest order lookup**: track an order with email and order number, no account needed · needs a decision
- **Account deletion & data export**: self serve data rights under the Philippine Data Privacy Act · needs a decision · GA
- **Wishlists**: save products for later · needs a decision
- **Reviews**: customer product reviews · needs a decision
- **Product variants**: colour or material options with their own price · needs a decision

## Legend

**The decision box.** Every feature carries exactly one, the sub task whose label ends with `(spec)`. Its wording varies (`Design it (spec)` normally), so skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

**Feature lifecycle**: the scope updates as a feature moves; each row is what it shows and who sets it:

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | **`/architect` at spec capture** | `Design it` ticked; spec linked; `Build it: /develop <feature>` + **2 to 5 milestones**; the tier's closing boxes (`Verify it` Alpha+, `Test it` Beta+, `Review it` + `Document it` GA); any surfaced follow up enrolled |
| `in-progress` (building) | `/develop` | milestone sub boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` + milestones ticked; `Verify it` ticked |
| `done` | **you, when you decide it is** (any skill sets it when you say so); `/sync` reconciles | boxes you ran ticked, skipped ones marked skipped; the tier's last stage (`Prototype` → after `/develop`; `Alpha` → after `/check verify`; `Beta`/`GA` → after `/test`) is the suggested point to call it done; `/sync` captures conventions |

- **Next step** = the first unticked box (always a command or a tracked milestone).
- **needs a decision** = run `/architect` first; otherwise straight to `/develop` (or `/audit` for standards & tooling). The tag drops once the spec is captured.
- **Atomic build tasks live in the spec's `## Build plan`, not here**: the scope carries only the milestone rollup.
- **Status** `planned` → `in-progress` → `done`, plus `existing` (built before this workflow) and `dropped` (taken out of scope, kept for history).
- **Approach tag** beside a heading (e.g. `· Facade`) overrides the project default for that feature; no tag = inherits it.
- **Workflow tier tag** beside a heading (e.g. `· GA`) sets that one feature's rigor above or below the project default; no tag inherits the default. It decides the feature's check boxes and each skill's next suggestion.
- **Workflow** (header line) is the project default, what runs after `/develop`: **Prototype** = nothing (trust develop's own build time self check); **Alpha** = `/check verify`; **Beta** = `/check verify` then `/test`; **GA** = adds a fresh model `/check review` then `/document`. A feature built on an unratified decision (an `Assumed` spec) stays flagged, but that never blocks `done`.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.
