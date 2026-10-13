/*
 * Only same-origin paths are allowed as post-auth redirects, so `?next=` can't
 * send someone to another site ("//evil.com", "https://…", "/\evil.com").
 */
export function safeRedirect(next: unknown, fallback = "/") {
  if (
    typeof next !== "string" ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.includes("\\")
  ) {
    return fallback;
  }
  return next;
}
