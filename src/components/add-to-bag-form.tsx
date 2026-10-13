"use client";

import Link from "next/link";
import { useActionState } from "react";
import { addToBag, type AddToBagState } from "@/app/bag/actions";

/*
 * Size selection and the bag action. Sizes are native radios styled as
 * chips, and the form posts to a server action, so adding to the bag works
 * without client JavaScript. The server validates size and stock; nothing
 * here is trusted.
 */
export function AddToBagForm({
  productId,
  stock,
  soldOut,
}: {
  productId: number;
  stock: { size: string; quantity: number }[];
  soldOut: boolean;
}) {
  const [state, action, pending] = useActionState<AddToBagState, FormData>(addToBag, null);
  const oneSize = stock.length === 1;

  return (
    <form action={action} className="stack gap-6">
      <input type="hidden" name="productId" value={productId} />
      {oneSize ? (
        <>
          <input type="hidden" name="size" value={stock[0].size} />
          <p className="type-label">{stock[0].size}</p>
        </>
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
            {stock.map((entry) => (
              <label
                key={entry.size}
                className="type-label flex h-11 cursor-pointer items-center justify-center border border-line-strong transition-colors duration-(--duration-fast) not-has-disabled:hover:border-ink has-checked:border-ink has-checked:bg-ink has-checked:text-paper has-focus-visible:outline has-focus-visible:outline-offset-2 has-focus-visible:outline-ink has-disabled:cursor-not-allowed has-disabled:border-line has-disabled:text-subtle has-disabled:line-through"
              >
                <input
                  type="radio"
                  name="size"
                  value={entry.size}
                  disabled={entry.quantity === 0}
                  // React resets the form after the action; this keeps the choice
                  defaultChecked={state?.size === entry.size}
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
        <button
          type="submit"
          className="btn btn-primary btn-lg btn-block"
          disabled={pending}
          aria-describedby="add-to-bag-status"
        >
          {pending ? "Adding…" : "Add to bag"}
        </button>
      )}

      <p
        id="add-to-bag-status"
        role="status"
        className={`type-caption empty:hidden ${state?.tone === "error" ? "text-sale" : "text-success"}`}
      >
        {state && !pending && (
          <>
            {state.message}
            {state.tone === "success" && (
              <>
                {" "}
                <Link href="/bag" className="link text-ink">
                  View bag
                </Link>
              </>
            )}
          </>
        )}
      </p>
    </form>
  );
}
