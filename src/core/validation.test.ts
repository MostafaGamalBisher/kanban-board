import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { fieldErrors, toValidationKey } from './validation.ts';

describe('toValidationKey', () => {
  test('keeps known keys and maps anything else to invalid', () => {
    assert.equal(toValidationKey('required'), 'required');
    assert.equal(
      toValidationKey('Expected string, received number'),
      'invalid'
    );
  });
});

describe('fieldErrors', () => {
  test('keys each error by its field path', () => {
    assert.deepEqual(
      fieldErrors([
        { path: ['name'], message: 'required' },
        { path: ['columns', 1, 'name'], message: 'duplicateName' },
      ]),
      { name: 'required', 'columns.1.name': 'duplicateName' }
    );
  });

  test('the first issue for a field wins; unknown messages become invalid', () => {
    assert.deepEqual(
      fieldErrors([
        { path: ['name'], message: 'required' },
        { path: ['name'], message: 'tooLong' },
        { path: ['columns', 0, 'name'], message: 'Some library text' },
      ]),
      { name: 'required', 'columns.0.name': 'invalid' }
    );
  });
});
