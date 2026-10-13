import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { SearchIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { getNewArrivals, searchProducts } from "@/db/queries/catalog";
import type { Product } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Sartoria clothing, bags, shoes and jewelry.",
};

type SearchParams = PageProps<"/search">["searchParams"];

async function getQuery(searchParams: SearchParams) {
  const { q } = await searchParams;
  return (Array.isArray(q) ? q[0] : q)?.trim().slice(0, 100) ?? "";
}

/*
 * The page never awaits searchParams, so the heading is prerendered and the
 * form and results stream in (Cache Components).
 */
export default function SearchPage({ searchParams }: PageProps<"/search">) {
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
              Search
            </li>
          </ol>
        </nav>

        <div className="mt-10 stack items-center gap-8 text-center md:mt-14">
          <h1 className="type-heading-1">Search</h1>
          <Suspense fallback={<SearchForm />}>
            {getQuery(searchParams).then((query) => (
              <SearchForm key={query} query={query} />
            ))}
          </Suspense>
        </div>
      </header>

      <section aria-label="Results" className="pb-section">
        <Suspense fallback={<ResultsSkeleton />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}

function SearchForm({ query = "" }: { query?: string }) {
  return (
    <Form action="/search" role="search" className="w-full max-w-xl">
      <div className="relative">
        <label htmlFor="search-q" className="sr-only">
          Search products
        </label>
        <input
          id="search-q"
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search for coats, bags, colours…"
          autoComplete="off"
          enterKeyHint="search"
          autoFocus={!query}
          className="field pr-12"
        />
        <button
          type="submit"
          className="btn btn-ghost btn-sm btn-icon absolute top-1 right-0 -mr-2.5"
          aria-label="Search"
        >
          <SearchIcon />
        </button>
      </div>
    </Form>
  );
}

async function Results({ searchParams }: { searchParams: SearchParams }) {
  const query = await getQuery(searchParams);

  if (!query) {
    return (
      <ProductGrid
        heading={<h2 className="type-label">New arrivals</h2>}
        products={await getNewArrivals()}
      />
    );
  }

  const products = await searchProducts(query);

  if (products.length === 0) {
    return (
      <div className="container-narrow stack items-center gap-6 py-16 text-center">
        <p className="type-editorial" role="status">
          Nothing matches “{query}”.
        </p>
        <p className="type-body text-muted">
          Check the spelling, or try a broader word such as a colour or
          category.
        </p>
        <Link href="/collections/new-in" className="btn btn-secondary">
          Shop new arrivals
        </Link>
      </div>
    );
  }

  return (
    <ProductGrid
      heading={
        <p className="type-caption" role="status">
          {products.length} {products.length === 1 ? "result" : "results"} for{" "}
          <span className="text-ink">“{query}”</span>
        </p>
      }
      products={products}
    />
  );
}

function ProductGrid({
  heading,
  products,
}: {
  heading: ReactNode;
  products: Product[];
}) {
  return (
    <>
      <div className="container-page mb-6">
        <div className="hairline-b pb-4">{heading}</div>
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

function ResultsSkeleton() {
  return (
    <div aria-busy="true">
      <div className="container-page mb-6">
        <div className="hairline-b pb-4">
          <div className="h-5 w-40 bg-surface" />
        </div>
      </div>
      <div className="container-page grid-products">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="media aspect-product" />
        ))}
      </div>
    </div>
  );
}
