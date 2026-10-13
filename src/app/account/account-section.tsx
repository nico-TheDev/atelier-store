import type { ReactNode } from "react";

/* Heading, short intro and body for one account page. */
export function AccountSection({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="stack gap-8">
      <header className="stack gap-2">
        <h2 id={id} className="type-heading-3">
          {title}
        </h2>
        <p className="type-body text-muted">{intro}</p>
      </header>
      {children}
    </section>
  );
}
