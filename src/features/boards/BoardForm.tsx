'use client';

import { useId, useRef, useState } from 'react';

import { IconAddTask } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { ColumnId } from '@/core/board/ids';
import { BoardFormSchema, type BoardFormValues } from '@/core/board/schema';
import {
  FieldInput,
  fieldLabelClass,
  RemoveButton,
} from '@/features/forms/fields';
import { useEditableList } from '@/features/forms/use-editable-list';
import { useSchemaForm } from '@/features/forms/use-schema-form';
import { useI18n } from '@/i18n/provider';
import { cn } from '@/lib/utils';

interface ColumnItem {
  /** Set for a column that already exists (Edit Board). */
  readonly id?: ColumnId | undefined;
  readonly name: string;
}

export interface BoardFormInitial {
  readonly name: string;
  readonly columns: readonly ColumnItem[];
}

const columnField = (index: number) => `columns.${index}.name`;
const ADD_COLUMN_BUTTON = 'add-column';

/**
 * The board form shared by Add Board and Edit Board: a name and a list of
 * columns that can be added, renamed and removed. Validation is
 * BoardFormSchema from core/ (see useSchemaForm); list focus follows
 * useEditableList.
 */
export function BoardForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial: BoardFormInitial;
  submitLabel: string;
  onSubmit: (values: BoardFormValues) => void;
}) {
  const { dict, format } = useI18n();
  const formRef = useRef<HTMLFormElement>(null);
  const nameId = useId();
  const [name, setName] = useState(initial.name);
  const columns = useEditableList<ColumnItem>(
    formRef,
    initial.columns,
    columnField,
    ADD_COLUMN_BUTTON
  );

  const values = {
    name,
    columns: columns.rows.map(({ item: { id, name } }) =>
      id === undefined ? { name } : { id, name }
    ),
  };
  const { errorText, handleSubmit } = useSchemaForm(
    formRef,
    BoardFormSchema,
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
        <Label htmlFor={nameId} className={fieldLabelClass}>
          {dict.board.nameLabel}
        </Label>
        <FieldInput
          id={nameId}
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={dict.board.namePlaceholder}
          error={errorText('name')}
        />
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className={cn(fieldLabelClass, 'mb-2')}>
          {dict.board.columnsLabel}
        </legend>
        {columns.rows.length > 0 && (
          <ul className="flex flex-col gap-3">
            {columns.rows.map(({ key, item }, index) => {
              const number = index + 1;
              return (
                <li key={key} className="flex items-center gap-4">
                  <FieldInput
                    name={columnField(index)}
                    value={item.name}
                    onChange={(event) =>
                      columns.update(index, {
                        ...item,
                        name: event.target.value,
                      })
                    }
                    aria-label={format(dict.board.columnInput, { number })}
                    error={errorText(columnField(index))}
                  />
                  <RemoveButton
                    label={format(dict.board.removeColumn, { number })}
                    onClick={() => columns.remove(index)}
                  />
                </li>
              );
            })}
          </ul>
        )}
        <Button
          type="button"
          name={ADD_COLUMN_BUTTON}
          variant="secondary"
          onClick={() => columns.add({ name: '' })}
        >
          <IconAddTask className="size-3" />
          {dict.board.addColumn}
        </Button>
      </fieldset>

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
