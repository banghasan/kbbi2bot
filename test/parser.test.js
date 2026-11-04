import test from 'node:test';
import assert from 'node:assert/strict';
import { htmlToMarkdown, parseKBBIResponse } from '../tgcloud/lib/kbbi-parser.js';

test('converts supported KBBI HTML markup to rich Markdown', () => {
  const markdown = htmlToMarkdown('<b>ku&#183;cing</b> <em>n</em> <code>mono</code><br>contoh &mdash; aman');
  assert.equal(markdown, '**ku·cing** *n* `mono`\ncontoh — aman');
});

test('does not treat italic text inside a definition as the word class', () => {
  const parsed = parseKBBIResponse([
    { x: 1, w: 'ayam', d: '<b>ayam</b> <em>n</em> unggas<br><b>-- beroga</b> ayam jantan, <em>Callus ferrugineus</em>;' },
  ], 'ayam');
  assert.equal(parsed.entries[0].grammar, 'n');
  assert.equal(parsed.entries[0].sublemmas[0].headword, '-- beroga');
  assert.match(parsed.entries[0].sublemmas[0].definitions[0].text, /Callus ferrugineus/);
});

test('parses JSON payload into main definitions and related words', () => {
  const parsed = parseKBBIResponse([
    { x: 1, w: 'kucing', d: '<b>ku&#183;cing</b> <em>n</em> <b>1</b> binatang; <b>2</b> hewan<br><b>-- anggora</b> jenis kucing<br><b>kucing-kucing</b> <em>n</em> tiruan kucing' },
    { x: 5, w: 'kumis kucing', d: '<b>ku&#183;mis</b> <em>n</em> sesuatu' },
    { x: 9, w: 'lainnya', d: '<b>lainnya</b> <em>a</em> tambahan' },
  ], 'kucing');
  assert.equal(parsed.entries[0].headword, 'ku·cing');
  assert.equal(parsed.entries[0].grammar, 'n');
  assert.deepEqual(parsed.entries[0].definitions.map((item) => item.number), [1, 2]);
  assert.equal(parsed.entries[0].sublemmas[0].headword, '-- anggora');
  assert.equal(parsed.entries[0].derivedEntries[0].headword, 'kucing-kucing');
  assert.deepEqual(parsed.related, ['kumis kucing', 'lainnya']);
});

test('returns null for empty or unusable payloads', () => {
  assert.equal(parseKBBIResponse([], 'x'), null);
  assert.equal(parseKBBIResponse([{ x: 1, w: 'x', d: '' }], 'x'), null);
});
