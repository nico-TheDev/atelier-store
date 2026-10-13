import "server-only";

import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";

import { auth } from "./auth";

/*
 * Data access layer for the session. Pages, layouts and server actions call
 * these helpers instead of importing `auth`. They read request headers, so
 * under Cache Components they must run inside a <Suspense> boundary (or in a
 * server action), never at the top level of a layout.
 */

/*
 * One session lookup per request, however many components ask for it.
 * connection() keeps the lookup out of Next's prerender passes: there
 * headers() resolves but uncached fetches are aborted, so Better Auth would
 * log the cut-off Neon query as an internal error.
 */
export const getSession = cache(async () => {
  await connection();
  return auth.api.getSession({ headers: await headers() });
});

/*
 * The signed-in user, or a redirect to sign-in that returns to `returnTo`
 * (or to the homepage when it's omitted).
 */
export async function requireUser(returnTo?: string) {
  const session = await getSession();
  if (!session) {
    redirect(returnTo ? `/sign-in?next=${encodeURIComponent(returnTo)}` : "/sign-in");
  }
  return session.user;
}

/*
 * An admin user. Anyone else gets a 404 so the admin area doesn't advertise
 * itself. Call this first in every admin page and admin server action.
 */
export async function requireAdmin() {
  const user = await requireUser("/admin");
  if (user.role !== "admin") {
    notFound();
  }
  return user;
}
