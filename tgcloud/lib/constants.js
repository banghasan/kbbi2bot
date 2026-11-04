export const BOT_USERNAME = 'KBBI2bot';
export const BOT_NAME = 'KBBI';
export const BOT_TAGLINE = 'Kamus Besar Bahasa Indonesia';
export const SOURCE_BASE_URL = 'https://kbbi.web.id';
export const SOURCE_CODE_URL = 'https://github.com/banghasan/kbbi2bot';
export const SUPPORT_URL = 'https://t.me/botindonesia';

export const MAX_QUERY_LENGTH = 100;
export const MAX_QUERY_WORDS = 3;
export const MAX_DEFINITIONS = 5;
export const MAX_SUBLEMMAS = 10;
export const MAX_DERIVED_ENTRIES = 5;
export const MAX_RELATED_WORDS = 10;
export const MAX_RICH_MESSAGE_LENGTH = 30_000;
export const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export const CACHE_KEY_VERSION = 'v2';
export const RATE_LIMIT_MAX = 10;
export const RATE_LIMIT_WINDOW_MS = 60 * 1000;
export const MAX_FETCH_CONCURRENCY = 3;
export const FETCH_TIMEOUT_MS = 8_000;
export const FETCH_LEASE_MS = 15_000;
export const MAX_LATENCY_SAMPLES = 1_000;

export const CUSTOM_EMOJI_IDS = Object.freeze({
  book: '5357479219335012900',
  info: '5467889436807157272',
  help: '5206479194388713063',
  arrow: '5215194898508031379',
  stats: '5364265190353286344',
  link: '5289941455605876181',
  pin: '5359728403513620619',
  clock: '5857092222050111367',
  processing: '6113844439292054570',
});
