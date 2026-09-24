/**
 * Where to send someone after sign-in, from the `redirect` query parameter.
 *
 * Only paths on this site are allowed. Following the parameter blindly would
 * let a link like /sign-in?redirect=https://evil.example send people to
 * another site straight after they sign in (an open redirect).
 */
export function safeRedirect(target: unknown, fallback = '/') {
  if (typeof target !== 'string' || !target.startsWith('/')) {
    return fallback
  }

  // "//evil.example" and "/\evil.example" are read by browsers as another host.
  const base = 'http://hauz.invalid'
  const url = new URL(target, base)
  if (url.origin !== base) {
    return fallback
  }

  return url.pathname + url.search + url.hash
}
