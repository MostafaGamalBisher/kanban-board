'use client';

import Link from 'next/link';
import { useId } from 'react';

import { useI18n } from '@/i18n/provider';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';

import { useBoards } from './BoardsProvider';

/**
 * "All boards (n)" and a link to each board, the current one marked.
 * Shared by the sidebar (≥ 768px) and the mobile board switcher.
 */
export function BoardNav({ currentBoardId }: { currentBoardId?: string }) {
  const boards = useBoards();
  const { locale, dict, format } = useI18n();
  const headingId = useId();

  return (
    <nav aria-labelledby={headingId} className="flex flex-col gap-2">
      <h2
        id={headingId}
        className="text-heading-s text-muted-foreground px-6 uppercase"
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
                className={cn(
                  'text-heading-m block rounded-e-full px-6 py-3.5',
                  isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-primary'
                )}
              >
                <bdi>{board.name}</bdi>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
