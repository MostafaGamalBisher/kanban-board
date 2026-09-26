'use client';

import { useId, useRef } from 'react';

import { IconVerticalEllipsis } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { BoardId, TaskId } from '@/core/board/ids';
import { findTask, subtaskProgress } from '@/core/board/selectors';
import { useBoard, useBoardActions } from '@/features/boards/BoardsProvider';
import { useI18n } from '@/i18n/provider';
import { cn } from '@/lib/utils';

export interface TaskRef {
  readonly boardId: BoardId;
  readonly taskId: TaskId;
}

const labelClass = 'text-body-m text-muted-foreground dark:text-foreground';

/**
 * A task in full: description, subtasks to tick, and its status. The task
 * is read from the session's boards on every render, so ticking a subtask
 * or changing the status shows at once, here and on the card.
 *
 * The status select is also the way to move a task without dragging
 * (keyboard, screen readers): the task goes to the end of the chosen
 * column.
 */
export function ViewTaskDialog({
  target,
  onEdit,
  onDelete,
  onOpenChange,
  onCloseAutoFocus,
}: {
  target: TaskRef | undefined;
  /** Replace this dialog with Edit Task / Delete Task. */
  onEdit: (task: TaskRef) => void;
  onDelete: (task: TaskRef) => void;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus: (event: Event) => void;
}) {
  const { dict, format } = useI18n();
  const { setSubtaskCompleted, moveTask } = useBoardActions();
  const board = useBoard(target?.boardId);
  const found = board && target ? findTask(board, target.taskId) : undefined;
  const statusLabelId = useId();
  const contentRef = useRef<HTMLDivElement>(null);

  if (!board || !found) {
    return <Dialog open={false} onOpenChange={onOpenChange} />;
  }
  const { task, column } = found;
  const { done, total } = subtaskProgress(task);
  const ids = { boardId: board.id, taskId: task.id };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent
        ref={contentRef}
        tabIndex={-1}
        showCloseButton={false}
        // Start on the dialog itself, not its first control (the ⋮ menu):
        // a screen reader then reads the task, and Tab reaches the controls.
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          contentRef.current?.focus();
        }}
        onCloseAutoFocus={onCloseAutoFocus}
        {...(task.description ? {} : { 'aria-describedby': undefined })}
        className="sm:p-8"
      >
        <div className="flex items-center gap-4">
          <DialogTitle className="min-w-0 flex-1">
            <bdi>{task.title}</bdi>
          </DialogTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={dict.task.menu}
                className="text-muted-foreground -me-3"
              >
                <IconVerticalEllipsis className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onSelect={() => onEdit(ids)}>
                {dict.task.edit}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => onDelete(ids)}
              >
                {dict.task.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {task.description && (
          <DialogDescription
            dir="auto"
            className="text-body-l text-muted-foreground whitespace-pre-line"
          >
            {task.description}
          </DialogDescription>
        )}

        {total > 0 && (
          <section className="flex flex-col gap-4">
            <h3 className={labelClass}>
              {format(dict.task.subtasksHeading, { done, total })}
            </h3>
            <ul className="flex flex-col gap-2">
              {task.subtasks.map((subtask) => (
                <li key={subtask.id}>
                  <label className="bg-background hover:bg-accent flex min-h-11 cursor-pointer items-center gap-4 rounded-sm p-3">
                    <Checkbox
                      checked={subtask.isCompleted}
                      onCheckedChange={(checked) =>
                        setSubtaskCompleted({
                          ...ids,
                          subtaskId: subtask.id,
                          isCompleted: checked === true,
                        })
                      }
                    />
                    <span
                      className={cn(
                        'text-body-m',
                        subtask.isCompleted &&
                          'text-muted-foreground line-through'
                      )}
                    >
                      <bdi>{subtask.title}</bdi>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="flex flex-col gap-2">
          <Label id={statusLabelId} className={labelClass}>
            {dict.task.status}
          </Label>
          <Select
            value={column.id}
            onValueChange={(columnId) => {
              const to = board.columns.find((c) => c.id === columnId);
              if (!to) return;
              moveTask({
                ...ids,
                toColumnId: to.id,
                toIndex: to.tasks.length,
              });
            }}
          >
            <SelectTrigger aria-labelledby={statusLabelId} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {board.columns.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  <bdi>{option.name}</bdi>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </DialogContent>
    </Dialog>
  );
}
