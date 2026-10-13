import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/session";
import { refreshCatalogue } from "./actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false },
};

export default function AdminPage() {
  return (
    <main className="flex-1">
      <div className="container-page section">
        <Suspense fallback={<p className="type-body text-muted">Loading…</p>}>
          <AdminPanel />
        </Suspense>
      </div>
    </main>
  );
}

/* The heading sits behind the check too, so non-admins see only the 404. */
async function AdminPanel() {
  const user = await requireAdmin();

  return (
    <div className="stack gap-10">
      <header className="stack gap-2">
        <h1 className="type-heading-1">Admin</h1>
        <p className="type-body text-muted">Signed in as {user.email}</p>
      </header>
      <section aria-labelledby="catalogue-heading" className="stack gap-4 hairline pt-6">
        <h2 id="catalogue-heading" className="type-heading-3">
          Catalogue
        </h2>
        <p className="type-body text-muted">
          Clear the cached catalogue so storefront pages pick up database
          changes.
        </p>
        <form action={refreshCatalogue}>
          <button type="submit" className="btn btn-secondary btn-sm">
            Refresh catalogue
          </button>
        </form>
      </section>
    </div>
  );
}
