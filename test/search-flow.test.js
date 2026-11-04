import test from 'node:test';
import assert from 'node:assert/strict';
import { answerSearchWithProgress } from '../tgcloud/lib/search-flow.js';

test('completes search on serverless without timers or AbortSignal', async () => {
  const savedSignal = globalThis.AbortSignal;
  const savedTimer = globalThis.setTimeout;
  const calls = [];
  try {
    globalThis.AbortSignal = undefined;
    globalThis.setTimeout = undefined;
    await answerSearchWithProgress({
      argument: 'semangat', message: {},
      answerSearch: async ({ send }) => send('Hasil'),
      sendInitial: async () => ({ message_id: 1 }),
      edit: async (_, text) => calls.push(text),
      sendFallback: async (text) => calls.push(text),
    });
    assert.deepEqual(calls, ['Hasil']);
  } finally {
    globalThis.AbortSignal = savedSignal;
    globalThis.setTimeout = savedTimer;
  }
});

test('edits the processing message into the final rich result', async () => {
  const calls = [];
  await answerSearchWithProgress({
    message: { chat: { id: 1 } },
    argument: 'kucing',
    answerSearch: async ({ send }) => send('Hasil', { type: 'url', text: 'Sumber', url: 'https://example.test' }),
    sendInitial: async (markdown) => {
      calls.push(['initial', markdown]);
      return { message_id: 99 };
    },
    sendFallback: async () => calls.push(['fallback']),
    edit: async (sent, markdown, button, footer) => calls.push(['edit', sent, markdown, button, footer]),
  });

  assert.equal(calls[0][0], 'initial');
  assert.equal(calls[1][0], 'edit');
  assert.equal(calls[1][1].message_id, 99);
  assert.match(calls[1][2], /Hasil/);
  assert.doesNotMatch(calls[1][2], /Waktu respons/);
  assert.match(calls[1][4], /Waktu respons/);
  assert.equal(calls[2], undefined);
});

test('edits the processing message when the search times out', async () => {
  const calls = [];
  await answerSearchWithProgress({
    message: { chat: { id: 1 } },
    argument: 'bisa',
    timeoutMs: 5,
    answerSearch: async () => new Promise(() => {}),
    report: async () => {},
    sendInitial: async (markdown) => {
      calls.push(['initial', markdown]);
      return { message_id: 100 };
    },
    sendFallback: async () => calls.push(['fallback']),
    edit: async (sent, markdown, button, footer) => calls.push(['edit', sent, markdown, button, footer]),
  });

  assert.equal(calls[0][0], 'initial');
  assert.equal(calls[1][0], 'edit');
  assert.match(calls[1][2], /membutuhkan waktu terlalu lama/);
  assert.match(calls[1][4], /Waktu respons/);
});

test('edits the processing message when the search throws unexpectedly', async () => {
  const calls = [];
  const reports = [];
  await answerSearchWithProgress({
    message: { chat: { id: 1 } },
    argument: 'semangat',
    answerSearch: async () => { throw new Error('unexpected failure'); },
    report: async (details) => reports.push(details),
    sendInitial: async () => ({ message_id: 101 }),
    sendFallback: async () => calls.push(['fallback']),
    edit: async (sent, markdown, button, footer) => calls.push(['edit', markdown, footer]),
  });

  assert.equal(calls[0][0], 'edit');
  assert.match(calls[0][1], /Layanan KBBI sedang tidak dapat diakses/);
  assert.match(calls[0][2], /Waktu respons/);
  assert.equal(reports.length, 1);
  assert.equal(reports[0].type, 'Search flow error');
});
