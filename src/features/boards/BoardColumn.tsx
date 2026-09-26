'use client';

import { useId } from 'react';

import { columnDotClass } from '@/config/board';
import type { BoardId } from '@/core/board/ids';
import type { Column } from '@/core/board/schema';
import { TaskCard } from '@/features/tasks/TaskCard';
import { useI18n } from '@/i18n/provider';
import { cn } from '@/lib/utils';

/**
 * One column: status dot, "NAME (count)", then its tasks in order. The dot
 * colour comes from the column's position (config/board.ts). An empty
 * column keeps its height as a dashed area, so it is still visible (and,
 * from node 7.1, a place to drop a task).
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

  return (
    <section
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
      {column.tasks.length > 0 ? (
        <ul className="flex flex-col gap-5">
          {column.tasks.map((task) => (
            <li key={task.id}>
              <TaskCard boardId={boardId} task={task} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="border-border h-40 rounded-lg border-2 border-dashed" />
      )}
    </section>
  );
}
