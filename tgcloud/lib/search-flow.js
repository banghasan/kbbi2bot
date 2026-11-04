import { SEARCH_TIMEOUT_MS } from './constants.js';
import { renderProcessing, renderSearchTimeout, renderSourceUnavailable, responseTimeFooter } from './formatter.js';

async function defaultReportError(details) {
  console.error('search error', details.type, details.error);
}

class SearchTimeoutError extends Error {
  constructor() {
    super('KBBI search timed out');
    this.name = 'SearchTimeoutError';
  }
}

function timeoutPromise(timeoutMs) {
  if (typeof globalThis.AbortSignal?.timeout === 'function') {
    const signal = globalThis.AbortSignal.timeout(timeoutMs);
    return new Promise((_, reject) => {
      if (signal.aborted) {
        reject(new SearchTimeoutError());
        return;
      }
      signal.addEventListener('abort', () => reject(new SearchTimeoutError()), { once: true });
    });
  }
  if (typeof globalThis.setTimeout === 'function') {
    return new Promise((_, reject) => {
      globalThis.setTimeout(() => reject(new SearchTimeoutError()), timeoutMs);
    });
  }
  return null;
}

export async function answerSearchWithProgress({ message, argument, answerSearch, sendInitial, sendFallback, edit, timeoutMs = SEARCH_TIMEOUT_MS, report = defaultReportError }) {
  const startedAt = typeof globalThis.performance?.now === 'function' ? globalThis.performance.now() : Date.now();
  let progressMessage;

  try {
    progressMessage = await sendInitial(renderProcessing());
  } catch (error) {
    console.warn('processing message failed', error?.message);
  }

  const sendResult = async (markdown, replyMarkup) => {
    const duration = (typeof globalThis.performance?.now === 'function' ? globalThis.performance.now() : Date.now()) - startedAt;
    const footer = responseTimeFooter(duration);
    if (progressMessage) {
      try {
        await edit(progressMessage, markdown, replyMarkup, footer);
        return;
      } catch (error) {
        console.warn('processing message edit failed', error?.message);
      }
    }
    await sendFallback(markdown, replyMarkup, footer);
  };

  let timedOut = false;
  const guardedSend = async (markdown, replyMarkup) => {
    if (timedOut) return;
    return sendResult(markdown, replyMarkup);
  };

  try {
    const operation = Promise.resolve().then(() => answerSearch({ message, argument, send: guardedSend }));
    const timeout = timeoutPromise(timeoutMs);
    return await (timeout ? Promise.race([operation, timeout]) : operation);
  } catch (error) {
    timedOut = true;
    if (error instanceof SearchTimeoutError) {
      await sendResult(renderSearchTimeout());
      await report({ type: 'Search timeout', query: argument, error, durationMs: (typeof globalThis.performance?.now === 'function' ? globalThis.performance.now() : Date.now()) - startedAt });
      return { status: 'timeout' };
    }
    console.error('search flow failed', error);
    await sendResult(renderSourceUnavailable());
    try {
      await report({ type: 'Search flow error', query: argument, error, durationMs: (typeof globalThis.performance?.now === 'function' ? globalThis.performance.now() : Date.now()) - startedAt });
    } catch (reportError) {
      console.error('search error reporting failed', reportError);
    }
    return { status: 'source_error' };
  }
}
