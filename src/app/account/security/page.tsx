import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { PasswordForm } from "../account-forms";
import { AccountSection } from "../account-section";

export const metadata: Metadata = {
  title: "Security",
  robots: { index: false },
};

export default function SecurityPage() {
  return (
    <AccountSection
      id="password-heading"
      title="Password"
      intro="Change the password you use to sign in to Sartoria."
    >
      <Suspense fallback={<p className="type-body text-muted">Loading…</p>}>
        <SecurityDetails />
      </Suspense>
    </AccountSection>
  );
}

/* The form only renders once the session check has passed. */
async function SecurityDetails() {
  await requireUser("/account/security");
  return <PasswordForm />;
}
