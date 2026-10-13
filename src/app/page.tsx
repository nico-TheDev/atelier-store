import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { getNewArrivals } from "@/db/queries/catalog";
import {
  campaign,
  categories,
  genderCollections,
  hero,
  journalStory,
  services,
} from "@/lib/catalog";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero: diptych on desktop, single image on mobile. */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="absolute inset-0 grid gap-grid-x md:grid-cols-2">
          {hero.images.map((image, i) => (
            <div key={image.src} className={i > 0 ? "media max-md:hidden" : "media"}>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                loading="eager"
                sizes="(min-width: 48rem) 50vw, 100vw"
                className="object-[50%_25%]"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
        <div className="relative container-page flex flex-col items-center gap-5 pb-12 text-center md:pb-20">
          <p className="type-eyebrow">{hero.eyebrow}</p>
          <h1 id="hero-title" className="type-display">
            {hero.title}
          </h1>
          <div className="cluster mt-3 justify-center gap-3">
            <Link href="/collections/women" className="btn btn-inverse">
              Shop women
            </Link>
            <Link href="/collections/men" className="btn btn-inverse">
              Shop men
            </Link>
          </div>
        </div>
      </section>

      {/* House statement */}
      <section className="section container-narrow stack items-center gap-6 text-center">
        <p className="type-eyebrow text-muted">The House</p>
        <p className="type-editorial">
          Clothes made slowly, in small runs, by hands we know by name, and
          meant to be worn for years rather than seasons.
        </p>
        <Link href="/about" className="type-label link">
          Our story
        </Link>
      </section>

      {/* New arrivals */}
      <section aria-labelledby="new-arrivals" className="pb-section">
        <div className="container-page mb-8 flex items-end justify-between gap-4">
          <div className="stack gap-2">
            <p className="type-eyebrow text-muted">Just landed</p>
            <h2 id="new-arrivals" className="type-heading-2">
              New Arrivals
            </h2>
          </div>
          <Link href="/collections/new-in" className="type-label link shrink-0">
            View all
          </Link>
        </div>
        <NewArrivals />
      </section>

      {/* Campaign banner */}
      <section
        aria-labelledby="campaign-title"
        className="relative grid min-h-[80svh] place-items-center overflow-hidden text-paper md:min-h-0 md:aspect-landscape"
      >
        <div className="absolute inset-0 bg-surface">
          <Image
            src={campaign.image.src}
            alt={campaign.image.alt}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-overlay" />
        <div className="relative container-narrow stack items-center gap-5 py-16 text-center">
          <p className="type-eyebrow">{campaign.eyebrow}</p>
          <h2 id="campaign-title" className="type-heading-1">
            {campaign.title}
          </h2>
          <p className="max-w-md font-serif text-xl italic">{campaign.body}</p>
          <Link href={campaign.href} className="btn btn-inverse mt-3">
            Discover the edit
          </Link>
        </div>
      </section>

      {/* Women / Men */}
      <section aria-label="Collections" className="grid-split">
        {genderCollections.map((collection) => (
          <Link
            key={collection.slug}
            href={`/collections/${collection.slug}`}
            className="group media aspect-portrait text-paper md:aspect-hero"
          >
            <Image
              src={collection.image.src}
              alt={collection.image.alt}
              fill
              sizes="(min-width: 48rem) 50vw, 100vw"
              className="object-top transition-transform duration-(--duration-slow) ease-luxe group-hover:scale-103"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 stack items-center gap-3 p-gutter pb-10 text-center md:pb-14">
              <h2 className="type-heading-1">{collection.title}</h2>
              <span className="type-label link">Shop the collection</span>
            </div>
          </Link>
        ))}
      </section>

      {/* Shop by category */}
      <section aria-labelledby="categories" className="section container-page">
        <h2 id="categories" className="type-heading-2 mb-8 text-center">
          Shop by Category
        </h2>
        <ul className="grid grid-cols-2 gap-x-grid-x gap-y-8 lg:grid-cols-4">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link href={`/collections/${category.slug}`} className="group block">
                <div className="media aspect-portrait">
                  <Image
                    src={category.image.src}
                    alt={category.image.alt}
                    fill
                    sizes="(min-width: 64rem) 25vw, 50vw"
                    className="transition-transform duration-(--duration-slow) ease-luxe group-hover:scale-103"
                  />
                </div>
                <p className="type-label mt-4 text-center">
                  <span className="link-quiet">{category.title}</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Journal story */}
      <section aria-labelledby="journal-title" className="grid-split bg-surface md:items-center">
        <div className="media aspect-portrait md:aspect-hero">
          <Image
            src={journalStory.image.src}
            alt={journalStory.image.alt}
            fill
            sizes="(min-width: 48rem) 50vw, 100vw"
          />
        </div>
        <div className="stack gap-6 px-gutter py-14 md:mx-auto md:max-w-lg md:py-0">
          <p className="type-eyebrow text-muted">{journalStory.eyebrow}</p>
          <h2 id="journal-title" className="type-heading-1">
            {journalStory.title}
          </h2>
          <p className="type-body text-muted">{journalStory.body}</p>
          <div>
            <Link href={journalStory.href} className="btn btn-secondary">
              Read the story
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section aria-label="Our services" className="section-sm container-page">
        <ul className="grid gap-10 text-center sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <li key={service.title} className="stack mx-auto max-w-xs gap-2">
              <h3 className="type-label">{service.title}</h3>
              <p className="type-caption">{service.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

/* Cached query, so the grid renders into the static shell. */
async function NewArrivals() {
  const products = await getNewArrivals();
  return (
    <ul className="container-page grid-products">
      {products.map((product) => (
        <li key={product.slug}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
