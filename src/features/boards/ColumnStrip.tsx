'use client';

import { useEffect, useRef } from 'react';

import { columnDotClass } from '@/config/board';
import type { Column } from '@/core/board/schema';
import { useI18n } from '@/i18n/provider';
import { cn } from '@/lib/utils';

/**
 * Phones only: the board's columns as a row of chips ("Todo (4)"). The
 * column in view is marked `aria-current`; tapping a chip scrolls the
 * board to that column. On a phone only one column fits, so this shows
 * where you are and how many columns there are, and reaches any column
 * without swiping through the others.
 */
export function ColumnStrip({
  columns,
  current,
  onSelect,
}: {
  columns: readonly Column[];
  current: number;
  onSelect: (index: number) => void;
}) {
  const { dict, format } = useI18n();
  const listRef = useRef<HTMLUListElement>(null);

  // Keep the current chip visible when the strip itself overflows. Only
  // when it is cut off: scrollIntoView also reaches the page's other
  // scrolling ancestors.
  useEffect(() => {
    const list = listRef.current;
    const chip = list?.children[current];
    if (!list || !chip) return;
    const outer = list.getBoundingClientRect();
    const inner = chip.getBoundingClientRect();
    if (inner.left < outer.left || inner.right > outer.right) {
      chip.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    }
  }, [current]);

  return (
    <nav aria-label={dict.board.columnsNav} className="md:hidden">
      <ul
        ref={listRef}
        className="flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pt-3 pb-1"
      >
        {columns.map((column, index) => {
          const isCurrent = index === current;
          return (
            <li key={column.id} className="shrink-0 py-1">
              <button
                type="button"
                aria-current={isCurrent ? 'true' : undefined}
                onClick={() => onSelect(index)}
                className={cn(
                  'touch-target text-body-m focus-visible:ring-ring/50 flex h-9 items-center gap-2 rounded-full px-3 font-bold whitespace-nowrap outline-none focus-visible:ring-3',
                  isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'size-2.5 shrink-0 rounded-full',
                    columnDotClass(index)
                  )}
                />
                {format(dict.board.columnHeading, {
                  name: column.name,
                  count: column.tasks.length,
                })}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
