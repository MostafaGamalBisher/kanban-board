'use client';

import { IconAddTask } from '@/components/icons';
import { Button } from '@/components/ui/button';
import type { Board } from '@/core/board/schema';
import { useI18n } from '@/i18n/provider';

import { BoardColumn } from './BoardColumn';

/**
 * A board's columns side by side. The board scrolls horizontally; on
 * phones each column snaps into place. Logical scroll padding and flex
 * order mirror it in Arabic (the first column on the right).
 *
 * "+ New Column" and "+ Add New Column" open Edit Board, which arrives in
 * node 5.2; until then they are disabled.
 */
export function BoardView({ board }: { board: Board }) {
  const { dict } = useI18n();

  if (board.columns.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4 text-center">
        <p className="text-heading-l text-muted-foreground max-w-md">
          {dict.board.empty}
        </p>
        <Button size="lg" disabled>
          <IconAddTask className="size-3" />
          {dict.board.addColumn}
        </Button>
      </main>
    );
  }

  return (
    <main className="flex min-h-0 flex-1 snap-x snap-mandatory scroll-ps-4 gap-6 overflow-auto p-4 pt-6 md:snap-none md:p-6">
      {board.columns.map((column, index) => (
        <BoardColumn key={column.id} column={column} index={index} />
      ))}
      <button
        type="button"
        disabled
        className="w-column text-heading-xl text-muted-foreground from-new-column-from to-new-column-to hover:text-primary mt-10 flex shrink-0 snap-start items-center justify-center gap-2 rounded-md bg-linear-to-b disabled:cursor-not-allowed disabled:opacity-50"
      >
        <IconAddTask className="size-3" />
        {dict.board.newColumn}
      </button>
    </main>
  );
}
