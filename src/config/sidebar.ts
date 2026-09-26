/**
 * Sidebar visibility (≥ 768px). Shown by default; the choice lives in a
 * cookie and is applied before paint as `data-sidebar` on <html>.
 */
export const SIDEBAR_STATES = ['shown', 'hidden'] as const;
export type SidebarState = (typeof SIDEBAR_STATES)[number];

export const DEFAULT_SIDEBAR_STATE: SidebarState = 'shown';

export const SIDEBAR_COOKIE = 'sidebar';

/** Narrows untrusted input (a cookie value) to a supported state. */
export function isSidebarState(value: unknown): value is SidebarState {
  return (SIDEBAR_STATES as readonly unknown[]).includes(value);
}
