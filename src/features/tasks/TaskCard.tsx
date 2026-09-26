'use client';

import type { Task } from '@/core/board/schema';
import { useI18n } from '@/i18n/provider';

/**
 * One task on the board: title and subtask progress. Opening the task
 * (node 6.1) and dragging it (node 7.1) are added to this card later.
 *
 * The progress line is left out when a task has no subtasks: "0 of 0
 * subtasks" says nothing.
 */
export function TaskCard({ task }: { task: Task }) {
  const { dict, format } = useI18n();
  const total = task.subtasks.length;
  const done = task.subtasks.filter((subtask) => subtask.isCompleted).length;

  return (
    <article className="bg-card shadow-card flex flex-col gap-2 rounded-lg px-4 py-6">
      {/* <bdi>: isolated from the page direction, but aligned with it. */}
      <h3 className="text-heading-m">
        <bdi>{task.title}</bdi>
      </h3>
      {total > 0 && (
        <p className="text-body-m text-muted-foreground">
          {format(dict.board.subtaskProgress, { done, total })}
        </p>
      )}
    </article>
  );
}
