'use client';

import type { Ref } from 'react';

import { IconHideSidebar } from '@/components/icons';
import { BoardNav } from '@/features/boards/BoardNav';
import { LanguageSwitcher } from '@/features/preferences/LanguageSwitcher';
import { ThemeToggle } from '@/features/preferences/ThemeToggle';
import { useI18n } from '@/i18n/provider';

/**
 * The board list and preferences, from 768px up (below that, the same
 * content is in the header's board switcher). Hidden by CSS while
 * `data-sidebar="hidden"` is on <html>, so the first paint is right.
 */
export function Sidebar({
  currentBoardId,
  onHide,
  hideButtonRef,
}: {
  currentBoardId: string | undefined;
  onHide: () => void;
  hideButtonRef: Ref<HTMLButtonElement>;
}) {
  const { dict } = useI18n();

  return (
    <aside className="bg-card border-border w-sidebar xl:w-sidebar-xl sidebar-hidden:hidden hidden shrink-0 flex-col justify-between gap-8 overflow-y-auto border-e pt-4 pb-8 md:flex">
      <BoardNav currentBoardId={currentBoardId} />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 px-3 xl:px-6">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
        <button
          ref={hideButtonRef}
          type="button"
          onClick={onHide}
          className="text-heading-m text-muted-foreground hover:bg-secondary hover:text-primary focus-visible:ring-ring/50 me-6 flex items-center gap-3 rounded-e-full px-6 py-3.5 outline-none focus-visible:ring-3 xl:px-8"
        >
          <IconHideSidebar className="shrink-0" />
          {dict.preferences.hideSidebar}
        </button>
      </div>
    </aside>
  );
}
