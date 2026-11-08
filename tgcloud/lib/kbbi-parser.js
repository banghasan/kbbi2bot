import {
  MAX_DEFINITIONS,
  MAX_DERIVED_ENTRIES,
  MAX_RELATED_WORDS,
  MAX_SUBLEMMAS,
} from './constants.js';
import { decodeHtmlEntities, stripHtml } from './text.js';

const TAG_TOKEN = /<!--[\s\S]*?-->|<[^>]*>|&(?:#x[0-9a-f]+|#\d+|[a-z]+);|[^<&]+/gi;
const SUPERSCRIPT_DIGITS = Object.freeze({ '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' });

function superscriptNumber(value) {
  return String(value).replace(/[0-9]/g, (digit) => SUPERSCRIPT_DIGITS[digit]);
}

function normalizeIndexedWord(value, fallback = '') {
  const source = String(value);
  const index = source.match(/<sup\b[^>]*>\s*(\d+)\s*<\/sup>/i)?.[1];
  const withoutIndex = source.replace(/<sup\b[^>]*>\s*\d+\s*<\/sup>/gi, '');
  const word = stripHtml(withoutIndex) || fallback;
  return index ? `${word}${superscriptNumber(index)}` : word;
}

function escapeRichText(value) {
  return String(value).replace(/([\\_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

export function htmlToMarkdown(html = '') {
  const source = String(html);
  let output = '';
  for (const token of source.match(TAG_TOKEN) ?? []) {
    if (token.startsWith('<!--')) continue;
    if (token.startsWith('<')) {
      const tag = token.match(/^<\s*(\/?)\s*([a-z0-9]+)[^>]*>/i);
      if (!tag) continue;
      const closing = Boolean(tag[1]);
      const name = tag[2].toLowerCase();
      if (name === 'br') output += '\n';
      else if (name === 'b' || name === 'strong') output += closing ? '**' : '**';
      else if (name === 'i' || name === 'em') output += closing ? '*' : '*';
      else if (name === 'code') output += '`';
      else if (name === 'sup' || name === 'sub') output += closing ? `</${name}>` : `<${name}>`;
      else if (name === 'p' || name === 'div' || name === 'li') output += closing ? '\n' : (name === 'li' ? '- ' : '');
      else if (name === 'hr' && !closing) output += '\n---\n';
      continue;
    }
    output += escapeRichText(decodeHtmlEntities(token));
  }
  return output
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function firstTagContent(html, tagName) {
  const match = String(html).match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return match ? match[1] : '';
}

function parseDefinitionSegment(segment, fallbackWord) {
  const headword = normalizeIndexedWord(firstTagContent(segment, 'b'), fallbackWord);
  const headTag = String(segment).match(/<b\b[^>]*>[\s\S]*?<\/b>/i);
  const afterHead = headTag ? String(segment).slice(headTag.index + headTag[0].length) : String(segment);
  const grammarMatch = afterHead.match(/^\s*(?:\/[^<]*\/\s*)?<(?:em|i)\b[^>]*>([\s\S]*?)<\/(?:em|i)>/i);
  const grammar = stripHtml(grammarMatch?.[1] ?? '');
  const numbered = [...String(segment).matchAll(/<b\b[^>]*>\s*(\d+)\s*<\/b>/gi)];
  const definitions = [];

  if (numbered.length) {
    // Some KBBI entries omit the "1" marker, e.g. `<b>ma·kan</b> <em>v</em> memasukkan ... <b>2</b> ...`.
    const firstNumber = Number(numbered[0][1]);
    if (headTag && firstNumber > 1) {
      const leadStart = headTag.index + headTag[0].length + (grammarMatch ? grammarMatch.index + grammarMatch[0].length : 0);
      const lead = htmlToMarkdown(String(segment).slice(leadStart, numbered[0].index));
      if (lead) definitions.push({ number: firstNumber - 1, text: lead });
    }
    for (let i = 0; i < numbered.length && definitions.length < MAX_DEFINITIONS; i += 1) {
      const start = numbered[i].index + numbered[i][0].length;
      const end = numbered[i + 1]?.index ?? segment.length;
      const text = htmlToMarkdown(segment.slice(start, end));
      if (text) definitions.push({ number: Number(numbered[i][1]), text });
    }
  } else {
    const withoutHead = headTag
      ? afterHead.replace(grammarMatch?.[0] ?? '', '')
      : String(segment);
    const text = htmlToMarkdown(withoutHead) || htmlToMarkdown(segment);
    if (text) definitions.push({ number: null, text });
  }

  const expandedDefinitions = [];
  for (const definition of definitions) {
    const markers = [...definition.text.matchAll(/;\s*[*_]*(\\?\(\\?(\d+)\\?\))[*_]*\s+/g)];
    if (!markers.length) {
      expandedDefinitions.push(definition);
      continue;
    }

    let start = 0;
    let number = definition.number;
    for (const marker of markers) {
      const before = definition.text.slice(start, marker.index + 1).trim();
      if (before) expandedDefinitions.push({ number, text: before });
      start = marker.index + marker[0].length;
      number = Number(marker[2]);
    }
    const remainder = definition.text.slice(start).trim();
    if (remainder) expandedDefinitions.push({ number, text: remainder });
  }

  return { headword, grammar, definitions: expandedDefinitions.slice(0, MAX_DEFINITIONS) };
}

function entrySegments(html) {
  return String(html)
    .split(/<br\s*\/?>/gi)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function parseKBBIResponse(payload, query) {
  if (!Array.isArray(payload)) throw new TypeError('Respons KBBI bukan array JSON');
  const usable = payload.filter((item) => item && typeof item.d === 'string' && typeof item.w === 'string');
  if (!usable.length) return null;

  let main = usable.filter((item) => Number(item.x) === 1);
  if (!main.length) main = usable.slice(0, 1);

  const entries = main.map((item) => {
    const segments = entrySegments(item.d);
    const parsed = parseDefinitionSegment(segments[0] ?? item.d, normalizeIndexedWord(item.w));
    const additional = segments
      .slice(1)
      .map((segment) => parseDefinitionSegment(segment, normalizeIndexedWord(item.w)))
      .filter((entry) => entry.definitions.length);
    const sublemmas = additional.filter((entry) => entry.headword.trim().startsWith('--')).slice(0, MAX_SUBLEMMAS);
    const derivedEntries = additional
      .filter((entry) => !entry.headword.trim().startsWith('--'))
      .slice(0, MAX_DERIVED_ENTRIES);
    return { word: normalizeIndexedWord(item.w), ...parsed, sublemmas, derivedEntries };
  }).filter((entry) => entry.definitions.length);

  if (!entries.length) return null;

  const mainWords = new Set(entries.map((entry) => entry.word.toLocaleLowerCase('id-ID')));
  const related = [];
  for (const item of usable) {
    const word = normalizeIndexedWord(item.w);
    const key = word.toLocaleLowerCase('id-ID');
    if (!word || mainWords.has(key) || related.some((candidate) => candidate.toLocaleLowerCase('id-ID') === key)) continue;
    if (Number(item.x) === 5 || Number(item.x) === 9) related.push(word);
    if (related.length >= MAX_RELATED_WORDS) break;
  }

  return { query, entries, related };
}

export function isNotFoundPayload(payload) {
  return Array.isArray(payload) && payload.length === 0;
}
