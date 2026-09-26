/** Colour themes. The app is dark by default; the choice lives in a cookie. */
export const THEMES = ['dark', 'light'] as const;
export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = 'dark';

export const THEME_COOKIE = 'theme';

/** Narrows untrusted input (a cookie value) to a supported theme. */
export function isTheme(value: unknown): value is Theme {
  return (THEMES as readonly unknown[]).includes(value);
}
