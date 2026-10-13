/*
 * Live product data for the bag. Unlike the catalogue reads in ./catalog.ts
 * these are deliberately NOT cached: the bag must show the current price and
 * validate against current stock, and a cached read can be hours old. Call
 * them only inside a <Suspense> boundary or a server action.
 */
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import type { Picture } from "@/lib/catalog";

export type CartProduct = {
  id: number;
  slug: string;
  name: string;
  color: string;
  /* USD cents, as stored now. */
  price: number;
  image: Picture;
  /* One entry per size, in display order. */
  stock: { size: string; quantity: number }[];
};

export async function getCartProducts(ids: number[]): Promise<Map<number, CartProduct>> {
  if (ids.length === 0) return new Map();

  const rows = await db.query.products.findMany({
    where: inArray(products.id, ids),
    columns: { id: true, slug: true, name: true, color: true, priceCents: true, images: true },
    with: {
      stock: {
        columns: { size: true, quantity: true },
        orderBy: (stock, { asc }) => [asc(stock.sortOrder)],
      },
    },
  });

  return new Map(
    rows.map((row) => [
      row.id,
      {
        id: row.id,
        slug: row.slug,
        name: row.name,
        color: row.color,
        price: row.priceCents,
        image: row.images[0],
        stock: row.stock,
      },
    ]),
  );
}
