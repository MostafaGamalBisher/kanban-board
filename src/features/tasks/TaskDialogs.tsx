'use client';

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type { BoardId, TaskId } from '@/core/board/ids';

import { ViewTaskDialog, type TaskRef } from './ViewTaskDialog';

/** Opens the task dialogs from anywhere in the app frame. */
export interface TaskDialogs {
  openTask(boardId: BoardId, taskId: TaskId): void;
}

const TaskDialogsContext = createContext<TaskDialogs | null>(null);

/**
 * One instance of each task dialog for the whole frame. Add, Edit and
 * Delete Task join it in nodes 6.2 and 6.3.
 *
 * Focus returns to the card that opened the dialog. If the task changed
 * column meanwhile, that card was re-created elsewhere on the board, so
 * focus goes to the task's card in its new place.
 */
export function TaskDialogsProvider({ children }: { children: ReactNode }) {
  const [viewing, setViewing] = useState<TaskRef | undefined>(undefined);
  const opener = useRef<HTMLElement | null>(null);
  // Kept after closing: the dialog restores focus once it has unmounted.
  const lastTaskId = useRef<TaskId | null>(null);

  const dialogs = useMemo<TaskDialogs>(
    () => ({
      openTask: (boardId, taskId) => {
        opener.current =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        lastTaskId.current = taskId;
        setViewing({ boardId, taskId });
      },
    }),
    []
  );

  const restoreFocus = (event: Event) => {
    const taskId = lastTaskId.current;
    const target = opener.current?.isConnected
      ? opener.current
      : taskId &&
        document.querySelector<HTMLElement>(
          `[data-task-id="${CSS.escape(taskId)}"] button`
        );
    if (target) {
      event.preventDefault();
      target.focus();
    }
  };

  return (
    <TaskDialogsContext value={dialogs}>
      {children}
      <ViewTaskDialog
        target={viewing}
        onOpenChange={(open) => !open && setViewing(undefined)}
        onCloseAutoFocus={restoreFocus}
      />
    </TaskDialogsContext>
  );
}

export function useTaskDialogs(): TaskDialogs {
  const dialogs = useContext(TaskDialogsContext);
  if (!dialogs) {
    throw new Error(
      'useTaskDialogs() must be used inside <TaskDialogsProvider>.'
    );
  }
  return dialogs;
}
