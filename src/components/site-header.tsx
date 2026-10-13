import Link from "next/link";
import { Suspense } from "react";
import { getBag } from "@/lib/cart";
import { primaryNav } from "@/lib/catalog";
import { AccountIcon, BagIcon, SearchIcon } from "./icons";
import { MobileNav } from "./mobile-nav";

export function SiteHeader() {
  return (
    <>
      <p className="surface-inverse type-eyebrow px-4 py-2.5 text-center">
        Complimentary express shipping and returns
      </p>
      <header className="sticky top-0 z-40 bg-paper hairline-b">
        <div className="container-page header-bar gap-4">
          <div className="flex flex-1 items-center">
            <div className="-ml-3 xl:hidden">
              <MobileNav links={primaryNav} />
            </div>
            <nav aria-label="Primary" className="max-xl:hidden">
              <ul className="cluster gap-x-6">
                {primaryNav.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="link-nav">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <Link
            href="/"
            className="pl-[0.32em] text-xl font-normal tracking-[0.32em] uppercase md:text-2xl"
          >
            Sartoria
          </Link>

          <div className="-mr-3 flex flex-1 items-center justify-end">
            <Link
              href="/search"
              className="btn btn-ghost btn-sm btn-icon"
              aria-label="Search"
            >
              <SearchIcon />
            </Link>
            <Link
              href="/account"
              className="btn btn-ghost btn-sm btn-icon max-sm:hidden"
              aria-label="Account"
            >
              <AccountIcon />
            </Link>
            {/* The count reads the bag cookie and live stock, so it streams in after the static shell. */}
            <Suspense fallback={<BagLink count={0} />}>
              <BagCount />
            </Suspense>
          </div>
        </div>
      </header>
    </>
  );
}

async function BagCount() {
  // reconciled like the bag page, so both show the same count when stock has dropped
  return <BagLink count={(await getBag()).count} />;
}

function BagLink({ count }: { count: number }) {
  return (
    <Link
      href="/bag"
      className="btn btn-ghost btn-sm btn-icon relative"
      aria-label={
        count > 0
          ? `Shopping bag, ${count} ${count === 1 ? "item" : "items"}`
          : "Shopping bag"
      }
    >
      <BagIcon />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-1.5 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-2xs leading-none text-paper tabular-nums"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
