import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ajaxUrlForQuery,
  commandParts,
  extractMentionQuery,
  normalizeQuery,
  randomAjaxSuffix,
  sourceUrlForQuery,
  validateQuery,
} from '../tgcloud/lib/text.js';

test('normalizes Indonesian query whitespace and casing', () => {
  assert.equal(normalizeQuery('  Rumah   Sakit  '), 'rumah sakit');
  assert.deepEqual(validateQuery('Rumah Sakit'), { ok: true, query: 'rumah sakit', words: ['rumah', 'sakit'] });
});

test('validates query length, word count, and characters', () => {
  assert.equal(validateQuery('').reason, 'empty');
  assert.equal(validateQuery('satu dua tiga empat').reason, 'words');
  assert.equal(validateQuery('rumah sakit?').reason, 'characters');
  assert.equal(validateQuery('kupu-kupu').ok, true);
  assert.equal(validateQuery('a'.repeat(101)).reason, 'length');
});

test('builds encoded KBBI URLs and five character ajax suffixes', () => {
  assert.equal(sourceUrlForQuery('Rumah Sakit'), 'https://kbbi.web.id/rumah%20sakit');
  assert.equal(ajaxUrlForQuery('rumah atau sakit', 'abc12'), 'https://kbbi.web.id/rumah-atau-sakit/ajax_abc12');
  assert.equal(randomAjaxSuffix(() => 0.123456), '4fzyo');
});

test('parses commands and case-insensitive mentions', () => {
  assert.deepEqual(commandParts('/kbbi@KBBI2bot rumah sakit'), {
    command: 'kbbi', username: 'KBBI2bot', argument: 'rumah sakit',
  });
  assert.equal(extractMentionQuery('@kbbI2BOT rumah sakit'), 'rumah sakit');
  assert.equal(extractMentionQuery('@otherbot rumah sakit'), null);
});
