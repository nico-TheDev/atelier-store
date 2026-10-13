import Link from "next/link";
import { getStockState, type Product } from "@/lib/catalog";

const stockTone = {
  "in-stock": "text-success",
  "low-stock": "text-warning",
  "sold-out": "text-sale",
};

export function StockIndicator({ product }: { product: Product }) {
  const stock = getStockState(product);
  return (
    <p className={`type-caption flex items-center gap-2 ${stockTone[stock.status]}`}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {stock.label}
    </p>
  );
}

/*
 * Size selection and the bag action. Sizes are native radios styled as
 * chips, so selection works without client JavaScript.
 */
export function ProductPurchase({ product }: { product: Product }) {
  const soldOut = getStockState(product).status === "sold-out";
  const oneSize = product.stock.length === 1;

  return (
    <div className="stack gap-6">
      {oneSize ? (
        <p className="type-label">{product.stock[0].size}</p>
      ) : (
        <fieldset>
          {/* A floated legend joins normal flow, so it can share a row. */}
          <legend className="type-label float-left">Size</legend>
          <Link
            href="/client-services/size-guide"
            className="type-caption link float-right"
          >
            Size guide
          </Link>
          <div className="clear-both pt-3 grid grid-cols-[repeat(auto-fill,minmax(3.25rem,1fr))] gap-1.5">
            {product.stock.map((entry) => (
              <label
                key={entry.size}
                className="type-label flex h-11 cursor-pointer items-center justify-center border border-line-strong transition-colors duration-(--duration-fast) not-has-disabled:hover:border-ink has-checked:border-ink has-checked:bg-ink has-checked:text-paper has-focus-visible:outline has-focus-visible:outline-offset-2 has-focus-visible:outline-ink has-disabled:cursor-not-allowed has-disabled:border-line has-disabled:text-subtle has-disabled:line-through"
              >
                <input
                  type="radio"
                  name="size"
                  value={entry.size}
                  disabled={entry.quantity === 0}
                  className="sr-only"
                />
                {entry.size}
                {entry.quantity === 0 && <span className="sr-only">, sold out</span>}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {soldOut ? (
        <button type="button" className="btn btn-lg btn-block" disabled>
          Sold out
        </button>
      ) : (
        <button type="button" className="btn btn-primary btn-lg btn-block">
          Add to bag
        </button>
      )}

      <p className="type-caption">
        Complimentary express shipping and returns within 30 days.
      </p>
    </div>
  );
}
