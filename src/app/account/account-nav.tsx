"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "./actions";

const links = [
  { label: "Account details", href: "/account" },
  { label: "Security", href: "/account/security" },
];

/*
 * A row of tabs on small screens, a sidebar from lg up. The account routes
 * are static, so usePathname resolves during prerender without a Suspense
 * boundary.
 */
export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account"
      className="flex items-center gap-x-6 overflow-x-auto hairline-b pb-3 lg:flex-col lg:items-start lg:gap-y-3 lg:border-b-0 lg:pb-0"
    >
      <ul className="flex shrink-0 gap-x-6 lg:flex-col lg:gap-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="link-nav whitespace-nowrap"
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <form action={signOut} className="ml-auto shrink-0 lg:ml-0 lg:w-full lg:hairline lg:pt-3">
        <button type="submit" className="link-nav whitespace-nowrap text-muted hover:text-ink">
          Sign out
        </button>
      </form>
    </nav>
  );
}
