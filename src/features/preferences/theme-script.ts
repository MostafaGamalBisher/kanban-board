import { DEFAULT_THEME, THEME_COOKIE, THEMES } from '@/config/theme';

/**
 * Runs in <head> before the first paint. The server always renders the
 * default theme (so pages stay static); this applies a saved preference
 * before anything is drawn, so there is no flash of the wrong theme.
 * Kept tiny and dependency-free: it is inlined into every page.
 */
export const themeScript = `(function () {
  try {
    var match = document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]*)/);
    var theme = match ? decodeURIComponent(match[1]) : ${JSON.stringify(DEFAULT_THEME)};
    if (${JSON.stringify(THEMES)}.indexOf(theme) === -1) theme = ${JSON.stringify(DEFAULT_THEME)};
    document.documentElement.classList.toggle('dark', theme === 'dark');
  } catch (e) {}
})();`;
