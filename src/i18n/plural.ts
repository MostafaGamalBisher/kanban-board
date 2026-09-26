/**
 * A pluralized message: one text per plural category. Which category a
 * number falls into is decided by Intl.PluralRules for the locale.
 *
 *   English: one (1), other (0, 2, 3, …)
 *   Arabic:  zero (0), one (1), two (2), few (3–10, 103…), many (11–99,
 *            111…), other (100–102, …)
 */
export type PluralCategory = Intl.LDMLPluralRule;

export type Plural = Readonly<
  Partial<Record<PluralCategory, string>> & { other: string }
>;

/** English needs exactly `one` and `other`. */
export function englishPlural(forms: { one: string; other: string }): Plural {
  return forms;
}

/** Arabic must provide all six forms: a missing one is a compile error. */
export function arabicPlural(forms: Record<PluralCategory, string>): Plural {
  return forms;
}
