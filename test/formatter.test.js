import test from 'node:test';
import assert from 'node:assert/strict';
import { appendResponseTime, formatResponseTime, renderHelp, renderKBBI, renderProcessing, renderStart, renderStats, richMessage, sourceButton, sourceCodeButton } from '../tgcloud/lib/formatter.js';

test('renders a readable KBBI rich message with details and source', () => {
  const markdown = renderKBBI({
    query: 'kucing',
    entries: [{
      word: 'kucing', headword: 'ku·cing', grammar: 'n',
      definitions: [{ number: 1, text: 'binatang **kecil**' }],
      sublemmas: [{ headword: '-- anggora', grammar: '', definitions: [{ number: null, text: 'jenis kucing' }] }],
      derivedEntries: [],
    }],
    related: ['kumis kucing'],
  });
  assert.match(markdown, /kucing/m);
  assert.match(markdown, /\*\*1\*\* binatang \*\*kecil\*\*/);
  assert.match(markdown, /<details>/);
  assert.match(markdown, /Contoh, variasi, dan kata turunan/);
  assert.match(markdown, /tg:\/\/emoji\?id=5359728403513620619/);
  assert.match(markdown, /anggora/);
  assert.match(markdown, /tg:\/\/emoji\?id=5357479219335012900/);
  assert.match(markdown, /KBBI Online/);
  assert.equal(sourceButton('rumah sakit').url, 'https://kbbi.web.id/rumah%20sakit');
});

test('help and stats avoid raw personal identifiers', () => {
  assert.match(renderHelp(), /@KBBI2bot rumah sakit/);
  assert.match(renderStats({
    requests: 1, cacheHits: 2, cacheMisses: 3, fetchSuccess: 4, notFound: 5,
    fetchErrors: 6, rateLimited: 7, guestQueries: 8, averageLatencyMs: 9, p95LatencyMs: 10,
  }), /\| Latency p95 \|/);
});

test('uses the requested custom emoji and keeps start examples on separate lines', () => {
  const start = renderStart();
  assert.match(start, /tg:\/\/emoji\?id=5357479219335012900/);
  assert.match(start, /tg:\/\/emoji\?id=5215194898508031379[^\n]*`\/kbbi kucing`/);
  assert.match(start, /\n[^\n]*`\/kbbi rumah sakit`/);
  assert.equal(sourceCodeButton().text, 'Lihat source code');
});

test('renders rich message buttons instead of inline keyboard markup', () => {
  const payload = richMessage('Isi', sourceButton('rumah sakit'));
  assert.match(payload.markdown, /<tg-button-row>/);
  assert.match(payload.markdown, /<tg-button type="url"/);
  assert.match(payload.markdown, /emoji-id="5289941455605876181"/);
  assert.match(payload.markdown, /https:\/\/kbbi\.web\.id\/rumah%20sakit/);
  assert.doesNotMatch(payload.markdown, /inline_keyboard/);
});

test('renders adaptive response time with the requested custom clock emoji', () => {
  assert.equal(formatResponseTime(245), '245 ms');
  assert.equal(formatResponseTime(1_250), '1.25 detik');
  const markdown = appendResponseTime('Hasil', 245);
  assert.match(markdown, /Waktu respons: \*\*245 ms\*\*/);
  assert.match(markdown, /tg:\/\/emoji\?id=5857092222050111367/);
});

test('uses the requested custom processing emoji', () => {
  assert.match(renderProcessing(), /tg:\/\/emoji\?id=6113844439292054570/);
});

test('truncates oversized rich output below the internal limit', () => {
  const markdown = renderKBBI({
    query: 'panjang',
    entries: [{ word: 'panjang', headword: 'panjang', grammar: 'a', definitions: [{ number: 1, text: 'x'.repeat(31_000) }] }],
    related: [],
  });
  assert.ok(markdown.length <= 30_000);
  assert.match(markdown, /Sebagian rincian dipangkas/);
});
