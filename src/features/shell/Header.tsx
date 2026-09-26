'use client';

import { LogoMark } from '@/components/brand/LogoMark';
import { IconAddTask, IconVerticalEllipsis } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Board } from '@/core/board/schema';
import { useI18n } from '@/i18n/provider';

import { MobileBoardSwitcher } from './MobileBoardSwitcher';

/**
 * Top bar: logo, current board (opens the board switcher), add task and
 * the board menu. Built for 375px first.
 *
 * Add task, Edit and Delete stay disabled until their dialogs exist
 * (nodes 6.2, 5.2 and 5.3).
 */
export function Header({ board }: { board: Board | undefined }) {
  const { dict } = useI18n();

  return (
    <header className="bg-card border-border h-header flex shrink-0 items-center gap-4 border-b px-4">
      <LogoMark />
      <MobileBoardSwitcher board={board} />
      {board && (
        <div className="ms-auto flex shrink-0 items-center gap-1">
          <Button
            disabled
            className="md:text-heading-m h-8 px-4.5 md:h-12 md:px-6"
          >
            <IconAddTask className="size-3" />
            <span className="sr-only md:not-sr-only">{dict.board.addTask}</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={dict.board.menu}
                className="text-muted-foreground -me-2"
              >
                <IconVerticalEllipsis className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem disabled>{dict.board.edit}</DropdownMenuItem>
              <DropdownMenuItem disabled variant="destructive">
                {dict.board.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </header>
  );
}
