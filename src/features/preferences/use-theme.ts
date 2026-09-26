'use client';

import { useCallback, useSyncExternalStore } from 'react';

import { DEFAULT_THEME, THEME_COOKIE, type Theme } from '@/config/theme';

import { writePreferenceCookie } from './cookies';

/**
 * The current theme is the `dark` class on <html> (set by the server and
 * corrected before paint by themeScript). useSyncExternalStore reads it
 * from the DOM, using the server's default during hydration, so the
 * server and client renders never disagree.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  return () => observer.disconnect();
}

const getSnapshot = (): Theme =>
  document.documentElement.classList.contains('dark') ? 'dark' : 'light';

const getServerSnapshot = (): Theme => DEFAULT_THEME;

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.classList.toggle('dark', next === 'dark');
    writePreferenceCookie(THEME_COOKIE, next);
  }, []);

  return { theme, setTheme };
}
