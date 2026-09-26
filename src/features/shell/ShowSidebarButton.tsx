'use client';

import type { Ref } from 'react';

import { IconShowSidebar } from '@/components/icons';
import { useI18n } from '@/i18n/provider';

/**
 * The tab at the bottom of the screen edge that brings the sidebar back.
 * Shown only from 768px up, and only while the sidebar is hidden (CSS).
 */
export function ShowSidebarButton({
  onShow,
  ref,
}: {
  onShow: () => void;
  ref: Ref<HTMLButtonElement>;
}) {
  const { dict } = useI18n();

  return (
    <button
      ref={ref}
      type="button"
      onClick={onShow}
      aria-label={dict.preferences.showSidebar}
      className="bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-ring/50 md:sidebar-hidden:flex fixed start-0 bottom-8 z-10 hidden h-12 w-14 items-center justify-center rounded-e-full outline-none focus-visible:ring-3"
    >
      <IconShowSidebar />
    </button>
  );
}
