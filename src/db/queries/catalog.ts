/*
 * Catalogue reads for the storefront. Every query is cached and tagged so
 * pages stay prerendered under Cache Components; writes to the catalogue
 * should call updateTag/revalidateTag("products") (or `product:${slug}`).
 */
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import type { ProductRow } from "@/db/schema";
import type { Product } from "@/lib/catalog";

const withRelations = {
  category: { columns: { slug: true, name: true } },
  stock: {
    columns: { size: true, quantity: true },
    orderBy: (stock, { asc }) => [asc(stock.sortOrder)],
  },
} as const satisfies NonNullable<
  Parameters<typeof db.query.products.findMany>[0]
>["with"];

type ProductWithRelations = ProductRow & {
  category: { slug: string; name: string };
  stock: { size: string; quantity: number }[];
};

function toProduct(row: ProductWithRelations): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    color: row.color,
    price: row.priceCents,
    badge: row.badge,
    categoryId: row.categoryId,
    category: row.category,
    description: row.description,
    details: row.details,
    composition: row.composition,
    stock: row.stock,
    images: row.images,
  };
}

export async function getNewArrivals(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const rows = await db.query.products.findMany({
    with: withRelations,
    orderBy: (products, { asc, desc }) => [
      desc(products.createdAt),
      asc(products.id),
    ],
  });
  return rows.map(toProduct);
}

export async function getProduct(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("products", `product:${slug}`);

  const row = await db.query.products.findFirst({
    where: (products, { eq }) => eq(products.slug, slug),
    with: withRelations,
  });
  return row ? toProduct(row) : null;
}

/* Same category first, then the rest of the catalogue. */
export async function getRelatedProducts(
  product: Pick<Product, "id" | "categoryId">,
  count = 4,
): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const rows = await db.query.products.findMany({
    where: (products, { ne }) => ne(products.id, product.id),
    with: withRelations,
    orderBy: (products, { asc, sql }) => [
      sql`${products.categoryId} = ${product.categoryId} desc`,
      asc(products.id),
    ],
    limit: count,
  });
  return rows.map(toProduct);
}

export async function getProductSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const rows = await db.query.products.findMany({ columns: { slug: true } });
  return rows.map((row) => row.slug);
}
