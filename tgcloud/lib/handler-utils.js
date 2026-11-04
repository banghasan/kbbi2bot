import { BOT_USERNAME } from './constants.js';
import { incrementMetric, recordLatency } from './metrics.js';
import { commandParts, extractMentionQuery, validateQuery } from './text.js';

export function isPrivate(message) {
  return message?.chat?.type === 'private';
}

export function userIdentity(message) {
  return String(message?.from?.id ?? message?.guest_bot_caller_user?.id ?? message?.chat?.id ?? 'anonymous');
}

export function parseNormalInput(message) {
  const text = message?.text ?? '';
  const command = commandParts(text);
  if (command) {
    if (command.username && command.username.toLocaleLowerCase('id-ID') !== BOT_USERNAME.toLocaleLowerCase('id-ID')) return null;
    return { kind: 'command', ...command };
  }
  const mentioned = extractMentionQuery(text);
  return mentioned == null ? null : { kind: 'guest-like', argument: mentioned };
}

export function parseGuestInput(message) {
  const text = message?.text ?? '';
  const mentioned = extractMentionQuery(text);
  return mentioned == null ? String(text).trim() : mentioned;
}

export function validateSearch(argument) {
  return validateQuery(argument);
}

export async function safeIncrement(metricKey, amount = 1) {
  try { await incrementMetric(metricKey, amount); } catch (error) { console.warn('metric increment failed', error?.message); }
}

export async function safeRecordLatency(startedAt) {
  const endedAt = typeof globalThis.performance?.now === 'function' ? globalThis.performance.now() : Date.now();
  try { await recordLatency(endedAt - startedAt); } catch (error) { console.warn('latency metric failed', error?.message); }
}

export function nowMs() {
  return typeof globalThis.performance?.now === 'function' ? globalThis.performance.now() : Date.now();
}
