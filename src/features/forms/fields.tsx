'use client';

import { useId, type ComponentProps } from 'react';

import { IconCross } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { textDirection } from '@/lib/text-direction';
import { cn } from '@/lib/utils';

/** Field labels and group legends, per the brief. */
export const fieldLabelClass =
  'text-body-m text-muted-foreground dark:text-foreground';

/**
 * A text input with its validation message inside, at the input's end.
 *
 * Input and message share one direction, taken from the value (like
 * `dir="auto"`), or the page's while the value has no letters. Otherwise,
 * in Arabic, an empty or English value would lay out left-to-right while
 * the message sat on the left, on top of the text.
 */
export function FieldInput({
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
          className="text-body-l text-destructive-text pointer-events-none absolute inset-y-0 end-4 flex items-center"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/** A textarea with its validation message at the bottom end, same rules. */
export function FieldTextarea({
  error,
  className,
  value,
  ...props
}: ComponentProps<typeof Textarea> & {
  value: string;
  error?: string | undefined;
}) {
  const errorId = useId();
  const dir = textDirection(value);
  return (
    <div dir={dir} className="relative">
      <Textarea
        value={value}
        dir={dir}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(error && 'pb-8', className)}
        {...props}
      />
      {error && (
        <p
          id={errorId}
          className="text-body-l text-destructive-text pointer-events-none absolute end-4 bottom-2"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/** The ✕ that removes a row from an editable list. */
export function RemoveButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="text-muted-foreground hover:text-destructive-text focus-visible:ring-ring/50 touch-target -m-2 rounded-sm p-2 outline-none focus-visible:ring-3"
    >
      <IconCross />
    </button>
  );
}
