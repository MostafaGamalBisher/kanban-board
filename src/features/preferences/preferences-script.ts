import {
  DEFAULT_SIDEBAR_STATE,
  SIDEBAR_COOKIE,
  SIDEBAR_STATES,
} from '@/config/sidebar';
import { DEFAULT_THEME, THEME_COOKIE, THEMES } from '@/config/theme';

/**
 * Runs in <head> before the first paint and applies the saved preferences:
 * the theme (`dark` class) and the sidebar state (`data-sidebar`). The
 * server always renders the defaults (so pages stay static); this corrects
 * them before anything is drawn, so nothing flashes. Kept tiny and
 * dependency-free: it is inlined into every page.
 */
export const preferencesScript = `(function () {
  try {
    var cookies = document.cookie;
    var read = function (name, allowed, fallback) {
      var match = cookies.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
      var value = match ? decodeURIComponent(match[1]) : fallback;
      return allowed.indexOf(value) === -1 ? fallback : value;
    };
    var root = document.documentElement;
    var theme = read(${JSON.stringify(THEME_COOKIE)}, ${JSON.stringify(THEMES)}, ${JSON.stringify(DEFAULT_THEME)});
    root.classList.toggle('dark', theme === 'dark');
    root.setAttribute('data-sidebar', read(${JSON.stringify(SIDEBAR_COOKIE)}, ${JSON.stringify(SIDEBAR_STATES)}, ${JSON.stringify(DEFAULT_SIDEBAR_STATE)}));
  } catch (e) {}
})();`;
