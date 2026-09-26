'use client';

import type { BoardId } from '@/core/board/ids';
import type { Task } from '@/core/board/schema';
import { subtaskProgress } from '@/core/board/selectors';
import { useI18n } from '@/i18n/provider';

import { useTaskDialogs } from './TaskDialogs';

/**
 * One task on the board: title and subtask progress. The whole card opens
 * the task: the title is a button whose click area is stretched over the
 * card (`after:inset-0`), so the card keeps its heading for screen-reader
 * navigation. Dragging arrives in node 7.1.
 *
 * The progress line is left out when a task has no subtasks: "0 of 0
 * subtasks" says nothing.
 */
export function TaskCard({ boardId, task }: { boardId: BoardId; task: Task }) {
  const { dict, format } = useI18n();
  const { openTask } = useTaskDialogs();
  const { done, total } = subtaskProgress(task);

  return (
    <article
      data-task-id={task.id}
      className="group bg-card shadow-card ring-ring/50 relative flex flex-col gap-2 rounded-lg px-4 py-6 has-[button:focus-visible]:ring-3"
    >
      <h3 className="text-heading-m group-hover:text-primary">
        <button
          type="button"
          onClick={() => openTask(boardId, task.id)}
          className="cursor-pointer text-start outline-none after:absolute after:inset-0 after:rounded-lg"
        >
          {/* <bdi>: isolated from the page direction, but aligned with it. */}
          <bdi>{task.title}</bdi>
        </button>
      </h3>
      {total > 0 && (
        <p className="text-body-m text-muted-foreground">
          {format(dict.board.subtaskProgress, { done, total })}
        </p>
      )}
    </article>
  );
}
