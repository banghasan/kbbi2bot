import test from 'node:test';
import assert from 'node:assert/strict';
import { answerSearchWithProgress } from '../tgcloud/lib/search-flow.js';

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
