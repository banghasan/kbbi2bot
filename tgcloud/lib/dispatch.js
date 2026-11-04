import { KBBINotFoundError, KBBIUnavailableError } from './kbbi-fetch.js';
import { renderConcurrencyBusy, renderInvalidInput, renderKBBI, renderNotFound, renderRateLimited, renderSourceUnavailable, sourceButton } from './formatter.js';
import { lookupKBBI } from './kbbi-service.js';
import { consumeRateLimit } from './limits.js';
import { METRIC_KEYS } from './metrics.js';
import { safeIncrement, userIdentity, validateSearch } from './handler-utils.js';
import { reportError } from './error-reporter.js';

export async function answerSearch({ message, argument, send }) {
  const validation = validateSearch(argument);
  if (!validation.ok) {
    await send(renderInvalidInput());
    return { status: 'invalid' };
  }

  let limit;
  try {
    limit = await consumeRateLimit(userIdentity(message));
  } catch (error) {
    console.warn('rate limit unavailable', error?.message);
    limit = { allowed: true };
  }
  if (!limit.allowed) {
    await safeIncrement(METRIC_KEYS.rateLimited);
    await send(renderRateLimited(limit.retryAfterSeconds));
    return { status: 'rate_limited' };
  }

  let markdown;
  let replyMarkup;
  let status = 'ok';
  let caughtError;
  const startedAt = Date.now();
  try {
    const { result } = await lookupKBBI(validation.query);
    markdown = renderKBBI(result);
    replyMarkup = sourceButton(validation.query);
  } catch (error) {
    caughtError = error;
    if (error instanceof KBBINotFoundError) {
      markdown = renderNotFound();
      status = 'not_found';
    } else if (error?.code === 'CONCURRENCY_LIMIT') {
      await safeIncrement(METRIC_KEYS.concurrencyBusy);
      markdown = renderConcurrencyBusy();
      status = 'busy';
    } else if (error instanceof KBBIUnavailableError) {
      markdown = renderSourceUnavailable();
      status = 'source_error';
    } else {
      console.error('unexpected KBBI error', error);
      markdown = renderSourceUnavailable();
      status = 'source_error';
    }
  }
  await send(markdown, replyMarkup);
  if (caughtError && status === 'source_error') {
    await reportError({ type: 'KBBI source error', query: validation.query, error: caughtError, durationMs: Date.now() - startedAt });
  }
  return { status, query: status === 'ok' || status === 'not_found' ? validation.query : undefined };
}
