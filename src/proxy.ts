import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/*
 * Optimistic check only: sends visitors without a session cookie straight to
 * sign-in. It never touches the database, so a stale or forged cookie gets
 * through; requireUser/requireAdmin in src/lib/session.ts do the real check.
 */
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;
  const signIn = new URL("/sign-in", request.url);
  // The header's account icon is the site's sign-in entry, so plain /account
  // gets no `next` and sign-in lands on the homepage. Deeper links return.
  if (pathname !== "/account") {
    signIn.searchParams.set("next", pathname + search);
  }
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
