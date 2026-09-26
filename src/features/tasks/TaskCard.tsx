'use client';

import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from '@dnd-kit/core';

import type { BoardId } from '@/core/board/ids';
import type { Task } from '@/core/board/schema';
import { subtaskProgress } from '@/core/board/selectors';
import { useI18n } from '@/i18n/provider';
import { cn } from '@/lib/utils';

import { useTaskDialogs } from './TaskDialogs';

/** Drag-handle props from useSortable, applied to the card's button. */
export interface CardActivator {
  ref: (element: HTMLElement | null) => void;
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
}

/**
 * One task on the board: title and subtask progress. The whole card opens
 * the task: the title is a button whose click area is stretched over the
 * card (`after:inset-0`), so the card keeps its heading for screen-reader
 * navigation. The same button is the drag handle (`activator`).
 *
 * - `dragging`: the original card while its copy is dragged (faded).
 * - `overlay`: the copy that follows the pointer; not interactive.
 *
 * The progress line is left out when a task has no subtasks: "0 of 0
 * subtasks" says nothing.
 */
export function TaskCard({
  boardId,
  task,
  activator,
  dragging = false,
  overlay = false,
}: {
  boardId: BoardId;
  task: Task;
  activator?: CardActivator;
  dragging?: boolean;
  overlay?: boolean;
}) {
  const { dict, format } = useI18n();
  const { openTask } = useTaskDialogs();
  const { done, total } = subtaskProgress(task);
  // <bdi>: isolated from the page direction, but aligned with it.
  const title = <bdi>{task.title}</bdi>;

  return (
    <article
      data-task-id={overlay ? undefined : task.id}
      className={cn(
        'group bg-card shadow-card ring-ring/50 relative flex flex-col gap-2 rounded-lg px-4 py-6 has-[button:focus-visible]:ring-3',
        dragging && 'opacity-50',
        overlay && 'rotate-2 cursor-grabbing shadow-lg'
      )}
    >
      <h3 className="text-heading-m group-hover:text-primary">
        {overlay ? (
          title
        ) : (
          <button
            type="button"
            ref={activator?.ref}
            {...activator?.attributes}
            {...activator?.listeners}
            onClick={() => openTask(boardId, task.id)}
            className="cursor-pointer touch-manipulation text-start outline-none after:absolute after:inset-0 after:rounded-lg"
          >
            {title}
          </button>
        )}
      </h3>
      {total > 0 && (
        <p className="text-body-m text-muted-foreground">
          {format(dict.board.subtaskProgress, { done, total })}
        </p>
      )}
    </article>
  );
}
