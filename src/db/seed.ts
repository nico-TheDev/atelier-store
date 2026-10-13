/*
 * Loads the initial catalogue. Safe to re-run: categories and products are
 * upserted by slug, and each seeded product's stock rows are replaced.
 * Run with `pnpm db:seed` after `pnpm db:migrate`.
 *
 * Imports are relative so this runs under tsx, outside Next.
 */
import { config } from "dotenv";

config({ path: [".env.local", ".env"], quiet: true });

async function main() {
  // Imported after the env is loaded: ./index throws without DATABASE_URL.
  const { inArray, sql } = await import("drizzle-orm");
  const { db } = await import("./index");
  const { categories, products, productStock } = await import("./schema");
  const { seedCategories, seedProducts } = await import("./seed-data");

  const categoryRows = await db
    .insert(categories)
    .values(seedCategories.map((c, i) => ({ ...c, sortOrder: i })))
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: sql`excluded.name`,
        sortOrder: sql`excluded.sort_order`,
      },
    })
    .returning({ id: categories.id, slug: categories.slug });
  const categoryId = new Map(categoryRows.map((c) => [c.slug, c.id]));

  const productRows = await db
    .insert(products)
    .values(
      seedProducts.map((p) => ({
        slug: p.slug,
        name: p.name,
        color: p.color,
        priceCents: p.price,
        categoryId: categoryId.get(p.category)!,
        badge: p.badge ?? null,
        description: p.description,
        details: p.details,
        composition: p.composition,
        images: p.images,
      })),
    )
    .onConflictDoUpdate({
      target: products.slug,
      set: {
        name: sql`excluded.name`,
        color: sql`excluded.color`,
        priceCents: sql`excluded.price_cents`,
        categoryId: sql`excluded.category_id`,
        badge: sql`excluded.badge`,
        description: sql`excluded.description`,
        details: sql`excluded.details`,
        composition: sql`excluded.composition`,
        images: sql`excluded.images`,
        updatedAt: sql`now()`,
      },
    })
    .returning({ id: products.id, slug: products.slug });
  const productId = new Map(productRows.map((p) => [p.slug, p.id]));

  const stockRows = seedProducts.flatMap((p) =>
    p.stock.map((s, i) => ({
      productId: productId.get(p.slug)!,
      size: s.size,
      quantity: s.quantity,
      sortOrder: i,
    })),
  );

  // db.batch runs as one transaction on the neon-http driver.
  await db.batch([
    db.delete(productStock).where(inArray(productStock.productId, [...productId.values()])),
    db.insert(productStock).values(stockRows),
  ]);

  console.log(
    `Seeded ${categoryRows.length} categories, ${productRows.length} products, ${stockRows.length} stock rows.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
