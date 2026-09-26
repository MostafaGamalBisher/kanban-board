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
import { findTask } from '@/core/board/selectors';
import { useBoard, useBoardActions } from '@/features/boards/BoardsProvider';
import { FormDialog } from '@/features/forms/FormDialog';
import { useI18n } from '@/i18n/provider';

import { TaskForm } from './TaskForm';
import { ViewTaskDialog, type TaskRef } from './ViewTaskDialog';

/** Opens the task dialogs from anywhere in the app frame. */
export interface TaskDialogs {
  openTask(boardId: BoardId, taskId: TaskId): void;
  openAddTask(boardId: BoardId): void;
}

type OpenDialog =
  | ({ type: 'view' } & TaskRef)
  | ({ type: 'edit' } & TaskRef)
  | { type: 'add'; boardId: BoardId }
  | null;

const TaskDialogsContext = createContext<TaskDialogs | null>(null);

/**
 * One instance of each task dialog for the whole frame. Delete Task joins
 * it in node 6.3. Edit Task opens from the View Task menu, replacing it.
 *
 * Focus returns to what opened the first dialog (the card, or "+ Add New
 * Task"). If the task changed column meanwhile, its card was re-created
 * elsewhere on the board, so focus goes to the card in its new place.
 */
export function TaskDialogsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<OpenDialog>(null);
  const opener = useRef<HTMLElement | null>(null);
  // Kept after closing: a dialog restores focus once it has unmounted.
  const lastTaskId = useRef<TaskId | null>(null);

  const dialogs = useMemo<TaskDialogs>(() => {
    const rememberOpener = () => {
      opener.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
    };
    return {
      openTask: (boardId, taskId) => {
        rememberOpener();
        lastTaskId.current = taskId;
        setOpen({ type: 'view', boardId, taskId });
      },
      openAddTask: (boardId) => {
        rememberOpener();
        lastTaskId.current = null;
        setOpen({ type: 'add', boardId });
      },
    };
  }, []);

  const close = (isOpen: boolean) => !isOpen && setOpen(null);
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
        target={open?.type === 'view' ? open : undefined}
        onEdit={(task) => setOpen({ type: 'edit', ...task })}
        onOpenChange={close}
        onCloseAutoFocus={restoreFocus}
      />
      <AddTaskDialog
        boardId={open?.type === 'add' ? open.boardId : undefined}
        onOpenChange={close}
        onCloseAutoFocus={restoreFocus}
      />
      <EditTaskDialog
        target={open?.type === 'edit' ? open : undefined}
        onOpenChange={close}
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

interface DialogProps {
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus: (event: Event) => void;
}

/**
 * Add New Task: starts in the board's first column, with the brief's two
 * empty subtask rows. The task goes to the end of the chosen column.
 */
function AddTaskDialog({
  boardId,
  ...props
}: DialogProps & { boardId: BoardId | undefined }) {
  const { dict } = useI18n();
  const { addTask } = useBoardActions();
  const board = useBoard(boardId);
  const firstColumn = board?.columns[0];

  return (
    <FormDialog
      {...props}
      open={board !== undefined && firstColumn !== undefined}
      title={dict.task.addTitle}
    >
      {board && firstColumn && (
        <TaskForm
          columns={board.columns}
          initial={{
            title: '',
            description: '',
            columnId: firstColumn.id,
            subtasks: [{ title: '' }, { title: '' }],
          }}
          submitLabel={dict.task.createSubmit}
          onSubmit={(values) => {
            addTask({
              boardId: board.id,
              ...values,
              subtasks: values.subtasks.map(({ title }) => ({ title })),
            });
            props.onOpenChange(false);
          }}
        />
      )}
    </FormDialog>
  );
}

/**
 * Edit Task: everything the task holds. Kept subtasks keep their ticks;
 * a different status moves the task to the end of that column
 * (updateTask in core/).
 */
function EditTaskDialog({
  target,
  ...props
}: DialogProps & { target: TaskRef | undefined }) {
  const { dict } = useI18n();
  const { updateTask } = useBoardActions();
  const board = useBoard(target?.boardId);
  const found = board && target ? findTask(board, target.taskId) : undefined;

  return (
    <FormDialog {...props} open={found !== undefined} title={dict.task.edit}>
      {board && found && (
        <TaskForm
          columns={board.columns}
          initial={{
            title: found.task.title,
            description: found.task.description,
            columnId: found.column.id,
            subtasks: found.task.subtasks.map(({ id, title }) => ({
              id,
              title,
            })),
          }}
          submitLabel={dict.common.save}
          onSubmit={(values) => {
            updateTask({ boardId: board.id, taskId: found.task.id, ...values });
            props.onOpenChange(false);
          }}
        />
      )}
    </FormDialog>
  );
}
