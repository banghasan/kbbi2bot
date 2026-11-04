import { api } from 'sdk';
import { LOG_CONFIG } from './runtime-config.js';
import { richMessage } from './formatter.js';
import { logTarget } from './log-target.js';

function clean(value, maxLength = 500) {
  return String(value ?? 'Tidak diketahui').replace(/[\r\n]+/gu, ' ').slice(0, maxLength);
}

export async function reportError({ type, query, error, durationMs }) {
  if (!LOG_CONFIG?.chatId) return false;
  const message = [
    '# 🚨 KBBI2bot Error',
    '',
    `**Jenis:** ${clean(type)}`,
    `**Query:** \`${clean(query, 100)}\``,
    `**Durasi:** ${Math.max(0, Math.round(Number(durationMs) || 0))} ms`,
    `**Error:** \`${clean(error?.name || error?.code || 'Error')} — ${clean(error?.message)}\``,
  ].join('\n');

  try {
    await api.sendRichMessage({
      ...logTarget(LOG_CONFIG),
      rich_message: richMessage(message),
    });
    return true;
  } catch (reportingError) {
    console.error('error report failed', reportingError);
    return false;
  }
}
