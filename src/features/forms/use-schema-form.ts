'use client';

import { useState, type FormEvent, type RefObject } from 'react';
import type { z } from 'zod';

import { fieldErrors } from '@/core/validation';
import { useI18n } from '@/i18n/provider';

/**
 * Validation for a form whose rules are a zod schema from core/.
 *
 * - Errors appear after the first submit, then update as the user types.
 * - Each field's message is its ValidationKey, translated.
 * - A failed submit focuses the first invalid field: form controls carry
 *   a `name` equal to the issue path (`title`, `subtasks.1.title`).
 * - A valid submit calls `onValid` with the parsed (trimmed, typed) data.
 */
export function useSchemaForm<Schema extends z.ZodType>(
  formRef: RefObject<HTMLFormElement | null>,
  schema: Schema,
  values: unknown,
  onValid: (data: z.output<Schema>) => void
) {
  const { dict } = useI18n();
  const [submitted, setSubmitted] = useState(false);

  const result = submitted ? schema.safeParse(values) : undefined;
  const errors =
    result?.success === false ? fieldErrors(result.error.issues) : {};

  const errorText = (field: string): string | undefined => {
    const key = errors[field];
    return key && dict.validation[key];
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setSubmitted(true);
      const [first] = Object.keys(fieldErrors(parsed.error.issues));
      const field = first && formRef.current?.elements.namedItem(first);
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    onValid(parsed.data);
  };

  return { errorText, handleSubmit };
}
