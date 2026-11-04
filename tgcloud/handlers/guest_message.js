import { answerSearch } from '../lib/dispatch.js';
import { renderInvalidInput } from '../lib/formatter.js';
import { safeIncrement, safeRecordLatency, nowMs, parseGuestInput, validateSearch } from '../lib/handler-utils.js';
import { METRIC_KEYS } from '../lib/metrics.js';
import { answerSearchWithProgress } from '../lib/search-flow.js';
import { answerGuestRich, editGuestRich } from '../lib/telegram.js';

export default async function guestMessageHandler(message) {
  const startedAt = nowMs();
  try {
    await safeIncrement(METRIC_KEYS.requests);
    await safeIncrement(METRIC_KEYS.guestQueries);
    const argument = parseGuestInput(message);
    const send = (markdown, replyMarkup) => answerGuestRich(message, markdown, replyMarkup);
    if (!validateSearch(argument).ok) {
      await send(renderInvalidInput());
      return;
    }
    await answerSearchWithProgress({
      message,
      argument,
      answerSearch,
      sendInitial: send,
      sendFallback: send,
      edit: (sent, markdown, replyMarkup) => editGuestRich(sent, markdown, replyMarkup),
    });
  } finally {
    await safeRecordLatency(startedAt);
  }
}
