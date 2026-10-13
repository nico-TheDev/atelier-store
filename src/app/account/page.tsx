import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { ProfileForm } from "./account-forms";
import { AccountSection } from "./account-section";

export const metadata: Metadata = {
  title: "Account details",
  robots: { index: false },
};

const memberSince = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

/* The section heading prerenders; the session read streams in behind Suspense. */
export default function AccountPage() {
  return (
    <AccountSection
      id="details-heading"
      title="Account details"
      intro="The name we use when we contact you."
    >
      <Suspense fallback={<p className="type-body text-muted">Loading…</p>}>
        <AccountDetails />
      </Suspense>
    </AccountSection>
  );
}

async function AccountDetails() {
  const user = await requireUser();

  return (
    <div className="stack gap-10">
      <ProfileForm name={user.name} />
      <dl className="stack gap-6 hairline pt-6">
        <div className="stack gap-1">
          <dt className="type-label">Email</dt>
          <dd className="type-body wrap-break-word">{user.email}</dd>
          <dd className="type-caption">Used to sign in. It can&apos;t be changed here yet.</dd>
        </div>
        <div className="stack gap-1">
          <dt className="type-label">Member since</dt>
          <dd className="type-body">{memberSince.format(user.createdAt)}</dd>
        </div>
      </dl>
    </div>
  );
}
