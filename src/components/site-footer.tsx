import Link from "next/link";
import { footerNav } from "@/lib/catalog";

export function SiteFooter() {
  return (
    <footer className="surface-inverse">
      <div className="container-page section-sm">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="stack gap-4">
            <p className="pl-[0.32em] text-2xl tracking-[0.32em] uppercase">
              Atelier
            </p>
            <p className="type-caption max-w-xs">
              Considered clothing and accessories, made in small runs by
              workshops we know by name.
            </p>
          </div>
          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="type-label">{group.title}</h2>
              <ul className="mt-4 stack gap-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="type-caption link-quiet hover:text-paper"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t pt-6 sm:flex-row sm:justify-between">
          <p className="type-caption">© Atelier. All rights reserved.</p>
          <p className="type-caption">United States · English · USD</p>
        </div>
      </div>
    </footer>
  );
}
