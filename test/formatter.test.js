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
  assert.match(markdown, /==\\-\\- anggora==/);
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
  assert.match(markdown, /==lu·pa== _v_\n\n\(1\) lepas dari ingatan<br>\n\(2\) tidak teringat/);
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
  assert.match(markdown, /==bi·sa¹== _v_\n\n• mampu melakukan sesuatu/);
});

test('renders main definition examples as quoted lines without changing variations', () => {
  const markdown = renderKBBI({
    query: 'bisa',
    entries: [{
      word: 'bisa¹', headword: 'bi·sa¹', grammar: 'v',
      definitions: [{ number: null, text: 'mampu melakukan sesuatu; dapat: ia \\-\\- membaca, tetapi tidak \\-\\- menulis; alah \\-\\- oleh (karena) biasa' }],
      sublemmas: [{ headword: '-- ber bisa', grammar: '', definitions: [{ number: null, text: 'contoh variasi' }] }],
      derivedEntries: [],
    }],
    related: [],
  });
  assert.match(markdown, /• mampu melakukan sesuatu; dapat:<br>\n!\[🔵\]\(tg:\/\/emoji\?id=5357094458984769398\) ia \\-\\- membaca, tetapi tidak \\-\\- menulis<br>\n!\[🔵\]\(tg:\/\/emoji\?id=5357094458984769398\) alah \\-\\- oleh/);
  assert.match(markdown, /==\\-\\- ber bisa==\n• contoh variasi/);
});

test('closes a main definition quote before the next numbered definition', () => {
  const markdown = renderKBBI({
    query: 'rasa',
    entries: [{
      word: 'rasa', headword: 'ra·sa¹', grammar: 'n',
      definitions: [
        { number: 1, text: 'tanggapan indra' },
        { number: 2, text: 'apa yang dialami oleh badan: \\-\\- pedih dan nyeri di perut;' },
        { number: 3, text: 'sifat rasa suatu benda' },
      ],
      sublemmas: [], derivedEntries: [],
    }],
    related: [],
  });
  assert.match(markdown, /==ra·sa¹== _n_\n\n\(1\) tanggapan indra<br>\n\(2\) apa yang dialami oleh badan:<br>\n!\[🔵\]\(tg:\/\/emoji\?id=5357094458984769398\) \\-\\- pedih dan nyeri di perut;<br>\n\(3\) sifat rasa suatu benda/);
});

test('puts embedded numbered definitions on separate quoted lines', () => {
  const markdown = renderKBBI({
    query: 'bisa',
    entries: [{
      word: 'bisa²', headword: 'bi·sa²', grammar: 'n',
      definitions: [{ number: 1, text: 'zat racun; \\(2\\) ki sesuatu yang buruk' }],
      sublemmas: [], derivedEntries: [],
    }],
    related: [],
  });
  assert.match(markdown, /==bi·sa²== _n_\n\n\(1\) zat racun;<br>\n/);
  assert.ok(markdown.includes('\n\\(2\\) ki sesuatu yang buruk'));
});

test('splits numbered definitions when the number is bold-marked', () => {
  const markdown = renderKBBI({
    query: 'bisa',
    entries: [{
      word: 'bisa²', headword: 'bi·sa²', grammar: 'n',
      definitions: [{ number: 1, text: 'zat racun; **\\(2\\)** ki sesuatu yang buruk' }],
      sublemmas: [], derivedEntries: [],
    }],
    related: [],
  });
  assert.ok(markdown.includes('\n\\(2\\) ki sesuatu yang buruk'));
});

test('splits adjacent examples when KBBI omits the space after semicolon', () => {
  const markdown = renderKBBI({
    query: 'bisa',
    entries: [{
      word: 'bisa¹', headword: 'bi·sa¹', grammar: 'v',
      definitions: [{ number: null, text: 'mampu; dapat: *ia \\-\\- membaca;alah \\-\\- oleh, pb* sesuatu' }],
      sublemmas: [], derivedEntries: [],
    }],
    related: [],
  });
  assert.match(markdown, /!\[🔵\]\(tg:\/\/emoji\?id=5357094458984769398\) \*ia \\-\\- membaca<br>\n!\[🔵\]\(tg:\/\/emoji\?id=5357094458984769398\) alah \\-\\- oleh/);
});

test('help and stats avoid raw personal identifiers', () => {
  assert.match(renderHelp(), /@KBBI2bot rumah sakit/);
  assert.match(renderHelp(), /Keterangan singkatan/);
  assert.match(renderHelp(), /`a` — adjektiva \/ kata sifat/);
  assert.match(renderHelp(), /`pb` — peribahasa/);
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
