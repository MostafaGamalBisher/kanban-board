'use client';

import { useRef, useState } from 'react';

import { IconChevronDown } from '@/components/icons';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Board } from '@/core/board/schema';
import { BoardNav } from '@/features/boards/BoardNav';
import { LanguageSwitcher } from '@/features/preferences/LanguageSwitcher';
import { ThemeToggle } from '@/features/preferences/ThemeToggle';
import { useI18n } from '@/i18n/provider';
import { cn } from '@/lib/utils';

/**
 * The current board's name; tapping it opens a panel with the sidebar's
 * content: every board, the theme toggle and the language switcher.
 *
 * A dialog, not a menu: it holds links and a switch, which a menu role
 * cannot contain. Radix handles the focus trap, Escape, the backdrop and
 * returning focus to the trigger.
 */
export function MobileBoardSwitcher({ board }: { board: Board | undefined }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { dict } = useI18n();

  const trigger = (
    <DialogTrigger
      ref={triggerRef}
      className="text-heading-l focus-visible:ring-ring/50 flex max-w-full min-w-0 items-center gap-2 rounded-sm outline-none focus-visible:ring-3"
    >
      {/* dir="auto": an English name in /ar truncates at its own end. */}
      <span dir="auto" className="truncate">
        {board?.name ?? dict.board.switcher}
      </span>
      <IconChevronDown
        className={cn(
          'text-primary shrink-0 transition-transform',
          open && 'rotate-180'
        )}
      />
    </DialogTrigger>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* The board name is the page's main heading. */}
      {board ? <h1 className="flex min-w-0">{trigger}</h1> : trigger}
      <DialogContent
        ref={contentRef}
        showCloseButton={false}
        aria-describedby={undefined}
        // Radix skips links when choosing the first focus, which would land
        // on the theme switch. Start on the current board (or the first).
        onOpenAutoFocus={(event) => {
          const link = contentRef.current?.querySelector<HTMLElement>(
            'a[aria-current="page"], a'
          );
          if (link) {
            event.preventDefault();
            link.focus();
          }
        }}
        className="top-header mt-4 w-66 max-w-66 translate-y-0 gap-4 px-0 py-4 shadow-lg ring-0"
      >
        <DialogTitle className="sr-only">{dict.board.switcher}</DialogTitle>
        <BoardNav
          currentBoardId={board?.id}
          onNavigate={() => setOpen(false)}
          returnFocusTo={triggerRef}
        />
        <div className="flex flex-col gap-4 px-4">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </DialogContent>
    </Dialog>
  );
}
