"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type FormEvent, type RefObject } from "react";
import {
  NAME_MAX,
  PASSWORD_MAX,
  PASSWORD_MIN,
  PasswordField,
  TextField,
} from "@/components/form-fields";
import { authClient } from "@/lib/auth-client";

/*
 * Both forms talk to /api/auth through authClient, like the sign-in form, so
 * Better Auth's rate limits and origin checks apply.
 */

type ServerError = { status: number; code?: string };
type Feedback = { tone: "error" | "success"; message: string } | null;

async function call(request: () => Promise<{ error: ServerError | null }>) {
  try {
    return (await request()).error;
  } catch {
    return { status: 0, code: "NETWORK" } satisfies ServerError;
  }
}

function genericMessage(error: ServerError, fallback: string) {
  if (error.code === "NETWORK") {
    return "We couldn't reach Sartoria. Check your connection and try again.";
  }
  if (error.status === 429) return "Too many attempts. Please wait a minute and try again.";
  return fallback;
}

/*
 * Server results arrive while the fieldset is still disabled, so focus moves
 * once the transition has rendered: to a field, or to the feedback message.
 */
function useFocusAfterSubmit(
  formRef: RefObject<HTMLFormElement | null>,
  feedbackRef: RefObject<HTMLDivElement | null>,
  pending: boolean,
) {
  const target = useRef<string | null>(null);

  useEffect(() => {
    const next = target.current;
    if (pending || !next) return;
    target.current = null;
    if (next === "feedback") feedbackRef.current?.focus();
    else formRef.current?.querySelector<HTMLInputElement>(`[name="${next}"]`)?.focus();
  });

  return target;
}

/* Form-wide message: an alert for failures, a polite status for success. */
function FormFeedback({
  feedback,
  ref,
}: {
  feedback: Feedback;
  ref: RefObject<HTMLDivElement | null>;
}) {
  const error = feedback?.tone === "error";
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role={error ? "alert" : "status"}
      className={`empty:hidden border px-4 py-3 text-sm outline-none ${
        error ? "border-sale text-sale" : "border-success text-success"
      }`}
    >
      {feedback && <p>{feedback.message}</p>}
    </div>
  );
}

function validateName(raw: string) {
  const value = raw.trim();
  if (!value) return "Enter your name.";
  if (value.length > NAME_MAX) return `Use ${NAME_MAX} characters or fewer.`;
  return undefined;
}

export function ProfileForm({ name }: { name: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const [saved, setSaved] = useState(name);
  const [value, setValue] = useState(name);
  const [error, setError] = useState<string>();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pending, startTransition] = useTransition();
  const focusTarget = useFocusAfterSubmit(formRef, feedbackRef, pending);

  const dirty = value.trim() !== saved;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const invalid = validateName(value);
    setError(invalid);
    setFeedback(null);
    if (invalid) {
      formRef.current?.querySelector<HTMLInputElement>('[name="name"]')?.focus();
      return;
    }

    startTransition(async () => {
      const next = value.trim();
      const failure = await call(() => authClient.updateUser({ name: next }));
      if (failure) {
        setFeedback({
          tone: "error",
          message: genericMessage(failure, "We couldn't save your details just now. Please try again."),
        });
      } else {
        setSaved(next);
        setValue(next);
        setFeedback({ tone: "success", message: "Your details have been saved." });
        // re-reads the session so server-rendered account views show the new name
        router.refresh();
      }
      focusTarget.current = "feedback";
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-busy={pending || undefined}
      className="stack gap-8"
    >
      <FormFeedback feedback={feedback} ref={feedbackRef} />
      <fieldset disabled={pending} className="stack gap-8">
        <TextField
          name="name"
          label="Name"
          autoComplete="name"
          maxLength={NAME_MAX}
          value={value}
          error={error}
          onBlur={(v) => setError(validateName(v))}
          onChange={(v) => {
            setValue(v);
            setFeedback(null);
            if (error) setError(validateName(v));
          }}
        />
      </fieldset>
      <div className="cluster gap-3">
        <button type="submit" className="btn btn-primary max-sm:btn-block" disabled={pending || !dirty}>
          {pending ? "Saving…" : "Save changes"}
        </button>
        {dirty && !pending && (
          <button
            type="button"
            className="btn btn-ghost max-sm:btn-block"
            onClick={() => {
              setValue(saved);
              setError(undefined);
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

type PasswordFieldName = "currentPassword" | "newPassword";
type PasswordErrors = Partial<Record<PasswordFieldName, string>>;

function validatePassword(field: PasswordFieldName, value: string, current = "") {
  if (field === "currentPassword") {
    return value ? undefined : "Enter your current password.";
  }
  if (!value) return "Enter a new password.";
  if (value.length < PASSWORD_MIN) return `Use at least ${PASSWORD_MIN} characters.`;
  if (value.length > PASSWORD_MAX) return `Use ${PASSWORD_MAX} characters or fewer.`;
  if (current && value === current) return "Choose a password different from your current one.";
  return undefined;
}

export function PasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pending, startTransition] = useTransition();
  const focusTarget = useFocusAfterSubmit(formRef, feedbackRef, pending);

  function setFieldError(field: PasswordFieldName, message: string | undefined) {
    setErrors((current) =>
      current[field] === message ? current : { ...current, [field]: message },
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const currentPassword = String(data.get("currentPassword") ?? "");
    const newPassword = String(data.get("newPassword") ?? "");
    const revokeOtherSessions = data.get("revokeOtherSessions") === "on";

    const nextErrors: PasswordErrors = {
      currentPassword: validatePassword("currentPassword", currentPassword),
      newPassword: validatePassword("newPassword", newPassword, currentPassword),
    };
    setErrors(nextErrors);
    setFeedback(null);

    const firstInvalid = (["currentPassword", "newPassword"] as const).find(
      (field) => nextErrors[field],
    );
    if (firstInvalid) {
      form.querySelector<HTMLInputElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    startTransition(async () => {
      const failure = await call(() =>
        authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions }),
      );

      if (!failure) {
        form.reset();
        setFeedback({
          tone: "success",
          message: revokeOtherSessions
            ? "Your password has been changed and your other devices have been signed out."
            : "Your password has been changed.",
        });
        focusTarget.current = "feedback";
        return;
      }

      switch (failure.code) {
        case "INVALID_PASSWORD":
          setFieldError("currentPassword", "That password isn't right. Check it and try again.");
          focusTarget.current = "currentPassword";
          return;
        case "PASSWORD_TOO_SHORT":
          setFieldError("newPassword", `Use at least ${PASSWORD_MIN} characters.`);
          focusTarget.current = "newPassword";
          return;
        case "PASSWORD_TOO_LONG":
          setFieldError("newPassword", `Use ${PASSWORD_MAX} characters or fewer.`);
          focusTarget.current = "newPassword";
          return;
      }
      setFeedback({
        tone: "error",
        message: genericMessage(failure, "We couldn't change your password just now. Please try again."),
      });
      focusTarget.current = "feedback";
    });
  }

  const fieldProps = (field: PasswordFieldName) => ({
    name: field,
    error: errors[field],
    onBlur: (value: string) => {
      // Don't nag about an empty field the user only tabbed through.
      if (value || errors[field]) setFieldError(field, validatePassword(field, value));
    },
    onChange: (value: string) => {
      setFeedback(null);
      if (errors[field]) setFieldError(field, validatePassword(field, value));
    },
  });

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-busy={pending || undefined}
      className="stack gap-8"
    >
      <FormFeedback feedback={feedback} ref={feedbackRef} />
      <fieldset disabled={pending} className="stack gap-8">
        <legend className="sr-only">Change password</legend>
        <PasswordField
          {...fieldProps("currentPassword")}
          label="Current password"
          autoComplete="current-password"
        />
        <PasswordField
          {...fieldProps("newPassword")}
          label="New password"
          autoComplete="new-password"
          hint={`At least ${PASSWORD_MIN} characters.`}
        />
        <label className="flex items-start gap-3 type-body">
          <input
            type="checkbox"
            name="revokeOtherSessions"
            defaultChecked
            className="mt-1.5 size-4 shrink-0 accent-ink"
          />
          <span>
            Sign out of other devices
            <span className="block type-caption">
              Recommended if you think someone else knows your password.
            </span>
          </span>
        </label>
      </fieldset>
      <div>
        <button type="submit" className="btn btn-primary max-sm:btn-block" disabled={pending}>
          {pending ? "Updating…" : "Update password"}
        </button>
      </div>
    </form>
  );
}
