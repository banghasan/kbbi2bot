import { BOT_USERNAME, MAX_QUERY_LENGTH, MAX_QUERY_WORDS, SOURCE_BASE_URL } from './constants.js';

const MARKDOWN_SPECIALS = /([\\_*[\]()~`>#+\-=|{}.!])/g;
const QUERY_ALLOWED = /^[\p{L}\p{M}\p{N}\s'’\-]+$/u;

export function escapeMarkdown(value = '') {
  return String(value).replace(MARKDOWN_SPECIALS, '\\$1');
}

export function decodeHtmlEntities(value = '') {
  return String(value)
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, code) => {
      const number = code.toLowerCase().startsWith('x')
        ? Number.parseInt(code.slice(1), 16)
        : Number.parseInt(code, 10);
      return Number.isFinite(number) ? String.fromCodePoint(number) : _;
    })
    .replace(/&(nbsp|amp|lt|gt|quot|apos|hellip|mdash|ndash|lsquo|rsquo|ldquo|rdquo);/gi, (_, name) => ({
      nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", hellip: '…',
      mdash: '—', ndash: '–', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
    }[name.toLowerCase()] ?? _));
}

export function stripHtml(value = '') {
  return decodeHtmlEntities(String(value).replace(/<[^>]*>/g, ''))
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeQuery(input = '') {
  return String(input)
    .normalize('NFC')
    .replace(/\s+/gu, ' ')
    .trim()
    .toLocaleLowerCase('id-ID');
}

export function validateQuery(input) {
  const query = normalizeQuery(input);
  if (!query) return { ok: false, reason: 'empty', query };
  if (query.length > MAX_QUERY_LENGTH) return { ok: false, reason: 'length', query };
  if (!QUERY_ALLOWED.test(query)) return { ok: false, reason: 'characters', query };
  const words = query.split(' ').filter(Boolean);
  if (words.length > MAX_QUERY_WORDS) return { ok: false, reason: 'words', query, words };
  return { ok: true, query, words };
}

export function sourceUrlForQuery(query) {
  const sourcePath = normalizeQuery(query).replace(/\s+atau\s+/gi, '-atau-');
  return `${SOURCE_BASE_URL}/${encodeURIComponent(sourcePath)}`;
}

export function ajaxUrlForQuery(query, suffix) {
  const sourcePath = normalizeQuery(query).replace(/\s+atau\s+/gi, '-atau-');
  return `${SOURCE_BASE_URL}/${encodeURIComponent(sourcePath)}/ajax_${suffix}`;
}

export function randomAjaxSuffix(random = Math.random) {
  return random().toString(36).slice(2, 7).padEnd(5, '0');
}

export function extractMentionQuery(text = '', username = BOT_USERNAME) {
  const value = String(text).trim();
  const mention = new RegExp(`^@${username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s+|$)`, 'iu');
  if (!mention.test(value)) return null;
  return value.replace(mention, '').trim();
}

export function commandParts(text = '') {
  const value = String(text).trim();
  const match = value.match(/^\/(\w+)(?:@([A-Za-z0-9_]+))?(?:\s+([\s\S]*))?$/u);
  if (!match) return null;
  return { command: match[1].toLocaleLowerCase('id-ID'), username: match[2] ?? null, argument: (match[3] ?? '').trim() };
}

export function truncateText(value, maxLength = MAX_RICH_MESSAGE_LENGTH) {
  const text = String(value);
  if (text.length <= maxLength) return text;
  const suffix = '\n\n_… Sebagian rincian dipangkas agar pesan tetap nyaman dibaca\._';
  return `${text.slice(0, Math.max(0, maxLength - suffix.length))}${suffix}`;
}

export function formatDuration(ms) {
  return `${Math.max(0, Math.round(ms))} ms`;
}
