import Link from "next/link";
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
            <Link
              href="/bag"
              className="btn btn-ghost btn-sm btn-icon"
              aria-label="Shopping bag"
            >
              <BagIcon />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
