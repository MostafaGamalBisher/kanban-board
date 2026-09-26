import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { ar } from './ar.ts';
import { en } from './en.ts';

type Tree = { readonly [key: string]: string | Tree };

/** Flattens to `path → texts` (a plural contributes all of its forms). */
function flatten(tree: Tree, prefix = ''): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      out.set(path, [value]);
    } else if ('other' in value && typeof value.other === 'string') {
      out.set(path, Object.values(value) as string[]);
    } else {
      for (const [p, texts] of flatten(value, path)) out.set(p, texts);
    }
  }
  return out;
}

const placeholders = (text: string) =>
  new Set([...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]));

const english = flatten(en as unknown as Tree);
const arabic = flatten(ar as unknown as Tree);

describe('dictionaries', () => {
  test('have exactly the same keys', () => {
    assert.deepEqual([...arabic.keys()].sort(), [...english.keys()].sort());
  });

  test('contain no empty text', () => {
    for (const [path, texts] of [...english, ...arabic]) {
      for (const text of texts) assert.ok(text.trim(), path);
    }
  });

  test('Arabic uses only placeholders the English text defines', () => {
    for (const [path, arTexts] of arabic) {
      const allowed = new Set(
        (english.get(path) ?? []).flatMap((t) => [...placeholders(t)])
      );
      for (const text of arTexts) {
        for (const name of placeholders(text)) {
          assert.ok(
            allowed.has(name),
            `${path}: unknown {${name}} in "${text}"`
          );
        }
      }
    }
  });

  test('plain (non-plural) texts use the same placeholders in both', () => {
    for (const [path, [enText, ...rest]] of english) {
      if (rest.length > 0 || enText === undefined) continue; // plurals: forms may omit {count}
      const arText = arabic.get(path)?.[0] ?? '';
      assert.deepEqual(placeholders(arText), placeholders(enText), path);
    }
  });
});
