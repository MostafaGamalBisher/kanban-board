import { createCn } from 'cn/config';

/**
 * Custom font-size utilities defined in src/app/globals.css (`--text-*`).
 * Keep in sync with that file.
 *
 * Without this, the class merger cannot tell `text-body-l` (a size) from
 * `text-primary-foreground` (a color), treats them as the same group, and
 * silently drops the color. Always import `cn` from here, never from the
 * `cn` package directly (enforced by ESLint).
 */
const FONT_SIZES = [
  'heading-xl',
  'heading-l',
  'heading-m',
  'heading-s',
  'body-l',
  'body-m',
  'logo',
];

export const cn = createCn({
  extend: { classGroups: { 'font-size': [{ text: FONT_SIZES }] } },
});
