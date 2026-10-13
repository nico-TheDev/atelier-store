"use client";

import { useFormStatus } from "react-dom";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { removeFromBag, updateBagQuantity } from "./actions";

type LineKey = { productId: number; size: string };

function LineFields({ productId, size }: LineKey) {
  return (
    <>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="size" value={size} />
    </>
  );
}

/*
 * − and + are plain submit buttons carrying the next quantity, so the
 * stepper works without JavaScript. The server clamps to live stock again;
 * disabling + at `max` is a convenience, not the check.
 */
export function QuantityStepper({
  productId,
  size,
  quantity,
  max,
  limitNote,
  label,
}: LineKey & {
  quantity: number;
  max: number;
  /* Why + is disabled once the line reaches `max`; omit when the line already says. */
  limitNote?: string;
  label: string;
}) {
  const noteId = `limit-${productId}-${size}`;

  return (
    <form action={updateBagQuantity} className="stack gap-1.5">
      <LineFields productId={productId} size={size} />
      <Stepper
        quantity={quantity}
        max={max}
        label={label}
        noteId={limitNote ? noteId : undefined}
      />
      {limitNote && quantity >= max && (
        <p id={noteId} className="type-caption">
          {limitNote}
        </p>
      )}
    </form>
  );
}

function Stepper({
  quantity,
  max,
  label,
  noteId,
}: {
  quantity: number;
  max: number;
  label: string;
  noteId?: string;
}) {
  const { pending, data } = useFormStatus();
  // show the submitted value while the action runs
  const shown = pending ? Number(data?.get("quantity")) || quantity : quantity;
  const atMax = quantity >= max;

  return (
    <div
      role="group"
      aria-label={`Quantity: ${label}`}
      aria-busy={pending}
      className="flex h-10 w-fit items-center border border-line-strong"
    >
      <button
        type="submit"
        name="quantity"
        value={quantity - 1}
        disabled={pending || quantity <= 1}
        aria-label="Decrease quantity"
        className={stepButton}
      >
        <MinusIcon width={14} height={14} />
      </button>
      <output
        aria-live="polite"
        className={`w-8 text-center type-body tabular-nums ${pending ? "text-muted" : ""}`}
      >
        {shown}
      </output>
      <button
        type="submit"
        name="quantity"
        value={quantity + 1}
        disabled={pending || atMax}
        aria-label="Increase quantity"
        aria-describedby={atMax ? noteId : undefined}
        className={stepButton}
      >
        <PlusIcon width={14} height={14} />
      </button>
    </div>
  );
}

const stepButton =
  "flex size-10 cursor-pointer items-center justify-center transition-colors duration-(--duration-fast) not-disabled:hover:bg-surface disabled:cursor-not-allowed disabled:text-subtle";

export function RemoveButton({ productId, size, label }: LineKey & { label: string }) {
  return (
    <form action={removeFromBag}>
      <LineFields productId={productId} size={size} />
      <RemoveSubmit label={label} />
    </form>
  );
}

function RemoveSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="type-caption link cursor-pointer disabled:cursor-wait disabled:text-subtle"
    >
      {pending ? "Removing…" : "Remove"}
      <span className="sr-only"> {label}</span>
    </button>
  );
}
