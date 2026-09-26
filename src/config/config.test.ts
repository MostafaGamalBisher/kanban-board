import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { COLUMN_DOT_CLASSES, columnDotClass } from './board.ts';
import { DEFAULT_LOCALE, LOCALE_DIRECTION, LOCALES, isLocale } from './i18n.ts';
import { DEFAULT_THEME, THEMES, isTheme } from './theme.ts';

describe('i18n config', () => {
  test('every locale has a text direction, and the default is supported', () => {
    for (const locale of LOCALES) {
      assert.ok(LOCALE_DIRECTION[locale]);
    }
    assert.ok(isLocale(DEFAULT_LOCALE));
    assert.equal(LOCALE_DIRECTION.ar, 'rtl');
  });

  test('isLocale accepts only supported locales', () => {
    assert.ok(isLocale('en'));
    assert.ok(isLocale('ar'));
    for (const value of ['fr', 'EN', '', undefined, null, 1]) {
      assert.equal(isLocale(value), false, String(value));
    }
  });
});

describe('theme config', () => {
  test('dark is the default and isTheme narrows correctly', () => {
    assert.equal(DEFAULT_THEME, 'dark');
    assert.deepEqual([...THEMES], ['dark', 'light']);
    assert.equal(isTheme('light'), true);
    assert.equal(isTheme('blue'), false);
  });
});

describe('columnDotClass', () => {
  test('assigns colours by position and repeats after the last one', () => {
    assert.equal(columnDotClass(0), 'bg-column-1');
    assert.equal(columnDotClass(5), 'bg-column-6');
    assert.equal(columnDotClass(6), 'bg-column-1');
    assert.equal(columnDotClass(13), 'bg-column-2');
  });

  test('never returns undefined, even for odd input', () => {
    for (const index of [-1, 2.7, 1000]) {
      assert.ok(COLUMN_DOT_CLASSES.includes(columnDotClass(index) as never));
    }
  });
});
