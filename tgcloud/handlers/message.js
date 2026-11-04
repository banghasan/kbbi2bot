import { readStats } from '../lib/metrics.js';
import { answerSearch } from '../lib/dispatch.js';
import { buttonForHelp, buttonForStart, renderHelp, renderPing, renderPrivateOnly, renderStart, renderStats, renderStatsUnavailable } from '../lib/formatter.js';
import { safeIncrement, safeRecordLatency, isPrivate, nowMs, parseNormalInput } from '../lib/handler-utils.js';
import { METRIC_KEYS } from '../lib/metrics.js';
import { sendRichToChat } from '../lib/telegram.js';

export default async function messageHandler(message) {
  const startedAt = nowMs();
  try {
    const parsed = parseNormalInput(message);
    if (!parsed) return;
    await safeIncrement(METRIC_KEYS.requests);

    const send = (markdown, replyMarkup) => sendRichToChat(message, markdown, replyMarkup);
    if (parsed.kind === 'guest-like') {
      await answerSearch({ message, argument: parsed.argument, send });
      return;
    }

    switch (parsed.command) {
      case 'start':
        await send(renderStart(), buttonForStart());
        break;
      case 'help':
        await send(renderHelp(), buttonForHelp());
        break;
      case 'ping':
        await send(renderPing(nowMs() - startedAt));
        break;
      case 'stats':
        if (!isPrivate(message)) {
          await send(renderPrivateOnly());
          break;
        }
        let stats;
        try {
          stats = await readStats();
        } catch (error) {
          console.error('stats failed', error);
          await send(renderStatsUnavailable());
          break;
        }
        await send(renderStats(stats));
        break;
      case 'kbbi':
        await answerSearch({ message, argument: parsed.argument, send });
        break;
      default:
        break;
    }
  } finally {
    await safeRecordLatency(startedAt);
  }
}
