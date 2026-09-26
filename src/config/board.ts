/**
 * Status-dot colour for each column, by position: the first column gets
 * the first colour, and after the sixth the colours repeat. The colours
 * are theme tokens in globals.css (`--color-column-*`); the class names
 * are written out in full so Tailwind can find them.
 */
export const COLUMN_DOT_CLASSES = [
  'bg-column-1',
  'bg-column-2',
  'bg-column-3',
  'bg-column-4',
  'bg-column-5',
  'bg-column-6',
] as const;

export function columnDotClass(columnIndex: number): string {
  const count = COLUMN_DOT_CLASSES.length;
  const index = ((Math.trunc(columnIndex) % count) + count) % count;
  return COLUMN_DOT_CLASSES[index] ?? COLUMN_DOT_CLASSES[0];
}
