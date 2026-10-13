import { AccountNav } from "./account-nav";

/*
 * Shared frame for every account page. It stays fully static: each page
 * reads the session itself, inside its own Suspense boundary.
 */
export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <main className="flex-1">
      <div className="container-content section">
        <div className="stack gap-10 lg:gap-14">
          <h1 className="type-heading-1">Your account</h1>
          <div className="grid gap-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16">
            <AccountNav />
            <div className="w-full max-w-xl">{children}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
