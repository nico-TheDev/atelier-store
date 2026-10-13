"use server";

import { getCartProducts } from "@/db/queries/cart";
import {
  buildBag,
  isValidSize,
  MAX_LINES,
  MAX_QTY_PER_LINE,
  readCart,
  writeCart,
  type CartItem,
} from "@/lib/cart";

/*
 * Bag mutations. Each one accepts only ids, sizes and quantities, never a
 * price. It re-reads live stock, reconciles the whole bag (so lines that
 * went out of stock are dropped or clamped), validates the change and only
 * then writes the cookie. Setting the cookie re-renders the current route,
 * so the header count and the bag page update in the same round trip.
 */

export type AddToBagState = { tone: "success" | "error"; message: string; size?: string } | null;

function parseProductId(formData: FormData) {
  const id = Number(formData.get("productId"));
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function parseSize(formData: FormData) {
  const size = formData.get("size");
  return isValidSize(size) ? size : null;
}

/* Reconciled bag plus live data for `extraId` (the product being added). */
async function loadBag(extraId?: number) {
  const items = await readCart();
  const ids = items.map((i) => i.productId);
  if (extraId) ids.push(extraId);
  const products = await getCartProducts([...new Set(ids)]);
  return { bag: buildBag(items, products), products };
}

function inSize(size: string) {
  return size === "One size" ? "" : ` in ${size}`;
}

export async function addToBag(_prev: AddToBagState, formData: FormData): Promise<AddToBagState> {
  const productId = parseProductId(formData);
  const size = parseSize(formData);
  if (!productId) return { tone: "error", message: "This item is no longer available." };
  if (!size) return { tone: "error", message: "Select a size." };

  const { bag, products } = await loadBag(productId);
  const product = products.get(productId);
  const stock = product?.stock.find((s) => s.size === size);
  if (!product || !stock) {
    return { tone: "error", message: "This item is no longer available.", size };
  }
  if (stock.quantity === 0) {
    return { tone: "error", message: `Sold out${inSize(size)}.`, size };
  }

  const items: CartItem[] = bag.items;
  const existing = items.find((i) => i.productId === productId && i.size === size);
  const inBag = existing?.quantity ?? 0;
  const limit = Math.min(stock.quantity, MAX_QTY_PER_LINE);

  if (inBag + 1 > limit) {
    const reason =
      stock.quantity <= MAX_QTY_PER_LINE
        ? `Only ${stock.quantity} available${inSize(size)}`
        : `You can add up to ${MAX_QTY_PER_LINE} of each piece`;
    return {
      tone: "error",
      message: `${reason}, and ${inBag === 1 ? "it's" : `all ${inBag} are`} already in your bag.`,
      size,
    };
  }
  if (!existing && items.length >= MAX_LINES) {
    return { tone: "error", message: `Your bag can hold up to ${MAX_LINES} pieces.`, size };
  }

  if (existing) existing.quantity += 1;
  else items.push({ productId, size, quantity: 1 });
  await writeCart(items);

  return { tone: "success", message: "Added to your bag.", size };
}

/* Sets a line's quantity, clamped to live stock; 0 or less removes it. */
export async function updateBagQuantity(formData: FormData) {
  const productId = parseProductId(formData);
  const size = parseSize(formData);
  const quantity = Number(formData.get("quantity"));
  if (!productId || !size || !Number.isSafeInteger(quantity)) return;

  const { bag } = await loadBag();
  const line = bag.lines.find((l) => l.productId === productId && l.size === size);
  if (!line) return;

  const next = Math.min(quantity, line.max);
  const items = bag.items.flatMap((item) =>
    item.productId === productId && item.size === size
      ? next > 0
        ? [{ ...item, quantity: next }]
        : []
      : [item],
  );
  await writeCart(items);
}

export async function removeFromBag(formData: FormData) {
  const productId = parseProductId(formData);
  const size = parseSize(formData);
  if (!productId || !size) return;

  const { bag } = await loadBag();
  await writeCart(
    bag.items.filter((item) => !(item.productId === productId && item.size === size)),
  );
}
