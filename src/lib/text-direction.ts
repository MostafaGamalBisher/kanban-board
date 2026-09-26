const RIGHT_TO_LEFT =
  /[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Syriac}\p{Script=Thaana}\p{Script=Nko}]/u;
const LETTER = /\p{L}/u;

/**
 * The direction of a piece of text, from its first strong (letter)
 * character, the same rule `dir="auto"` uses. `undefined` when there is no
 * letter yet (empty, digits, punctuation): the caller then inherits the
 * page direction.
 *
 * Needed where the direction must be known in JavaScript, e.g. to put a
 * field's error message on the same side as the field's end.
 */
export function textDirection(text: string): 'ltr' | 'rtl' | undefined {
  for (const char of text) {
    if (RIGHT_TO_LEFT.test(char)) return 'rtl';
    if (LETTER.test(char)) return 'ltr';
  }
  return undefined;
}
