'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type FormEvent,
} from 'react';

import { IconAddTask, IconCross } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ColumnId } from '@/core/board/ids';
import { BoardFormSchema, type BoardFormValues } from '@/core/board/schema';
import { fieldErrors } from '@/core/validation';
import { useI18n } from '@/i18n/provider';
import { textDirection } from '@/lib/text-direction';
import { cn } from '@/lib/utils';

interface ColumnRow {
  /** React key: stable while rows are added and removed. */
  readonly key: number;
  /** Set for a column that already exists (Edit Board). */
  readonly id?: ColumnId | undefined;
  readonly name: string;
}

export interface BoardFormInitial {
  readonly name: string;
  readonly columns: readonly { id?: ColumnId | undefined; name: string }[];
}

/**
 * The board form shared by Add Board (5.1) and Edit Board (5.2): a name and
 * a list of columns that can be added, renamed and removed.
 *
 * Validation is BoardFormSchema from core/ (the same rules the domain
 * uses). Errors appear after the first submit and then update as the user
 * types; each message is a ValidationKey translated through the
 * dictionary. On a failed submit, focus moves to the first invalid field.
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
  // Initial rows are keyed by position; added rows continue the sequence.
  const nextKey = useRef(initial.columns.length);

  const [name, setName] = useState(initial.name);
  const [rows, setRows] = useState<ColumnRow[]>(() =>
    initial.columns.map((column, index) => ({ key: index, ...column }))
  );
  const [submitted, setSubmitted] = useState(false);
  const nameId = useId();

  // Adding or removing a column moves focus (to the new field, or to the
  // field that took the removed one's place) once the rows have rendered.
  const pendingFocus = useRef<string | null>(null);
  useEffect(() => {
    if (pendingFocus.current === null) return;
    const field = formRef.current?.elements.namedItem(pendingFocus.current);
    if (field instanceof HTMLElement) field.focus();
    pendingFocus.current = null;
  }, [rows]);

  const values = {
    name,
    columns: rows.map(({ id, name }) =>
      id === undefined ? { name } : { id, name }
    ),
  };
  const result = submitted ? BoardFormSchema.safeParse(values) : undefined;
  const errors =
    result?.success === false ? fieldErrors(result.error.issues) : {};
  const errorText = (field: string) => {
    const key = errors[field];
    return key && dict.validation[key];
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = BoardFormSchema.safeParse(values);
    if (!parsed.success) {
      setSubmitted(true);
      const [first] = Object.keys(fieldErrors(parsed.error.issues));
      const field = first && formRef.current?.elements.namedItem(first);
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    onSubmit(parsed.data);
  };

  const addColumn = () => {
    pendingFocus.current = `columns.${rows.length}.name`;
    setRows([...rows, { key: nextKey.current++, name: '' }]);
  };

  const removeColumn = (index: number) => {
    const remaining = rows.length - 1;
    pendingFocus.current =
      remaining > 0
        ? `columns.${Math.min(index, remaining - 1)}.name`
        : ADD_COLUMN_BUTTON;
    setRows(rows.toSpliced(index, 1));
  };

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor={nameId} className={labelClass}>
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
        <legend className={cn(labelClass, 'mb-2')}>
          {dict.board.columnsLabel}
        </legend>
        {rows.length > 0 && (
          <ul className="flex flex-col gap-3">
            {rows.map((row, index) => {
              const number = index + 1;
              return (
                <li key={row.key} className="flex items-center gap-4">
                  <FieldInput
                    name={`columns.${index}.name`}
                    value={row.name}
                    onChange={(event) => {
                      const value = event.target.value;
                      setRows((current) =>
                        current.map((r) =>
                          r.key === row.key ? { ...r, name: value } : r
                        )
                      );
                    }}
                    aria-label={format(dict.board.columnInput, { number })}
                    error={errorText(`columns.${index}.name`)}
                  />
                  <button
                    type="button"
                    onClick={() => removeColumn(index)}
                    aria-label={format(dict.board.removeColumn, { number })}
                    className="text-muted-foreground hover:text-destructive focus-visible:ring-ring/50 -m-2 rounded-sm p-2 outline-none focus-visible:ring-3"
                  >
                    <IconCross />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <Button
          type="button"
          name={ADD_COLUMN_BUTTON}
          variant="secondary"
          onClick={addColumn}
        >
          <IconAddTask className="size-3" />
          {dict.board.addColumn}
        </Button>
      </fieldset>

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}

const labelClass = 'text-body-m text-muted-foreground dark:text-foreground';

/** Form-element name of "+ Add New Column", so focus can move to it. */
const ADD_COLUMN_BUTTON = 'add-column';

/**
 * A text input with its validation message inside, at the input's end.
 *
 * Input and message share one direction, taken from the value (like
 * `dir="auto"`), or the page's while the value has no letters. Otherwise,
 * in Arabic, an empty or English value would lay out left-to-right while
 * the message sat on the left, on top of the text.
 */
function FieldInput({
  error,
  className,
  value,
  ...props
}: ComponentProps<typeof Input> & {
  value: string;
  error?: string | undefined;
}) {
  const errorId = useId();
  const dir = textDirection(value);
  return (
    <div dir={dir} className="relative min-w-0 flex-1">
      <Input
        value={value}
        dir={dir}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(error && 'pe-40', className)}
        {...props}
      />
      {error && (
        <p
          id={errorId}
          className="text-body-l text-destructive pointer-events-none absolute inset-y-0 end-4 flex items-center"
        >
          {error}
        </p>
      )}
    </div>
  );
}
