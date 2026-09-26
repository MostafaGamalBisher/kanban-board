import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { createId, uuidFromRandomBytes } from './ids.ts';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('createId', () => {
  test('returns a version 4 UUID', () => {
    assert.match(createId(), UUID_V4);
  });

  test('falls back when crypto.randomUUID is unavailable (plain HTTP)', () => {
    // randomUUID lives on Crypto.prototype; an own property shadows it.
    Object.defineProperty(crypto, 'randomUUID', {
      value: undefined,
      configurable: true,
    });
    try {
      assert.equal(crypto.randomUUID, undefined);
      assert.match(createId(), UUID_V4);
    } finally {
      delete (crypto as { randomUUID?: unknown }).randomUUID;
    }
    assert.equal(typeof crypto.randomUUID, 'function');
  });
});

describe('uuidFromRandomBytes', () => {
  test('produces valid, unique version 4 UUIDs', () => {
    const ids = Array.from({ length: 5000 }, uuidFromRandomBytes);
    for (const id of ids) {
      assert.match(id, UUID_V4);
    }
    assert.equal(new Set(ids).size, ids.length);
  });
});
