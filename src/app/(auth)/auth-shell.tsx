import type { ReactNode } from "react";

/* Reads `?next=` without awaiting it in the page, so the shell prerenders. */
export async function getNext(
  searchParams: Promise<Record<string, string | string[] | undefined>>,
) {
  const { next } = await searchParams;
  return Array.isArray(next) ? next[0] : next;
}

export function AuthShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="flex-1">
      <div className="container-page section">
        <div className="mx-auto stack w-full max-w-sm gap-10 text-center">
          <header className="stack gap-4">
            <h1 className="type-heading-1">{title}</h1>
            <p className="type-body text-muted">{intro}</p>
          </header>
          {children}
        </div>
      </div>
    </main>
  );
}
