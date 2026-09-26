import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { fromAcceptLanguage, negotiateLocale } from './locale-negotiation.ts';

describe('fromAcceptLanguage', () => {
  const cases: [string | null, string | undefined][] = [
    ['ar-EG,ar;q=0.9,en;q=0.8', 'ar'],
    ['en-US,en;q=0.9', 'en'],
    ['fr-FR,fr;q=0.9,ar;q=0.5', 'ar'], // first supported one
    ['en;q=0.5, ar;q=0.9', 'ar'], // q beats position
    ['en, ar', 'en'], // equal q: position decides
    ['AR-sa', 'ar'], // case-insensitive
    ['ar;q=0, en;q=0.1', 'en'], // q=0 means "not acceptable"
    ['fr, de', undefined],
    ['*', undefined],
    ['', undefined],
    [null, undefined],
    ['en;q=abc, ar', 'ar'], // malformed q is ignored
  ];
  for (const [header, expected] of cases) {
    test(`${JSON.stringify(header)} → ${expected ?? 'none'}`, () => {
      assert.equal(fromAcceptLanguage(header), expected);
    });
  }
});

describe('negotiateLocale', () => {
  test('a supported cookie wins over the header', () => {
    assert.equal(negotiateLocale('ar', 'en-US,en;q=0.9'), 'ar');
  });

  test('an unsupported or missing cookie falls back to the header', () => {
    assert.equal(negotiateLocale('fr', 'ar-EG'), 'ar');
    assert.equal(negotiateLocale(undefined, 'ar-EG'), 'ar');
  });

  test('nothing usable falls back to the default locale', () => {
    assert.equal(negotiateLocale(undefined, 'fr, de'), 'en');
    assert.equal(negotiateLocale(undefined, null), 'en');
  });
});
