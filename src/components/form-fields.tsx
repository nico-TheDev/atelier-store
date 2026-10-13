"use client";

import { useId, useState, type ComponentProps, type ReactNode } from "react";

// Mirrors emailAndPassword in src/lib/auth.ts; the server enforces it too.
export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 128;
export const NAME_MAX = 100;

export type FieldProps = {
  name: string;
  error?: string;
  hint?: string;
  onBlur: (value: string) => void;
  onChange: (value: string) => void;
};

type InputProps = Omit<
  ComponentProps<"input">,
  "name" | "onBlur" | "onChange" | "className" | "id"
>;

/* Label, underline input, and a hint that the error replaces when present. */
export function TextField({
  name,
  label,
  error,
  hint,
  onBlur,
  onChange,
  trailing,
  ...input
}: FieldProps & InputProps & { label: string; trailing?: ReactNode }) {
  const id = useId();
  const describedBy = error || hint ? `${id}-message` : undefined;

  return (
    <div className="stack gap-1">
      <label htmlFor={id} className="type-label">
        {label}
      </label>
      <div className="relative">
        <input
          {...input}
          id={id}
          name={name}
          className={`field ${trailing ? "pr-14" : ""}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onBlur={(event) => onBlur(event.currentTarget.value)}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
        {trailing}
      </div>
      {(error || hint) && (
        <p id={describedBy} className={`type-caption ${error ? "text-sale" : ""}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export function PasswordField({
  label = "Password",
  ...props
}: FieldProps & InputProps & { label?: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      label={label}
      type={visible ? "text" : "password"}
      maxLength={PASSWORD_MAX}
      spellCheck={false}
      autoCapitalize="none"
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="type-label absolute inset-y-0 right-0 flex items-center pl-3 text-muted transition-colors duration-(--duration-fast) hover:text-ink disabled:cursor-not-allowed disabled:text-subtle"
        >
          {visible ? "Hide" : "Show"}
        </button>
      }
    />
  );
}
