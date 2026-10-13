import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { getNewArrivals } from "@/db/queries/catalog";

export const metadata: Metadata = {
  title: "New Arrivals",
  description:
    "The latest clothing, bags, shoes and jewelry to arrive at Sartoria, newest first.",
};

export default function NewArrivalsPage() {
  return (
    <main className="flex-1">
      <header className="container-page pt-8 pb-10 md:pb-14">
        <nav aria-label="Breadcrumb">
          <ol className="type-caption flex flex-wrap gap-x-2">
            <li>
              <Link href="/" className="link-quiet">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">
              New Arrivals
            </li>
          </ol>
        </nav>

        <div className="mt-10 stack items-center gap-4 text-center md:mt-14">
          <p className="type-eyebrow text-muted">Just landed</p>
          <h1 className="type-heading-1">New Arrivals</h1>
          <p className="type-body max-w-md text-muted">
            The latest pieces from the studio, newest first. Made in small
            runs, so sizes go quickly.
          </p>
        </div>
      </header>

      <section aria-label="Products" className="pb-section">
        <ProductGrid />
      </section>
    </main>
  );
}

/* Cached query, so the grid renders into the static shell. */
async function ProductGrid() {
  const products = await getNewArrivals();

  if (products.length === 0) {
    return (
      <div className="container-narrow stack items-center gap-6 py-16 text-center">
        <p className="type-editorial">Nothing new just yet.</p>
        <Link href="/" className="btn btn-secondary">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="container-page mb-6">
        <p className="type-caption hairline-b pb-4">
          {products.length} {products.length === 1 ? "piece" : "pieces"}
        </p>
      </div>
      <ul className="container-page grid-products">
        {products.map((product) => (
          <li key={product.slug}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </>
  );
}
