import test from 'node:test';
import assert from 'node:assert/strict';
import { appendResponseTime, buttonForHelp, formatResponseTime, renderHelp, renderKBBI, renderNotFound, renderProcessing, renderStart, renderStats, responseTimeFooter, richMessage, sourceButton, sourceCodeButton } from '../tgcloud/lib/formatter.js';

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
  assert.match(markdown, /\(1\) binatang \*\*kecil\*\*/);
  assert.match(markdown, /<details>/);
  assert.match(markdown, /Variasi/);
  assert.match(markdown, /Terkait/);
  assert.match(markdown, /tg:\/\/emoji\?id=6064273567439132467/);
  assert.match(markdown, /kumis kucing/);
  assert.doesNotMatch(markdown, /- kumis kucing/);
  assert.match(markdown, /tg:\/\/emoji\?id=5359728403513620619/);
  assert.match(markdown, /anggora/);
  assert.match(markdown, /tg:\/\/emoji\?id=5357479219335012900/);
  assert.doesNotMatch(markdown, /Sumber: \[KBBI Online\]/);
  assert.equal(sourceButton('rumah sakit').url, 'https://kbbi.web.id/rumah%20sakit');
});

test('keeps homonym entries separate and includes variations from each entry', () => {
  const markdown = renderKBBI({
    query: 'kamus',
    entries: [
      { word: 'kamus¹', headword: 'ka·mus¹', grammar: 'n', definitions: [{ number: 1, text: 'buku acuan' }], sublemmas: [{ headword: '-- besar', grammar: '', definitions: [{ number: null, text: 'variasi pertama' }] }], derivedEntries: [] },
      { word: 'kamus²', headword: 'ka·mus²', grammar: 'Jw n', definitions: [{ number: null, text: 'kulit' }], sublemmas: [], derivedEntries: [{ headword: 'me·ngamus', grammar: 'v', definitions: [{ number: null, text: 'menyamaki kulit' }] }] },
    ],
    related: [],
  });
  assert.match(markdown, /ka·mus¹/);
  assert.match(markdown, /ka·mus²/);
  assert.match(markdown, /me·ngamus/);
});

test('puts visible numbered definitions on separate lines', () => {
  const markdown = renderKBBI({
    query: 'lupa',
    entries: [{
      word: 'lupa', headword: 'lu·pa', grammar: 'v',
      definitions: [
        { number: 1, text: 'lepas dari ingatan' },
        { number: 2, text: 'tidak teringat' },
      ],
      sublemmas: [], derivedEntries: [],
    }],
    related: [],
  });
  assert.match(markdown, /\*\*lu·pa\*\* _v_<br>\n\(1\) lepas dari ingatan<br>\n\(2\) tidak teringat/);
});

test('puts the first definition on a new line for every main entry', () => {
  const markdown = renderKBBI({
    query: 'bisa',
    entries: [{
      word: 'bisa¹', headword: 'bi·sa¹', grammar: 'v',
      definitions: [{ number: null, text: 'mampu melakukan sesuatu' }],
      sublemmas: [], derivedEntries: [],
    }],
    related: [],
  });
  assert.match(markdown, /\*\*bi·sa¹\*\* _v_<br>\n• mampu melakukan sesuatu/);
});

test('help and stats avoid raw personal identifiers', () => {
  assert.match(renderHelp(), /@KBBI2bot rumah sakit/);
  assert.doesNotMatch(renderHelp(), /Source code:/);
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
  assert.equal(sourceCodeButton().text, 'Source code');
  assert.match(start, /Mode guest/);
  assert.equal(buttonForHelp().length, 2);
  assert.equal(buttonForHelp()[0].emojiId, '5911271585221710692');
});

test('renders rich message buttons instead of inline keyboard markup', () => {
  const payload = richMessage('Isi', sourceButton('rumah sakit'));
  assert.match(payload.markdown, /<tg-button-row align="left">/);
  assert.match(payload.markdown, /align="left"/);
  assert.match(payload.markdown, /<tg-button type="url"/);
  assert.doesNotMatch(payload.markdown, /style="primary"/);
  assert.match(payload.markdown, /emoji-id="5289941455605876181"/);
  assert.match(payload.markdown, /Sumber/);
  assert.doesNotMatch(payload.markdown, /inline_keyboard/);
});

test('renders adaptive response time with the requested custom clock emoji', () => {
  assert.equal(formatResponseTime(245), '245 ms');
  assert.equal(formatResponseTime(1_250), '1.25 detik');
  const markdown = appendResponseTime('Hasil', 245);
  assert.match(markdown, /Waktu respons: \*\*245 ms\*\*/);
  assert.match(markdown, /tg:\/\/emoji\?id=5857092222050111367/);
  assert.match(responseTimeFooter(245), /tg:\/\/emoji\?id=5857092222050111367/);
});

test('uses the requested custom processing emoji', () => {
  assert.match(renderProcessing(), /tg:\/\/emoji\?id=6113844439292054570/);
});

test('uses the requested custom not-found emoji', () => {
  assert.match(renderNotFound(), /tg:\/\/emoji\?id=5212992409213872592/);
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
