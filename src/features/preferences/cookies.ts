/** One year: a preference should outlive the session. */
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Stores a user preference (theme, language) in a first-party cookie.
 * Cookies, not localStorage: the proxy reads the language cookie on the
 * server, and the inline theme script reads the theme cookie before the
 * first paint. Client-side only.
 */
export function writePreferenceCookie(name: string, value: string): void {
  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    `Max-Age=${ONE_YEAR_SECONDS}`,
    'SameSite=Lax',
  ].join('; ');
}
