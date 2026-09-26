'use client';

import { useId, useRef, useState } from 'react';

import { IconAddTask } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ColumnId, SubtaskId } from '@/core/board/ids';
import {
  TaskFormSchema,
  type Column,
  type TaskFormValues,
} from '@/core/board/schema';
import {
  FieldInput,
  fieldLabelClass,
  FieldTextarea,
  RemoveButton,
} from '@/features/forms/fields';
import { useEditableList } from '@/features/forms/use-editable-list';
import { useSchemaForm } from '@/features/forms/use-schema-form';
import { useI18n } from '@/i18n/provider';
import { cn } from '@/lib/utils';

interface SubtaskItem {
  /** Set for a subtask that already exists (Edit Task). */
  readonly id?: SubtaskId | undefined;
  readonly title: string;
}

export interface TaskFormInitial {
  readonly title: string;
  readonly description: string;
  readonly columnId: ColumnId;
  readonly subtasks: readonly SubtaskItem[];
}

const subtaskField = (index: number) => `subtasks.${index}.title`;
const ADD_SUBTASK_BUTTON = 'add-subtask';

/**
 * The task form shared by Add Task and Edit Task: title, description,
 * subtasks (added, renamed, removed) and status (the column). Validation
 * is TaskFormSchema from core/ (see useSchemaForm); list focus follows
 * useEditableList.
 */
export function TaskForm({
  columns,
  initial,
  submitLabel,
  onSubmit,
}: {
  columns: readonly Column[];
  initial: TaskFormInitial;
  submitLabel: string;
  onSubmit: (values: TaskFormValues) => void;
}) {
  const { dict, format } = useI18n();
  const formRef = useRef<HTMLFormElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const statusId = useId();
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [columnId, setColumnId] = useState(initial.columnId);
  const subtasks = useEditableList<SubtaskItem>(
    formRef,
    initial.subtasks,
    subtaskField,
    ADD_SUBTASK_BUTTON
  );

  const values = {
    columnId,
    title,
    description,
    subtasks: subtasks.rows.map(({ item: { id, title } }) =>
      id === undefined ? { title } : { id, title }
    ),
  };
  const { errorText, handleSubmit } = useSchemaForm(
    formRef,
    TaskFormSchema,
    values,
    onSubmit
  );

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor={titleId} className={fieldLabelClass}>
          {dict.task.titleLabel}
        </Label>
        <FieldInput
          id={titleId}
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={dict.task.titlePlaceholder}
          error={errorText('title')}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={descriptionId} className={fieldLabelClass}>
          {dict.task.descriptionLabel}
        </Label>
        <FieldTextarea
          id={descriptionId}
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={dict.task.descriptionPlaceholder}
          error={errorText('description')}
        />
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className={cn(fieldLabelClass, 'mb-2')}>
          {dict.task.subtasksLabel}
        </legend>
        {subtasks.rows.length > 0 && (
          <ul className="flex flex-col gap-3">
            {subtasks.rows.map(({ key, item }, index) => {
              const number = index + 1;
              return (
                <li key={key} className="flex items-center gap-4">
                  <FieldInput
                    name={subtaskField(index)}
                    value={item.title}
                    onChange={(event) =>
                      subtasks.update(index, {
                        ...item,
                        title: event.target.value,
                      })
                    }
                    placeholder={dict.task.subtaskPlaceholders[index]}
                    aria-label={format(dict.task.subtaskInput, { number })}
                    error={errorText(subtaskField(index))}
                  />
                  <RemoveButton
                    label={format(dict.task.removeSubtask, { number })}
                    onClick={() => subtasks.remove(index)}
                  />
                </li>
              );
            })}
          </ul>
        )}
        <Button
          type="button"
          name={ADD_SUBTASK_BUTTON}
          variant="secondary"
          onClick={() => subtasks.add({ title: '' })}
        >
          <IconAddTask className="size-3" />
          {dict.task.addSubtask}
        </Button>
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label id={statusId} className={fieldLabelClass}>
          {dict.task.statusLabel}
        </Label>
        <Select
          value={columnId}
          onValueChange={(value) => {
            const column = columns.find((c) => c.id === value);
            if (column) setColumnId(column.id);
          }}
        >
          <SelectTrigger
            name="columnId"
            aria-labelledby={statusId}
            className="w-full"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {columns.map((column) => (
              <SelectItem key={column.id} value={column.id}>
                <bdi>{column.name}</bdi>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
