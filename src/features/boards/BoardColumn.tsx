'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useId } from 'react';

import { columnDotClass } from '@/config/board';
import type { BoardId } from '@/core/board/ids';
import type { Column } from '@/core/board/schema';
import type { DndData } from '@/features/dnd/BoardDnd';
import { SortableTaskCard } from '@/features/dnd/SortableTaskCard';
import { useI18n } from '@/i18n/provider';
import { cn } from '@/lib/utils';

/**
 * One column: status dot, "NAME (count)", then its tasks in order. The dot
 * colour comes from the column's position (config/board.ts). An empty
 * column keeps its height as a dashed area, so it is still visible and a
 * place to drop a task. The task list is a sortable list, and the whole
 * column a drop target: dropping below the last card, or into an empty
 * column, lands at the end.
 */
export function BoardColumn({
  boardId,
  column,
  index,
}: {
  boardId: BoardId;
  column: Column;
  index: number;
}) {
  const { dict, format } = useI18n();
  const headingId = useId();
  const data: DndData = { type: 'column', columnId: column.id };
  const { setNodeRef } = useDroppable({ id: column.id, data });

  return (
    <section
      ref={setNodeRef}
      aria-labelledby={headingId}
      className="w-column flex shrink-0 snap-start flex-col gap-6"
    >
      <h2
        id={headingId}
        className="text-heading-s text-muted-foreground flex items-center gap-3 uppercase"
      >
        <span
          aria-hidden
          className={cn(
            'size-3.75 shrink-0 rounded-full',
            columnDotClass(index)
          )}
        />
        <span className="truncate">
          {format(dict.board.columnHeading, {
            name: column.name,
            count: column.tasks.length,
          })}
        </span>
      </h2>
      <SortableContext
        id={column.id}
        items={column.tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        {column.tasks.length > 0 ? (
          <ul className="flex flex-col gap-5">
            {column.tasks.map((task) => (
              <li key={task.id}>
                <SortableTaskCard
                  boardId={boardId}
                  columnId={column.id}
                  task={task}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="border-border h-40 rounded-lg border-2 border-dashed" />
        )}
      </SortableContext>
    </section>
  );
}
