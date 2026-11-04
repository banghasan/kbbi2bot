import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchKBBI, fetchKBBIRaw, KBBINotFoundError, KBBIUnavailableError } from '../tgcloud/lib/kbbi-http.js';

function response(payload, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => payload };
}

test('fetches and parses a KBBI JSON response', async () => {
  const result = await fetchKBBI('kucing', {
    random: () => 0.123456,
    fetchImpl: async (url, options) => {
      assert.match(url, /https:\/\/kbbi\.web\.id\/kucing\/ajax_4fzyo/);
      assert.equal(options.headers['X-Requested-With'], 'XMLHttpRequest');
      return response([{ x: 1, w: 'kucing', d: '<b>ku&#183;cing</b> <em>n</em> <b>1</b> binatang' }]);
    },
  });
  assert.equal(result.entries[0].word, 'kucing');
});

test('classifies empty response as not found', async () => {
  await assert.rejects(
    fetchKBBI('tidakada', { fetchImpl: async () => response([]) }),
    KBBINotFoundError,
  );
});

test('classifies a 404 response as not found without retrying', async () => {
  let calls = 0;
  await assert.rejects(
    fetchKBBI('tidakada', { fetchImpl: async () => { calls += 1; return response({}, 404); } }),
    KBBINotFoundError,
  );
  assert.equal(calls, 1);
});

test('retries one transient upstream failure then succeeds', async () => {
  let calls = 0;
  const result = await fetchKBBI('kucing', {
    retryDelayMs: 0,
    fetchImpl: async () => {
      calls += 1;
      if (calls === 1) return response({}, 503);
      return response([{ x: 1, w: 'kucing', d: '<b>ku&#183;cing</b> <em>n</em> <b>1</b> binatang' }]);
    },
  });
  assert.equal(calls, 2);
  assert.equal(result.entries[0].word, 'kucing');
});

test('classifies repeated upstream failures as unavailable', async () => {
  await assert.rejects(
    fetchKBBI('kucing', { retryDelayMs: 0, fetchImpl: async () => response({}, 503) }),
    KBBIUnavailableError,
  );
});

test('can fetch the raw JSON payload for parser-independent caching', async () => {
  const payload = [{ x: 1, w: 'kucing', d: '<b>ku&#183;cing</b> <em>n</em> binatang' }];
  const result = await fetchKBBIRaw('kucing', { fetchImpl: async () => response(payload) });
  assert.deepEqual(result, payload);
});
