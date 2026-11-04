import db, { eq } from 'sdk/db';
import { kbbiCache } from '../schema.js';
import { CACHE_KEY_VERSION, CACHE_TTL_MS } from './constants.js';

function versionedKey(cacheKey) {
  return `${CACHE_KEY_VERSION}:${cacheKey}`;
}

export async function readCache(cacheKey, now = Date.now()) {
  const key = versionedKey(cacheKey);
  const row = await db.select().from(kbbiCache).where(eq(kbbiCache.cacheKey, key)).get();
  if (!row) return null;
  if (row.expiresAt <= now) return null;
  return row.payload;
}

export async function writeCache(cacheKey, payload, now = Date.now(), ttlMs = CACHE_TTL_MS) {
  const key = versionedKey(cacheKey);
  await db.insert(kbbiCache).values({
    cacheKey: key,
    payload,
    fetchedAt: now,
    expiresAt: now + ttlMs,
  }).onConflictDoUpdate({
    target: kbbiCache.cacheKey,
    set: { payload, fetchedAt: now, expiresAt: now + ttlMs },
  }).run();
  return payload;
}
