import { SIDEBAR_COOKIE, type SidebarState } from '@/config/sidebar';

import { writePreferenceCookie } from './cookies';

/**
 * Shows or hides the sidebar and remembers the choice. Visibility itself is
 * CSS (the `sidebar-hidden:` variant reads `data-sidebar` on <html>), so
 * React holds no state for it and the first paint after a reload is
 * already right (preferencesScript applies the cookie).
 */
export function setSidebarState(state: SidebarState): void {
  document.documentElement.setAttribute('data-sidebar', state);
  writePreferenceCookie(SIDEBAR_COOKIE, state);
}
