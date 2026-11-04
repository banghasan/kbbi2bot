import { FETCH_TIMEOUT_MS } from './constants.js';
import { ajaxUrlForQuery, randomAjaxSuffix } from './text.js';
import { isNotFoundPayload, parseKBBIResponse } from './kbbi-parser.js';

export class KBBIUnavailableError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'KBBIUnavailableError';
    this.cause = cause;
    this.kind = cause?.kind ?? 'upstream';
  }
}

export class KBBINotFoundError extends Error {
  constructor() {
    super('KBBI entry not found');
    this.name = 'KBBINotFoundError';
  }
}

async function requestJson(url, fetchImpl, timeoutMs) {
  const signal = typeof globalThis.AbortSignal?.timeout === 'function'
    ? globalThis.AbortSignal.timeout(timeoutMs) : undefined;
  const response = await fetchImpl(url, {
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'KBBI2bot/1.0 (+https://github.com/banghasan/kbbi2bot)',
    },
    ...(signal ? { signal } : {}),
  });
  if (!response.ok) {
    const error = new Error(`KBBI HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  try {
    return await response.json();
  } catch (error) {
    error.kind = 'parse';
    throw error;
  }
}

function isNotFoundError(error) {
  return error?.status === 404;
}

function isRetryable(error) {
  return !isNotFoundError(error) && (!error?.status || error.status >= 500);
}

async function fetchPayload(query, options = {}) {
  const {
    fetchImpl,
    random = Math.random,
    timeoutMs = FETCH_TIMEOUT_MS,
    retryDelayMs: _retryDelayMs = 75,
  } = options;
  if (typeof fetchImpl !== 'function') throw new TypeError('fetchImpl is required');
  const url = ajaxUrlForQuery(query, randomAjaxSuffix(random));
  let lastError;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const payload = await requestJson(url, fetchImpl, timeoutMs);
      if (isNotFoundPayload(payload)) throw new KBBINotFoundError();
      return payload;
    } catch (error) {
      if (error instanceof KBBINotFoundError) throw error;
      if (isNotFoundError(error)) throw new KBBINotFoundError();
      lastError = error;
      // Telegram Serverless does not expose setTimeout; retry immediately once.
      // The request itself is bounded by AbortSignal.timeout when available.
      if (attempt === 0 && isRetryable(error)) continue;
    }
  }

  throw new KBBIUnavailableError('KBBI source is unavailable', lastError);
}

export async function fetchKBBIRaw(query, options = {}) {
  return fetchPayload(query, options);
}

export async function fetchKBBI(query, options = {}) {
  const payload = await fetchPayload(query, options);
  let parsed;
  try {
    parsed = parseKBBIResponse(payload, query);
  } catch (error) {
    error.kind = 'parse';
    throw error;
  }
  if (!parsed) throw new KBBINotFoundError();
  return parsed;
}
