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
