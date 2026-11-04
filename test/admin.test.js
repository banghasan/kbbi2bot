import test from 'node:test';
import assert from 'node:assert/strict';
import { isAdmin } from '../tgcloud/lib/admin.js';

test('only explicitly listed sender IDs have admin access', () => {
  assert.equal(isAdmin({ from: { id: 123 } }, ['123']), true);
  assert.equal(isAdmin({ from: { id: 456 }, chat: { id: 123 } }, ['123']), false);
  assert.equal(isAdmin({ from: { id: 123 } }), false);
  assert.equal(isAdmin({}, ['123']), false);
});
