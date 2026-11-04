import test from 'node:test';
import assert from 'node:assert/strict';
import { logTarget } from '../tgcloud/lib/log-target.js';

test('empty chat disables logging even with a thread configured', () => {
  assert.equal(logTarget(), null);
  assert.equal(logTarget({ chatId: ' ', threadId: '727' }), null);
});

test('chat without thread omits the thread field entirely', () => {
  assert.deepEqual(logTarget({ chatId: '-100123', threadId: ' ' }), { chat_id: '-100123' });
});

test('configured topic is converted to an integer', () => {
  assert.deepEqual(logTarget({ chatId: '-100123', threadId: '727' }), {
    chat_id: '-100123', message_thread_id: 727,
  });
  assert.throws(() => logTarget({ chatId: '-100123', threadId: 'abc' }));
});
