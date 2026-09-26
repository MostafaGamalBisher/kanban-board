'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

import { IconAddTask } from '@/components/icons';
import { Button } from '@/components/ui/button';
import type { Board } from '@/core/board/schema';
import { useI18n } from '@/i18n/provider';
import { mostVisibleIndex } from '@/lib/visibility';

import { BoardDnd, DndScrollArea } from '@/features/dnd/BoardDnd';

import { BoardColumn } from './BoardColumn';
import { useBoardDialogs } from './BoardDialogs';
import { ColumnStrip } from './ColumnStrip';

/**
 * A board's columns side by side. The board scrolls horizontally; on
 * phones each column snaps into place. Logical scroll padding and flex
 * order mirror it in Arabic (the first column on the right).
 *
 * On phones, where one column fits, each column scrolls vertically on its
 * own (its heading stays in view) and `ColumnStrip` shows which column is
 * in view. From `md` up, several columns fit and the board scrolls as one.
 *
 * "+ New Column" and "+ Add New Column" open Edit Board with a new, empty,
 * focused column.
 */
export function BoardView({ board }: { board: Board }) {
  const { dict } = useI18n();
  const { openEditBoard } = useBoardDialogs();
  const addColumn = () => openEditBoard(board.id, { addColumn: true });
  const area = useRef<HTMLElement>(null);
  const current = useCurrentColumn(area, board.columns.map((c) => c.id).join());

  const showColumn = (index: number) => {
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    columnSections(area.current)[index]?.scrollIntoView({
      inline: 'start',
      block: 'nearest',
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  if (board.columns.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4 text-center">
        <p className="text-heading-l text-muted-foreground max-w-md">
          {dict.board.empty}
        </p>
        <Button size="lg" onClick={addColumn}>
          <IconAddTask className="size-3" />
          {dict.board.addColumn}
        </Button>
      </main>
    );
  }

  return (
    <BoardDnd board={board}>
      {(shown) => (
        <>
          <ColumnStrip
            columns={shown.columns}
            current={Math.min(current, shown.columns.length - 1)}
            onSelect={showColumn}
          />
          <DndScrollArea
            ref={area}
            className="flex min-h-0 flex-1 snap-x snap-mandatory scroll-ps-4 gap-6 overflow-auto p-4 pt-6 data-dragging:snap-none max-md:overflow-y-hidden md:snap-none md:p-6"
          >
            {shown.columns.map((column, index) => (
              <BoardColumn
                key={column.id}
                boardId={shown.id}
                column={column}
                index={index}
              />
            ))}
            <button
              type="button"
              onClick={addColumn}
              className="w-column text-heading-xl text-muted-foreground from-new-column-from to-new-column-to hover:text-primary-text focus-visible:ring-ring/50 mt-10 flex shrink-0 snap-start items-center justify-center gap-2 rounded-md bg-linear-to-b outline-none focus-visible:ring-3"
            >
              <IconAddTask className="size-3" />
              {dict.board.newColumn}
            </button>
          </DndScrollArea>
        </>
      )}
    </BoardDnd>
  );
}

/** The column sections directly inside the board's scrolling area. */
function columnSections(area: HTMLElement | null): HTMLElement[] {
  return area
    ? [...area.querySelectorAll<HTMLElement>(':scope > section')]
    : [];
}

/**
 * The index of the column most in view in the board's scrolling area,
 * measured with an IntersectionObserver (no direction maths, so it works
 * the same in Arabic). `columnsKey` changes when columns are added,
 * removed or reordered, so the observer watches the current sections.
 */
function useCurrentColumn(
  area: RefObject<HTMLElement | null>,
  columnsKey: string
): number {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const root = area.current;
    const sections = columnSections(root);
    if (!root || sections.length === 0) return;
    const ratios = sections.map(() => 0);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = sections.indexOf(entry.target as HTMLElement);
          if (index >= 0) ratios[index] = entry.intersectionRatio;
        }
        setCurrent((previous) => mostVisibleIndex(ratios, previous));
      },
      { root, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [area, columnsKey]);

  return current;
}
