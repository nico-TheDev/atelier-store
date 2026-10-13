import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { PlusIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { ProductPurchase, StockIndicator } from "@/components/product-purchase";
import {
  getProduct,
  getProductSlugs,
  getRelatedProducts,
} from "@/db/queries/catalog";
import { formatPrice, getStockState, type Product } from "@/lib/catalog";

export async function generateStaticParams() {
  return (await getProductSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.description,
    openGraph: { images: [product.images[0].src] },
  };
}

type Params = PageProps<"/products/[slug]">["params"];

/*
 * The page itself never awaits params, so navigations render the skeleton
 * shell instantly while the product streams in (Cache Components).
 */
export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
  return (
    <main className="flex-1">
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetail params={params} />
      </Suspense>
    </main>
  );
}

async function ProductDetail({ params }: { params: Params }) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();

  const category = product.category.name;
  const related = await getRelatedProducts({
    id: product.id,
    categoryId: product.categoryId,
  });

  return (
    <>
      <ProductJsonLd product={product} />

      <div className="grid-pdp">
        <ProductGallery images={product.images} />

        <div className="px-gutter py-8 lg:sticky lg:top-header lg:self-start lg:px-12 lg:py-12 xl:px-16">
          <nav aria-label="Breadcrumb">
            <ol className="type-caption flex flex-wrap gap-x-2">
              <li>
                <Link href="/" className="link-quiet">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/collections/${product.category.slug}`} className="link-quiet">
                  {category}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-ink">
                {product.name}
              </li>
            </ol>
          </nav>

          <div className="mt-6 stack gap-2">
            <p className="type-eyebrow text-muted">
              {category}
              {product.badge && ` · ${product.badge}`}
            </p>
            <h1 className="type-heading-2">{product.name}</h1>
            <p className="type-caption">{product.color}</p>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4">
            <p className="text-lg tabular-nums">{formatPrice(product.price)}</p>
            <StockIndicator product={product} />
          </div>

          <div className="mt-8">
            <ProductPurchase product={product} />
          </div>

          <p className="type-body mt-10">{product.description}</p>

          <div className="mt-8 hairline">
            <Disclosure title="Details" open>
              <ul className="stack gap-1.5">
                {product.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </Disclosure>
            <Disclosure title="Composition and care">
              <p>{product.composition}</p>
            </Disclosure>
            <Disclosure title="Shipping and returns">
              <p>
                Complimentary express delivery in 2–3 business days, in our
                signature packaging. Returns are free within 30 days and
                collected from your door.
              </p>
            </Disclosure>
          </div>
        </div>
      </div>

      <section aria-labelledby="related" className="section">
        <h2 id="related" className="type-heading-2 container-page mb-8 text-center">
          You May Also Like
        </h2>
        <ul className="container-page grid-products">
          {related.map((item) => (
            <li key={item.slug}>
              <ProductCard product={item} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid-pdp" aria-busy="true">
      <div className="flex gap-grid-x overflow-hidden lg:grid lg:grid-cols-2">
        <div className="media aspect-product w-[88%] shrink-0 md:w-[60%] lg:col-span-2 lg:w-auto" />
      </div>
      <div className="stack gap-4 px-gutter py-8 lg:px-12 lg:py-12 xl:px-16">
        <div className="h-4 w-40 bg-surface" />
        <div className="mt-4 h-8 w-3/4 bg-surface" />
        <div className="h-4 w-24 bg-surface" />
        <div className="mt-6 h-11 bg-surface" />
        <div className="h-14 bg-surface" />
      </div>
    </div>
  );
}

function Disclosure({
  title,
  open,
  children,
}: {
  title: string;
  open?: boolean;
  children: ReactNode;
}) {
  return (
    <details open={open} className="group hairline-b">
      <summary className="type-label flex cursor-pointer list-none items-center justify-between py-5 [&::-webkit-details-marker]:hidden">
        {title}
        <PlusIcon
          width={16}
          height={16}
          className="transition-transform duration-(--duration-base) ease-luxe group-open:rotate-45"
        />
      </summary>
      <div className="type-caption pb-6 text-ink">{children}</div>
    </details>
  );
}

function ProductJsonLd({ product }: { product: Product }) {
  const soldOut = getStockState(product).status === "sold-out";
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((image) => image.src),
    color: product.color,
    category: product.category.name,
    offers: {
      "@type": "Offer",
      price: (product.price / 100).toFixed(2),
      priceCurrency: "USD",
      availability: soldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
