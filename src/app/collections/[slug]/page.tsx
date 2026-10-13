import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductCard } from "@/components/product-card";
import { getCategory, getCategorySlugs } from "@/db/queries/catalog";

export async function generateStaticParams() {
  return (await getCategorySlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const category = await getCategory((await params).slug);
  if (!category) return {};

  return {
    title: category.name,
    description: `Shop ${category.name.toLowerCase()} at Sartoria, made in small runs.`,
  };
}

type Params = PageProps<"/collections/[slug]">["params"];

/*
 * The page itself never awaits params, so navigations render the skeleton
 * shell instantly while the collection streams in (Cache Components).
 */
export default function CollectionPage({ params }: PageProps<"/collections/[slug]">) {
  return (
    <main className="flex-1">
      <Suspense fallback={<CollectionSkeleton />}>
        <Collection params={params} />
      </Suspense>
    </main>
  );
}

async function Collection({ params }: { params: Params }) {
  const category = await getCategory((await params).slug);
  if (!category) notFound();

  const { products } = category;

  return (
    <>
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
              {category.name}
            </li>
          </ol>
        </nav>

        <div className="mt-10 stack items-center gap-4 text-center md:mt-14">
          <p className="type-eyebrow text-muted">The Collection</p>
          <h1 className="type-heading-1">{category.name}</h1>
        </div>
      </header>

      <section aria-label="Products" className="pb-section">
        {products.length === 0 ? (
          <div className="container-narrow stack items-center gap-6 py-16 text-center">
            <p className="type-editorial">Nothing here just yet.</p>
            <Link href="/collections/new-in" className="btn btn-secondary">
              Shop new arrivals
            </Link>
          </div>
        ) : (
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
        )}
      </section>
    </>
  );
}

function CollectionSkeleton() {
  return (
    <div aria-busy="true">
      <div className="container-page pt-8 pb-10 md:pb-14">
        <div className="h-4 w-32 bg-surface" />
        <div className="mt-10 stack items-center gap-4 md:mt-14">
          <div className="h-3 w-24 bg-surface" />
          <div className="h-10 w-56 bg-surface" />
        </div>
      </div>
      <div className="container-page grid-products pb-section">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="media aspect-product" />
        ))}
      </div>
    </div>
  );
}
