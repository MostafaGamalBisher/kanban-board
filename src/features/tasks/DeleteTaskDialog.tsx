'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { findTask, type FoundTask } from '@/core/board/selectors';
import { useBoard, useBoardActions } from '@/features/boards/BoardsProvider';
import { useI18n } from '@/i18n/provider';

import type { TaskRef } from './ViewTaskDialog';

/**
 * Delete Task: a confirmation (Cancel focused by default), then the task
 * and its subtasks are removed. `onDeleting` runs just before, with the
 * column the task was in, so focus can move to a neighbouring card.
 */
export function DeleteTaskDialog({
  target,
  onDeleting,
  onOpenChange,
  onCloseAutoFocus,
}: {
  target: TaskRef | undefined;
  onDeleting: (found: FoundTask) => void;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus: (event: Event) => void;
}) {
  const { dict, format } = useI18n();
  const { deleteTask } = useBoardActions();
  const board = useBoard(target?.boardId);
  const found = board && target ? findTask(board, target.taskId) : undefined;

  return (
    <AlertDialog open={found !== undefined} onOpenChange={onOpenChange}>
      <AlertDialogContent
        onCloseAutoFocus={onCloseAutoFocus}
        className="sm:p-8"
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            {dict.task.deleteTitle}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-body-l text-muted-foreground">
            {format(dict.task.deleteConfirm, {
              title: found?.task.title ?? '',
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              if (!board || !found) return;
              onDeleting(found);
              deleteTask({ boardId: board.id, taskId: found.task.id });
            }}
          >
            {dict.common.delete}
          </AlertDialogAction>
          <AlertDialogCancel variant="secondary">
            {dict.common.cancel}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
