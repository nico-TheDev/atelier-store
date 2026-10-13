"use client";

import Link from "next/link";
import { useRef } from "react";
import type { NavLink } from "@/lib/catalog";
import { CloseIcon, MenuIcon } from "./icons";

/*
 * Full-screen menu for small screens, built on the native popover API so it
 * opens, closes on Escape and traps nothing without extra state. Links hide
 * it explicitly because the header persists across client navigations.
 */
export function MobileNav({ links }: { links: NavLink[] }) {
  const panel = useRef<HTMLDivElement>(null);

  return (
    <>
      <button
        type="button"
        popoverTarget="mobile-nav"
        className="btn btn-ghost btn-sm btn-icon"
        aria-label="Open menu"
      >
        <MenuIcon />
      </button>

      <div
        ref={panel}
        id="mobile-nav"
        popover="auto"
        className="m-0 h-dvh max-h-none w-full max-w-none border-0 bg-paper p-0 text-ink"
      >
        <div className="container-page header-bar justify-between hairline-b">
          <span className="type-label">Menu</span>
          <button
            type="button"
            popoverTarget="mobile-nav"
            popoverTargetAction="hide"
            className="btn btn-ghost btn-sm btn-icon"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>
        <nav aria-label="Mobile" className="container-page py-8">
          <ul className="stack gap-6">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="type-heading-2 link-quiet"
                  onClick={() => panel.current?.hidePopover()}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {/* The header's account icon is hidden at this width. */}
          <div className="mt-10 hairline pt-6">
            <Link
              href="/account"
              className="type-label link-quiet"
              onClick={() => panel.current?.hidePopover()}
            >
              Account
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
