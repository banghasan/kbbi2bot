import {
  BOT_NAME,
  BOT_TAGLINE,
  BOT_USERNAME,
  MAX_DEFINITIONS,
  MAX_DERIVED_ENTRIES,
  MAX_SUBLEMMAS,
  CUSTOM_EMOJI_IDS,
  MAX_RICH_MESSAGE_LENGTH,
  SOURCE_CODE_URL,
  SOURCE_BASE_URL,
  SUPPORT_URL,
} from './constants.js';
import { escapeMarkdown, formatDuration, sourceUrlForQuery, truncateText } from './text.js';

function customEmoji(emoji, id) {
  return `![${emoji}](tg://emoji?id=${id})`;
}

const EMOJI = {
  book: customEmoji('📚', CUSTOM_EMOJI_IDS.book),
  info: customEmoji('ℹ️', CUSTOM_EMOJI_IDS.info),
  help: customEmoji('❓', CUSTOM_EMOJI_IDS.help),
  arrow: customEmoji('➡️', CUSTOM_EMOJI_IDS.arrow),
  stats: customEmoji('📊', CUSTOM_EMOJI_IDS.stats),
  link: customEmoji('🔗', CUSTOM_EMOJI_IDS.link),
  pin: customEmoji('📌', CUSTOM_EMOJI_IDS.pin),
  clock: customEmoji('⌚️', CUSTOM_EMOJI_IDS.clock),
  processing: customEmoji('⏳', CUSTOM_EMOJI_IDS.processing),
  notFound: customEmoji('❌', CUSTOM_EMOJI_IDS.notFound),
};

export function sourceButton(query) {
  return { type: 'url', text: 'Sumber', emoji: '🔗', emojiId: CUSTOM_EMOJI_IDS.link, url: sourceUrlForQuery(query) };
}

export function supportButton() {
  return { type: 'url', text: 'Support Telegram Bot Indonesia', emoji: '🤝', emojiId: CUSTOM_EMOJI_IDS.support, url: SUPPORT_URL };
}

export function sourceCodeButton() {
  return { type: 'url', text: 'Source code', emoji: '🔗', emojiId: CUSTOM_EMOJI_IDS.link, url: SOURCE_CODE_URL };
}

export function renderKBBI(result) {
  const lines = [`# ${EMOJI.book} ${escapeMarkdown(result.query)}`, ''];
  const selectedDefinitions = result.entries.map(() => []);
  let definitionsRemaining = MAX_DEFINITIONS;
  for (let index = 0; index < result.entries.length && definitionsRemaining > 0; index += 1) {
    const definition = result.entries[index].definitions[0];
    if (definition) {
      selectedDefinitions[index].push(definition);
      definitionsRemaining -= 1;
    }
  }
  for (let index = 0; index < result.entries.length && definitionsRemaining > 0; index += 1) {
    for (const definition of result.entries[index].definitions.slice(1)) {
      if (!definitionsRemaining) break;
      selectedDefinitions[index].push(definition);
      definitionsRemaining -= 1;
    }
  }

  for (const [index, entry] of result.entries.entries()) {
    const definitions = selectedDefinitions[index];
    if (!definitions.length) continue;
    const head = `**${escapeMarkdown(entry.headword || entry.word)}**`;
    const grammar = entry.grammar ? ` _${escapeMarkdown(entry.grammar)}_` : '';
    lines.push(`${head}${grammar}`);
    for (const definition of definitions) {
      const prefix = definition.number == null ? '•' : `(${definition.number})`;
      lines.push(`${prefix} ${definition.text}`);
    }
    lines.push('');
  }

  let sublemmasRemaining = MAX_SUBLEMMAS;
  let derivedRemaining = MAX_DERIVED_ENTRIES;
  const variationEntries = result.entries.map((entry) => {
    const sublemmas = (entry.sublemmas ?? []).slice(0, Math.max(0, sublemmasRemaining));
    const derivedEntries = (entry.derivedEntries ?? []).slice(0, Math.max(0, derivedRemaining));
    sublemmasRemaining -= sublemmas.length;
    derivedRemaining -= derivedEntries.length;
    return { entry, sublemmas, derivedEntries };
  });
  if (variationEntries.some((item) => item.sublemmas.length || item.derivedEntries.length) || result.related.length) {
    lines.push(`<details><summary>${EMOJI.pin} Variasi</summary>`);
    const multipleEntries = result.entries.length > 1;
    for (const item of variationEntries) {
      if (!item.sublemmas.length && !item.derivedEntries.length) continue;
      if (multipleEntries) lines.push(`**${escapeMarkdown(item.entry.headword || item.entry.word)}**`);
      for (const entry of [...item.sublemmas, ...item.derivedEntries]) {
        const head = `**${escapeMarkdown(entry.headword)}**`;
        const grammar = entry.grammar ? ` _${escapeMarkdown(entry.grammar)}_` : '';
        lines.push(`${head}${grammar}`);
        for (const definition of entry.definitions) {
          const prefix = definition.number == null ? '•' : `(${definition.number})`;
          lines.push(`${prefix} ${definition.text}`);
        }
      }
      lines.push('');
    }
    if (result.related.length) {
      lines.push('', '**Hasil terkait:**');
      for (const word of result.related) lines.push(`- ${escapeMarkdown(word)}`);
    }
    lines.push('</details>', '');
  }

  return truncateText(lines.join('\n'), MAX_RICH_MESSAGE_LENGTH);
}

export function renderStart() {
  return [
    `# ${EMOJI.book} ${BOT_NAME}`,
    `_${BOT_TAGLINE}_`,
    '',
    'Cari arti kata atau frasa Bahasa Indonesia langsung dari Telegram.',
    '',
    '**Contoh:**<br><br>',
    `${EMOJI.arrow} \`/kbbi kucing\`<br>`,
    `${EMOJI.arrow} \`/kbbi rumah sakit\``,
    '<br>',
    '**Mode guest:**<br><br>',
    'Gunakan mention bot langsung di chat atau grup:<br><br>',
    `${EMOJI.arrow} \`@KBBI2bot rumah sakit\``,
    '<br>',
    `> ${EMOJI.info} Bot ini menggunakan KBBI Online dan bukan layanan resmi dari kementrian pendidikan`,
  ].join('\n');
}

export function renderHelp() {
  return [
    `# ${EMOJI.help} Bantuan KBBI`,
    '',
    '**Private chat:**<br><br>',
    `${EMOJI.arrow} \`/kbbi rumah sakit\`<br>`,
    `${EMOJI.arrow} \`/ping\`<br>`,
    `${EMOJI.arrow} \`/stats\``,
    '<br>',
    '**Group atau guest mode:**<br><br>',
    `${EMOJI.arrow} \`@KBBI2bot rumah sakit\`<br>`,
    `${EMOJI.arrow} \`/kbbi@KBBI2bot rumah sakit\``,
    '<br>',
    'Pencarian dibatasi maksimal 3 kata dan 100 karakter.',
  ].join('\n');
}

export function renderPing(durationMs) {
  return `# 🏓 Pong!\n\n⚡ Response time: **${formatDuration(durationMs)}**`;
}

export function renderNotFound() {
  return `${EMOJI.notFound} **Kata atau frasa tidak ditemukan.**`;
}

export function renderInvalidInput() {
  return '⚠️ **Masukkan maksimal 3 kata dan 100 karakter.**\n\nContoh: `/kbbi rumah sakit`';
}

export function renderSourceUnavailable() {
  return '⚠️ **Layanan KBBI sedang tidak dapat diakses.**\n\nSilakan coba lagi beberapa saat.';
}

export function renderRateLimited(retryAfterSeconds = 60) {
  return `⏳ **Batas pencarian tercapai.**\n\nCoba lagi dalam sekitar ${Math.max(1, retryAfterSeconds)} detik.`;
}

export function renderConcurrencyBusy() {
  return '⏳ **Permintaan sedang padat.**\n\nSilakan coba lagi beberapa saat.';
}

export function renderProcessing() {
  return `${EMOJI.processing} **Sedang memproses pencarian...**\n\nMohon tunggu sebentar.`;
}

export function formatResponseTime(durationMs) {
  const duration = Math.max(0, Number(durationMs) || 0);
  if (duration < 1000) return `${Math.round(duration)} ms`;
  return `${(duration / 1000).toFixed(2).replace(/\.00$/, '')} detik`;
}

export function appendResponseTime(markdown, durationMs) {
  return `${markdown}\n\n${responseTimeFooter(durationMs)}`;
}

export function responseTimeFooter(durationMs) {
  return `${EMOJI.clock} Waktu respons: **${formatResponseTime(durationMs)}**`;
}

export function renderPrivateOnly() {
  return '🔒 **Perintah ini hanya tersedia di private chat.**';
}

export function renderStats(stats) {
  return [
    `# ${EMOJI.stats} Statistik KBBI`,
    '',
    '| Metrik | Nilai |',
    '|:--|--:|',
    `| Request | **${stats.requests}** |`,
    `| Cache hit | **${stats.cacheHits}** |`,
    `| Cache miss | **${stats.cacheMisses}** |`,
    `| Fetch sukses | **${stats.fetchSuccess}** |`,
    `| Tidak ditemukan | **${stats.notFound}** |`,
    `| Error sumber | **${stats.fetchErrors}** |`,
    `| Parse error | **${stats.parseErrors}** |`,
    `| Rate limit | **${stats.rateLimited}** |`,
    `| Concurrency padat | **${stats.concurrencyBusy}** |`,
    `| Guest query | **${stats.guestQueries}** |`,
    `| Latency rata-rata | **${formatDuration(stats.averageLatencyMs)}** |`,
    `| Latency p95 | **${formatDuration(stats.p95LatencyMs)}** |`,
  ].join('\n');
}

export function renderAccessDenied() {
  return '⛔ **Statistik hanya dapat dilihat melalui private chat bot.**';
}

export function renderStatsUnavailable() {
  return '⚠️ **Statistik belum tersedia.**\n\nSilakan coba lagi beberapa saat.';
}

function escapeRichHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function richButton(button) {
  if (!button?.url || !button?.text) return '';
  const emoji = button.emojiId
    ? `<tg-emoji emoji-id="${escapeRichHtml(button.emojiId)}">${escapeRichHtml(button.emoji ?? '')}</tg-emoji> `
    : escapeRichHtml(button.emoji ? `${button.emoji} ` : '');
  const style = button.style ? ` style="${escapeRichHtml(button.style)}"` : '';
  return `<tg-button type="url"${style} url="${escapeRichHtml(button.url)}">${emoji}${escapeRichHtml(button.text)}</tg-button>`;
}

export function richMessage(markdown, buttons = [], footer = '') {
  const list = (Array.isArray(buttons) ? buttons : [buttons]).filter(Boolean);
  const buttonMarkup = list.length
    ? `\n\n<tg-button-row align="left">${list.map(richButton).join('')}</tg-button-row>`
    : '';
  const footerMarkup = footer ? `\n\n${footer}` : '';
  return { markdown: `${markdown}${buttonMarkup}${footerMarkup}`, skip_entity_detection: true };
}

export function buttonForStart() {
  return supportButton();
}

export function buttonForHelp() {
  return [supportButton(), sourceCodeButton()];
}

export const SOURCE_LABEL = SOURCE_BASE_URL;
export const USERNAME_LABEL = BOT_USERNAME;
