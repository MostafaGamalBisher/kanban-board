/**
 * Validation results are codes, never sentences. The domain does not
 * choose a language: the UI translates each key through the i18n
 * dictionary (Phase 5).
 */
export const VALIDATION_KEYS = [
  'required',
  'tooLong',
  'duplicateName',
  'duplicateId',
  'invalid',
] as const;

export type ValidationKey = (typeof VALIDATION_KEYS)[number];

export function isValidationKey(value: string): value is ValidationKey {
  return (VALIDATION_KEYS as readonly string[]).includes(value);
}

/**
 * Maps a validation message to a known key. Anything unexpected (for
 * example a library's built-in English message) becomes `invalid`, so no
 * untranslated text can reach the user.
 */
export function toValidationKey(message: string): ValidationKey {
  return isValidationKey(message) ? message : 'invalid';
}

/** The part of a validation issue that fieldErrors() reads (zod's shape). */
export interface ValidationIssue {
  readonly path: readonly PropertyKey[];
  readonly message: string;
}

/**
 * Turns validation issues into one error per form field, keyed by the
 * field's path (`name`, `columns.1.name`). The first issue for a field
 * wins, so the user sees one message at a time.
 */
export function fieldErrors(
  issues: readonly ValidationIssue[]
): Readonly<Record<string, ValidationKey>> {
  const errors: Record<string, ValidationKey> = {};
  for (const issue of issues) {
    const field = issue.path.map(String).join('.');
    errors[field] ??= toValidationKey(issue.message);
  }
  return errors;
}
