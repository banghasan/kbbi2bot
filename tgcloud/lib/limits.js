import db, { sql } from 'sdk/db';
import { fetchSlots } from '../schema.js';
import { FETCH_LEASE_MS, MAX_FETCH_CONCURRENCY, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from './constants.js';

export async function consumeRateLimit(identity, now = Date.now()) {
  const limitKey = `user:${identity}`;
  const windowStartedAt = Math.floor(now / RATE_LIMIT_WINDOW_MS) * RATE_LIMIT_WINDOW_MS;
  await db.run(sql`
    INSERT INTO rate_limits (limit_key, window_started_at, request_count)
    VALUES (${limitKey}, ${windowStartedAt}, 1)
    ON CONFLICT(limit_key) DO UPDATE SET
      request_count = CASE
        WHEN window_started_at = ${windowStartedAt} THEN request_count + 1
        ELSE 1
      END,
      window_started_at = ${windowStartedAt}
  `);
  const row = await db.get(sql`SELECT request_count, window_started_at FROM rate_limits WHERE limit_key = ${limitKey}`);
  const count = Number(row?.request_count ?? 0);
  const allowed = count <= RATE_LIMIT_MAX;
  return {
    allowed,
    count,
    remaining: Math.max(0, RATE_LIMIT_MAX - count),
    retryAfterSeconds: Math.max(1, Math.ceil((windowStartedAt + RATE_LIMIT_WINDOW_MS - now) / 1000)),
  };
}

function leaseToken(now) {
  return `${now}-${Math.random().toString(36).slice(2, 12)}`;
}

async function ensureSlots() {
  const rows = Array.from({ length: MAX_FETCH_CONCURRENCY }, (_, index) => `(${index + 1}, '', 0)`).join(',');
  await db.run(sql.raw(`INSERT OR IGNORE INTO fetch_slots (slot_id, lease_token, leased_until) VALUES ${rows}`));
}

export async function acquireFetchSlot(options = {}) {
  const { now = Date.now(), attempts = 1 } = options;
  await ensureSlots();
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const token = leaseToken(Date.now());
    const result = await db.run(sql`
      UPDATE fetch_slots
      SET lease_token = ${token}, leased_until = ${now + FETCH_LEASE_MS}
      WHERE slot_id = (
        SELECT slot_id FROM fetch_slots
        WHERE leased_until < ${Date.now()}
        ORDER BY slot_id
        LIMIT 1
      )
      AND leased_until < ${Date.now()}
      RETURNING slot_id
    `);
    const slotId = result.rows?.[0]?.slot_id;
    if (slotId != null) return { slotId, token };
  }
  return null;
}

export async function releaseFetchSlot(lease) {
  if (!lease) return;
  await db.run(sql`
    UPDATE fetch_slots SET lease_token = '', leased_until = 0
    WHERE slot_id = ${lease.slotId} AND lease_token = ${lease.token}
  `);
}

const inFlight = new Map();

export async function withFetchSlot(key, producer) {
  if (inFlight.has(key)) return inFlight.get(key);
  const promise = (async () => {
    const lease = await acquireFetchSlot();
    if (!lease) {
      const error = new Error('Fetch concurrency limit reached');
      error.code = 'CONCURRENCY_LIMIT';
      throw error;
    }
    try {
      return await producer();
    } finally {
      await releaseFetchSlot(lease);
    }
  })();
  inFlight.set(key, promise);
  try {
    return await promise;
  } finally {
    inFlight.delete(key);
  }
}
