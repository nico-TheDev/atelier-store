import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { BagIcon } from "@/components/icons";
import { getBag, MAX_QTY_PER_LINE, type BagLine } from "@/lib/cart";
import { formatPrice, lowStockThreshold } from "@/lib/catalog";
import { QuantityStepper, RemoveButton } from "./line-controls";

export const metadata: Metadata = {
  title: "Shopping bag",
  robots: { index: false },
};

/*
 * The heading is prerendered; the bag reads its cookie and live price and
 * stock, so it streams in behind Suspense (Cache Components).
 */
export default function BagPage() {
  return (
    <main className="flex-1">
      <div className="container-content section stack gap-10 lg:gap-14">
        <h1 className="type-heading-1">Shopping bag</h1>
        <Suspense fallback={<BagSkeleton />}>
          <BagContents />
        </Suspense>
      </div>
    </main>
  );
}

async function BagContents() {
  const bag = await getBag();

  if (bag.lines.length === 0) {
    return (
      <div className="hairline stack items-center gap-6 py-16 text-center">
        <BagIcon width={32} height={32} className="text-subtle" />
        <div className="stack gap-2">
          <p className="type-editorial">Your bag is empty.</p>
          <p className="type-caption">Pieces you add will be kept here for 30 days.</p>
        </div>
        <Link href="/collections/new-in" className="btn btn-secondary">
          Shop new arrivals
        </Link>
      </div>
    );
  }

  const changed = bag.lines.some((line) => line.status !== "ok");

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
      <section aria-labelledby="bag-items" className="stack gap-6">
        <h2 id="bag-items" className="sr-only">
          Items
        </h2>
        {changed && (
          <p role="status" className="border border-warning px-4 py-3 text-sm text-warning">
            Availability has changed since you added some pieces. We&rsquo;ve updated your bag.
          </p>
        )}
        <ul className="hairline">
          {bag.lines.map((line) => (
            <li key={`${line.productId}:${line.size}`} className="hairline-b py-6">
              <BagItem line={line} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="bag-summary" className="lg:sticky lg:top-header lg:self-start">
        <div className="stack gap-5 bg-surface p-6">
          <h2 id="bag-summary" className="type-label">
            Summary
          </h2>
          <dl className="stack gap-3 type-body">
            <div className="flex justify-between gap-4">
              <dt>
                Subtotal
                <span className="type-caption block">
                  {bag.count} {bag.count === 1 ? "item" : "items"}
                </span>
              </dt>
              <dd className="tabular-nums" aria-live="polite">
                {formatPrice(bag.subtotal)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Shipping</dt>
              <dd>Complimentary</dd>
            </div>
          </dl>
          {bag.lines.some((line) => line.status === "unavailable") && (
            <p className="type-caption text-sale">Unavailable pieces aren&rsquo;t included.</p>
          )}
          <p className="type-caption">Taxes are calculated at checkout.</p>
          <Link href="/collections/new-in" className="btn btn-secondary btn-block">
            Continue shopping
          </Link>
        </div>
      </section>
    </div>
  );
}

function BagItem({ line }: { line: BagLine }) {
  const { product } = line;
  const unavailable = line.status === "unavailable";
  const name = product?.name ?? "Unavailable item";
  const label = `${name}, size ${line.size}`;
  const stock = product?.stock.find((s) => s.size === line.size)?.quantity ?? 0;
  const lowStock = line.status === "ok" && stock <= lowStockThreshold;

  return (
    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-6">
      <div className={`media aspect-product ${unavailable ? "opacity-50 grayscale" : ""}`}>
        {product && (
          <Image src={product.image.src} alt="" fill sizes="7rem" className="object-cover" />
        )}
      </div>

      <div className="stack gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className={`stack gap-1 ${unavailable ? "text-muted" : ""}`}>
            <h3 className="type-product">
              {product ? (
                <Link href={`/products/${product.slug}`} className="link-quiet">
                  {product.name}
                </Link>
              ) : (
                name
              )}
            </h3>
            {product && <p className="type-caption">{product.color}</p>}
            <p className="type-caption">Size: {line.size}</p>
            {product && (
              <p className="type-caption tabular-nums">
                {formatPrice(product.price)}
                <span className="sr-only"> each</span>
              </p>
            )}
          </div>
          {!unavailable && (
            <p className="type-price tabular-nums">{formatPrice(line.total)}</p>
          )}
        </div>

        <LineNotice line={line} stock={stock} lowStock={lowStock} />

        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          {unavailable ? (
            product && stock === 0 && product.stock.some((s) => s.quantity > 0) ? (
              <Link href={`/products/${product.slug}`} className="type-caption link">
                Choose another size
              </Link>
            ) : (
              <span />
            )
          ) : (
            <QuantityStepper
              productId={line.productId}
              size={line.size}
              quantity={line.quantity}
              max={line.max}
              label={label}
              limitNote={
                lowStock || line.status === "adjusted"
                  ? undefined
                  : stock <= MAX_QTY_PER_LINE
                  ? `Only ${stock} available in this size.`
                  : `Limit of ${MAX_QTY_PER_LINE} per piece.`
              }
            />
          )}
          <div className="flex h-10 items-center">
            <RemoveButton productId={line.productId} size={line.size} label={label} />
          </div>
        </div>
      </div>
    </div>
  );
}

const noticeTone = { warning: "text-warning", sale: "text-sale" };

/* One stock message per line, in the same dot-and-caption style as the product page. */
function LineNotice({ line, stock, lowStock }: { line: BagLine; stock: number; lowStock: boolean }) {
  let notice: { tone: keyof typeof noticeTone; text: string } | null = null;
  if (line.status === "unavailable") {
    const sizeExists = line.product?.stock.some((s) => s.size === line.size);
    notice = {
      tone: "sale",
      text: sizeExists
        ? "Sold out in this size. It isn’t included in your subtotal."
        : "No longer available. It isn’t included in your subtotal.",
    };
  } else if (line.status === "adjusted") {
    notice = {
      tone: "warning",
      text: `Only ${line.max} available, so we’ve changed the quantity from ${line.requested}.`,
    };
  } else if (lowStock) {
    notice = { tone: "warning", text: `Only ${stock} left in this size.` };
  }
  if (!notice) return null;

  return (
    <p className={`type-caption flex items-baseline gap-2 ${noticeTone[notice.tone]}`}>
      <span aria-hidden="true" className="size-1.5 shrink-0 translate-y-[-0.1em] rounded-full bg-current" />
      {notice.text}
    </p>
  );
}

function BagSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
      <div className="hairline">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="hairline-b grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 py-6 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-6">
            <div className="media aspect-product" />
            <div className="stack gap-2">
              <div className="h-4 w-1/2 bg-surface" />
              <div className="h-4 w-1/4 bg-surface" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-56 bg-surface" />
    </div>
  );
}
