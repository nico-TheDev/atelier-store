"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import {
  NAME_MAX,
  PASSWORD_MAX,
  PASSWORD_MIN,
  PasswordField,
  TextField,
} from "@/components/form-fields";
import { authClient } from "@/lib/auth-client";
import { safeRedirect } from "@/lib/safe-redirect";

type Mode = "sign-in" | "sign-up";
type FieldName = "name" | "email" | "password";
type FieldErrors = Partial<Record<FieldName, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const copy = {
  "sign-in": { submit: "Sign in", pending: "Signing in…" },
  "sign-up": { submit: "Create account", pending: "Creating account…" },
};

function validateField(mode: Mode, field: FieldName, raw: string) {
  const value = field === "password" ? raw : raw.trim();
  switch (field) {
    case "name":
      if (!value) return "Enter your name.";
      if (value.length > NAME_MAX) return `Use ${NAME_MAX} characters or fewer.`;
      return undefined;
    case "email":
      if (!value) return "Enter your email address.";
      if (!EMAIL_PATTERN.test(value)) return "Enter an email address like name@example.com.";
      return undefined;
    case "password":
      if (!value) return "Enter your password.";
      if (mode === "sign-in") return undefined;
      if (value.length < PASSWORD_MIN) {
        return `Use at least ${PASSWORD_MIN} characters.`;
      }
      if (value.length > PASSWORD_MAX) return `Use ${PASSWORD_MAX} characters or fewer.`;
      return undefined;
  }
}

/* A form-wide message, optionally with a follow-up link (e.g. "Sign in instead"). */
type FormError = { message: string; action?: { href: string; label: string } };

type ServerError = { status: number; code?: string };

/*
 * Field-specific failures land on their field; everything else becomes one
 * form-level message. Sign-in never says which of email or password was wrong.
 */
function describeServerError(
  mode: Mode,
  error: ServerError,
  signInHref: string,
): { field?: FieldName; message: string; action?: FormError["action"] } {
  if (error.status === 429) {
    return { message: "Too many attempts. Please wait a minute and try again." };
  }
  switch (error.code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return { message: "That email and password don't match. Check them and try again." };
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return {
        message: "An account with this email already exists.",
        action: { href: signInHref, label: "Sign in instead" },
      };
    case "INVALID_EMAIL":
      return { field: "email", message: "Enter an email address like name@example.com." };
    case "PASSWORD_TOO_SHORT":
      return { field: "password", message: `Use at least ${PASSWORD_MIN} characters.` };
    case "PASSWORD_TOO_LONG":
      return { field: "password", message: `Use ${PASSWORD_MAX} characters or fewer.` };
  }
  return {
    message:
      mode === "sign-in"
        ? "We couldn't sign you in just now. Please try again."
        : "We couldn't create your account just now. Please try again.",
  };
}

/*
 * Talks to /api/auth through authClient rather than a server action, because
 * Better Auth only applies its rate limits and origin checks to HTTP requests.
 * It submits with onSubmit, not a form action, so React doesn't reset the
 * fields when a sign-in fails.
 */
export function AuthForm({ mode, next }: { mode: Mode; next?: string }) {
  const router = useRouter();
  const destination = safeRedirect(next);
  const formRef = useRef<HTMLFormElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<FormError | null>(null);
  const [pending, startTransition] = useTransition();
  // Server errors arrive while the fieldset is still disabled and the alert
  // still hidden, so focus moves once the transition has rendered.
  const focusAfterSubmit = useRef<FieldName | "alert" | null>(null);

  useEffect(() => {
    const target = focusAfterSubmit.current;
    if (pending || !target) return;
    focusAfterSubmit.current = null;
    if (target === "alert") alertRef.current?.focus();
    else focusField(target);
  }, [pending, errors, formError]);

  const nextQuery = next ? `?next=${encodeURIComponent(destination)}` : "";
  const signInHref = `/sign-in${nextQuery}`;
  const otherHref = mode === "sign-in" ? `/sign-up${nextQuery}` : signInHref;
  const fields: FieldName[] =
    mode === "sign-up" ? ["name", "email", "password"] : ["email", "password"];

  function setFieldError(field: FieldName, message: string | undefined) {
    setErrors((current) =>
      current[field] === message ? current : { ...current, [field]: message },
    );
  }

  function focusField(field: FieldName) {
    formRef.current?.querySelector<HTMLInputElement>(`[name="${field}"]`)?.focus();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(
      fields.map((field) => [field, String(form.get(field) ?? "")]),
    ) as Record<FieldName, string>;

    const nextErrors: FieldErrors = {};
    for (const field of fields) {
      nextErrors[field] = validateField(mode, field, values[field]);
    }
    setErrors(nextErrors);
    setFormError(null);

    const firstInvalid = fields.find((field) => nextErrors[field]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    startTransition(async () => {
      const email = values.email.trim();
      let error: ServerError | null;
      try {
        ({ error } =
          mode === "sign-in"
            ? await authClient.signIn.email({
                email,
                password: values.password,
                rememberMe: true,
              })
            : await authClient.signUp.email({
                name: values.name.trim(),
                email,
                password: values.password,
              }));
      } catch {
        error = { status: 0, code: "NETWORK" };
      }

      if (!error) {
        // Stays pending through the navigation, so the button can't be resubmitted.
        router.replace(destination);
        router.refresh();
        return;
      }

      const described =
        error.code === "NETWORK"
          ? { message: "We couldn't reach Sartoria. Check your connection and try again." }
          : describeServerError(mode, error, signInHref);

      if ("field" in described && described.field) {
        setFieldError(described.field, described.message);
        focusAfterSubmit.current = described.field;
      } else {
        setFormError({ message: described.message, action: described.action });
        focusAfterSubmit.current = "alert";
      }
    });
  }

  const fieldProps = (field: FieldName) => ({
    name: field,
    error: errors[field],
    onBlur: (value: string) => {
      // Don't nag about an empty field the user only tabbed through.
      if (value || errors[field]) setFieldError(field, validateField(mode, field, value));
    },
    onChange: (value: string) => {
      setFormError(null);
      if (errors[field]) setFieldError(field, validateField(mode, field, value));
    },
  });

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-busy={pending || undefined}
      className="stack gap-8 text-left"
    >
      <div
        ref={alertRef}
        tabIndex={-1}
        role="alert"
        className="empty:hidden border border-sale px-4 py-3 text-sm text-sale outline-none"
      >
        {formError && (
          <p>
            {formError.message}
            {formError.action && (
              <>
                {" "}
                <Link href={formError.action.href} className="link text-ink">
                  {formError.action.label}
                </Link>
              </>
            )}
          </p>
        )}
      </div>

      {/* A disabled fieldset locks every input while the request is in flight. */}
      <fieldset disabled={pending} className="stack gap-8">
        {mode === "sign-up" && (
          <TextField
            {...fieldProps("name")}
            label="Name"
            autoComplete="name"
            maxLength={NAME_MAX}
          />
        )}
        <TextField
          {...fieldProps("email")}
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          autoCapitalize="none"
        />
        <PasswordField
          {...fieldProps("password")}
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          hint={mode === "sign-up" ? `At least ${PASSWORD_MIN} characters.` : undefined}
        />
      </fieldset>

      <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
        {pending ? copy[mode].pending : copy[mode].submit}
      </button>

      <p className="type-caption text-center">
        {mode === "sign-in" ? "New to Sartoria? " : "Already have an account? "}
        <Link href={otherHref} className="link text-ink">
          {mode === "sign-in" ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}
