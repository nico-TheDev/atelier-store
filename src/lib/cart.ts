import "server-only";

import { cookies } from "next/headers";

import { getCartProducts, type CartProduct } from "@/db/queries/cart";

/*
 * The bag lives in one httpOnly cookie that holds only what was chosen:
 * product id, size and quantity. Prices, names and stock are never stored
 * here; they're read live from the database whenever the bag is shown or
 * changed, so an edited cookie can't change what anything costs.
 */

export type CartItem = { productId: number; size: string; quantity: number };

export const MAX_LINES = 20;
export const MAX_QTY_PER_LINE = 10;
const MAX_SIZE_LENGTH = 40;

const COOKIE = "atelier_bag";
const MAX_AGE = 60 * 60 * 24 * 30;

type Stored = { p: number; s: string; q: number };

export function isValidSize(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= MAX_SIZE_LENGTH;
}

function isStored(value: unknown): value is Stored {
  if (typeof value !== "object" || value === null) return false;
  const { p, s, q } = value as Record<string, unknown>;
  return (
    Number.isSafeInteger(p) &&
    (p as number) > 0 &&
    isValidSize(s) &&
    Number.isSafeInteger(q) &&
    (q as number) >= 1 &&
    (q as number) <= MAX_QTY_PER_LINE
  );
}

/* Anything malformed counts as an empty bag; bad entries are dropped. */
function parse(raw: string | undefined): CartItem[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  const items: CartItem[] = [];
  for (const entry of data) {
    if (!isStored(entry)) continue;
    if (items.some((i) => i.productId === entry.p && i.size === entry.s)) continue;
    items.push({ productId: entry.p, size: entry.s, quantity: entry.q });
    if (items.length === MAX_LINES) break;
  }
  return items;
}

export async function readCart(): Promise<CartItem[]> {
  return parse((await cookies()).get(COOKIE)?.value);
}

/* Server actions only: cookies can't be set while a page renders. */
export async function writeCart(items: CartItem[]) {
  const jar = await cookies();
  if (items.length === 0) {
    jar.delete(COOKIE);
    return;
  }
  const stored: Stored[] = items.map((i) => ({ p: i.productId, s: i.size, q: i.quantity }));
  jar.set(COOKIE, JSON.stringify(stored), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export type BagLine = {
  productId: number;
  size: string;
  product: CartProduct | null;
  /* What the cookie asked for. */
  requested: number;
  /* What can actually be bought: requested, clamped to stock. 0 when unavailable. */
  quantity: number;
  /* Highest quantity the line may be set to now. */
  max: number;
  status: "ok" | "adjusted" | "unavailable";
  /* USD cents: live price × quantity. */
  total: number;
};

export type Bag = {
  lines: BagLine[];
  /* USD cents, available lines only. */
  subtotal: number;
  count: number;
  /* The bag as it can be persisted: unavailable lines dropped, quantities clamped. */
  items: CartItem[];
};

/*
 * Reconciles the cookie against live product data. Stock can change after
 * something was added, so every render and every action goes through here:
 * missing products or sizes and sold-out sizes become unavailable, and
 * quantities above stock are clamped. Prices only ever come from `products`.
 */
export function buildBag(items: CartItem[], products: Map<number, CartProduct>): Bag {
  const lines = items.map((item): BagLine => {
    const product = products.get(item.productId) ?? null;
    const stock = product?.stock.find((s) => s.size === item.size)?.quantity ?? 0;
    const max = Math.min(stock, MAX_QTY_PER_LINE);
    const quantity = Math.min(item.quantity, max);
    const status = quantity === 0 ? "unavailable" : quantity < item.quantity ? "adjusted" : "ok";
    return {
      productId: item.productId,
      size: item.size,
      product,
      requested: item.quantity,
      quantity,
      max,
      status,
      total: product ? product.price * quantity : 0,
    };
  });

  return {
    lines,
    subtotal: lines.reduce((sum, line) => sum + line.total, 0),
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    items: lines
      .filter((line) => line.quantity > 0)
      .map(({ productId, size, quantity }) => ({ productId, size, quantity })),
  };
}

/* The current bag, reconciled against live price and stock. */
export async function getBag(): Promise<Bag> {
  const items = await readCart();
  return buildBag(items, await getCartProducts(items.map((i) => i.productId)));
}
