'use client';

import Link from 'next/link';
import { useId, type RefObject } from 'react';

import { IconBoard } from '@/components/icons';
import { useI18n } from '@/i18n/provider';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';

import { useBoardDialogs } from './BoardDialogs';
import { useBoards } from './BoardsProvider';

/**
 * "All boards (n)", a link to each board (the current one marked) and
 * "+ Create New Board". Shared by the sidebar (≥ 768px) and the mobile
 * board switcher, which passes `onNavigate` to close itself.
 */
export function BoardNav({
  currentBoardId,
  onNavigate,
  returnFocusTo,
}: {
  currentBoardId?: string | undefined;
  onNavigate?: () => void;
  /** Where focus goes after "Create New Board" (see openCreateBoard). */
  returnFocusTo?: RefObject<HTMLElement | null>;
}) {
  const boards = useBoards();
  const { locale, dict, format } = useI18n();
  const { openCreateBoard } = useBoardDialogs();
  const headingId = useId();

  return (
    <nav aria-labelledby={headingId} className="flex flex-col gap-2">
      <h2
        id={headingId}
        className="text-heading-s text-muted-foreground px-6 uppercase xl:px-8"
      >
        {format(dict.board.allBoards, { count: boards.length })}
      </h2>
      <ul className="flex flex-col">
        {boards.map((board) => {
          const isCurrent = board.id === currentBoardId;
          return (
            <li key={board.id}>
              <Link
                href={routes.board(locale, board.id)}
                aria-current={isCurrent ? 'page' : undefined}
                onClick={onNavigate}
                className={cn(
                  'text-heading-m me-6 flex items-center gap-3 rounded-e-full px-6 py-3.5 xl:px-8',
                  isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-primary'
                )}
              >
                <IconBoard className="shrink-0" />
                <span dir="auto" className="truncate">
                  {board.name}
                </span>
              </Link>
            </li>
          );
        })}
        <li className="pe-6">
          <button
            type="button"
            onClick={() => {
              onNavigate?.();
              openCreateBoard(returnFocusTo?.current);
            }}
            className="text-heading-m text-primary hover:bg-secondary focus-visible:ring-ring/50 flex w-full items-center gap-3 rounded-e-full px-6 py-3.5 text-start outline-none focus-visible:ring-3 xl:px-8"
          >
            <IconBoard className="shrink-0" />
            {dict.board.createBoard}
          </button>
        </li>
      </ul>
    </nav>
  );
}
