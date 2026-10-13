/*
 * Catalogue reads for the storefront. Every query is cached and tagged so
 * pages stay prerendered under Cache Components; writes to the catalogue
 * should call updateTag/revalidateTag("products") (or `product:${slug}`).
 */
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { categories, type ProductRow } from "@/db/schema";
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

/* A category and its products, newest first. */
export async function getCategory(
  slug: string,
): Promise<{ slug: string; name: string; products: Product[] } | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const row = await db.query.categories.findFirst({
    where: (categories, { eq }) => eq(categories.slug, slug),
    columns: { slug: true, name: true },
    with: {
      products: {
        with: withRelations,
        orderBy: (products, { asc, desc }) => [
          desc(products.createdAt),
          asc(products.id),
        ],
      },
    },
  });
  if (!row) return null;

  return { slug: row.slug, name: row.name, products: row.products.map(toProduct) };
}

export async function getCategorySlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const rows = await db.query.categories.findMany({ columns: { slug: true } });
  return rows.map((row) => row.slug);
}

/*
 * Case-insensitive keyword search. Every word must match the name, colour,
 * category or description, so "black jacket" narrows rather than widens.
 */
export async function searchProducts(query: string): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const rows = await db.query.products.findMany({
    where: (products, { and, ilike, inArray, or }) =>
      and(
        ...terms.map((term) => {
          const pattern = `%${term.replace(/[\\%_]/g, "\\$&")}%`;
          return or(
            ilike(products.name, pattern),
            ilike(products.color, pattern),
            ilike(products.description, pattern),
            inArray(
              products.categoryId,
              db
                .select({ id: categories.id })
                .from(categories)
                .where(ilike(categories.name, pattern)),
            ),
          );
        }),
      ),
    with: withRelations,
    orderBy: (products, { asc, desc }) => [
      desc(products.createdAt),
      asc(products.id),
    ],
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
