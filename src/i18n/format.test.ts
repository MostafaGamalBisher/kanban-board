import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ar } from './dictionaries/ar.ts';
import { en } from './dictionaries/en.ts';
import { createI18n } from './format.ts';

const english = createI18n('en', en);
const arabic = createI18n('ar', ar);

describe('plural', () => {
  test('English: one / other', () => {
    const forms = en.board.taskCount;
    assert.equal(english.plural(forms, 0), '0 tasks');
    assert.equal(english.plural(forms, 1), '1 task');
    assert.equal(english.plural(forms, 2), '2 tasks');
    assert.equal(english.plural(forms, 1000), '1,000 tasks');
  });

  test('Arabic: all six forms, including 103 (few) and 111 (many)', () => {
    const forms = ar.board.taskCount;
    const cases: [number, string][] = [
      [0, 'لا توجد مهام'],
      [1, 'مهمة واحدة'],
      [2, 'مهمتان'],
      [3, '٣ مهام'],
      [10, '١٠ مهام'],
      [11, '١١ مهمة'],
      [99, '٩٩ مهمة'],
      [100, '١٠٠ مهمة'],
      [102, '١٠٢ مهمة'],
      [103, '١٠٣ مهام'],
      [111, '١١١ مهمة'],
    ];
    for (const [count, expected] of cases) {
      assert.equal(arabic.plural(forms, count), expected, `count ${count}`);
    }
  });
});

describe('format', () => {
  test('fills placeholders and formats numbers with the locale digits', () => {
    assert.equal(
      english.format(en.board.subtaskProgress, { done: 2, total: 3 }),
      '2 of 3 subtasks'
    );
    assert.equal(
      arabic.format(ar.board.subtaskProgress, { done: 2, total: 3 }),
      'المهام الفرعية: ٢ من ٣'
    );
  });

  test('leaves an unknown placeholder visible rather than dropping it', () => {
    assert.equal(english.format('Hi {name}', {}), 'Hi {name}');
  });

  test('isolates inserted text (bidi) without changing it', () => {
    assert.equal(
      english.format('Delete {name}?', { name: 'Q3 Launch 2.0' }),
      'Delete \u2068Q3 Launch 2.0\u2069?'
    );
    // A numeric-looking string is still text: isolated, not reformatted.
    assert.equal(arabic.format('{name}', { name: '42' }), '\u206842\u2069');
  });

  test('does not isolate numbers (they are already locale-formatted)', () => {
    assert.equal(arabic.format('{n}', { n: 42 }), '٤٢');
  });
});

describe('number and direction', () => {
  test('uses the configured digits and direction', () => {
    assert.equal(english.number(1234.5), '1,234.5');
    assert.equal(arabic.number(1234.5), '١٬٢٣٤٫٥');
    assert.equal(english.dir, 'ltr');
    assert.equal(arabic.dir, 'rtl');
  });
});
