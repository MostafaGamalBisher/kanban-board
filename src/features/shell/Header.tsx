'use client';

import { useRef } from 'react';

import { Logo } from '@/components/brand/Logo';
import { IconAddTask, IconVerticalEllipsis } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Board } from '@/core/board/schema';
import { useBoardDialogs } from '@/features/boards/BoardDialogs';
import { useTaskDialogs } from '@/features/tasks/TaskDialogs';
import { useI18n } from '@/i18n/provider';

import { MobileBoardSwitcher } from './MobileBoardSwitcher';

/**
 * Top bar: logo, current board, add task and the board menu. Built for
 * 375px first.
 *
 * Below 768px the board name opens the board switcher; from 768px up the
 * sidebar lists the boards, so the name is a plain heading and the logo
 * cell lines up with the sidebar. Only one of the two headings is ever
 * displayed, so assistive technology sees a single <h1>.
 *
 * "+ Add New Task" is disabled while the board has no columns.
 */
export function Header({ board }: { board: Board | undefined }) {
  const { dict } = useI18n();
  const { openEditBoard, openDeleteBoard } = useBoardDialogs();
  const { openAddTask } = useTaskDialogs();
  // The menu closes as its dialog opens; focus comes back to ⋮ afterwards.
  const menuTrigger = useRef<HTMLButtonElement>(null);

  return (
    <header className="bg-card border-border h-header md:h-header-md xl:h-header-xl flex shrink-0 items-center border-b">
      <div className="md:w-sidebar xl:w-sidebar-xl flex h-full shrink-0 items-center ps-4 md:border-e md:ps-6 xl:ps-8">
        <Logo />
      </div>
      <div className="flex h-full min-w-0 flex-1 items-center gap-4 px-4 md:px-6 xl:px-8">
        <div className="flex min-w-0 md:hidden">
          <MobileBoardSwitcher board={board} />
        </div>
        {board && (
          <h1
            dir="auto"
            className="text-heading-l xl:text-heading-xl hidden min-w-0 truncate md:block"
          >
            {board.name}
          </h1>
        )}
        {board && (
          <div className="ms-auto flex shrink-0 items-center gap-1 md:gap-2">
            <Button
              // A task needs a column to go in (as in the brief).
              disabled={board.columns.length === 0}
              // Focus fallback after a task is deleted (TaskDialogs).
              data-add-task
              onClick={() => openAddTask(board.id)}
              className="md:text-heading-m h-8 px-4.5 md:h-12 md:px-6"
            >
              <IconAddTask className="size-3" />
              <span className="sr-only md:not-sr-only">
                {dict.board.addTask}
              </span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  ref={menuTrigger}
                  variant="ghost"
                  size="icon"
                  aria-label={dict.board.menu}
                  className="text-muted-foreground -me-2"
                >
                  <IconVerticalEllipsis className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onSelect={() =>
                    openEditBoard(board.id, {
                      returnFocusTo: menuTrigger.current,
                    })
                  }
                >
                  {dict.board.edit}
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() =>
                    openDeleteBoard(board.id, {
                      returnFocusTo: menuTrigger.current,
                    })
                  }
                >
                  {dict.board.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
