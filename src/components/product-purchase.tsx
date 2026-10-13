import { AddToBagForm } from "./add-to-bag-form";
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

/* Sizes and the bag action; the form itself is a client component. */
export function ProductPurchase({ product }: { product: Product }) {
  return (
    <div className="stack gap-6">
      <AddToBagForm
        productId={product.id}
        stock={product.stock}
        soldOut={getStockState(product).status === "sold-out"}
      />
      <p className="type-caption">
        Complimentary express shipping and returns within 30 days.
      </p>
    </div>
  );
}
