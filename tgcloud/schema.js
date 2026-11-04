import { index, integer, json, table, text } from 'sdk/db';

export const kbbiCache = table('kbbi_cache', {
  cacheKey: text('cache_key').primaryKey(),
  payload: json('payload').notNull(),
  fetchedAt: integer('fetched_at').notNull(),
  expiresAt: integer('expires_at').notNull(),
}, (t) => ({
  expiresIdx: index('idx_kbbi_cache_expires').on(t.expiresAt),
}));

export const rateLimits = table('rate_limits', {
  limitKey: text('limit_key').primaryKey(),
  windowStartedAt: integer('window_started_at').notNull(),
  requestCount: integer('request_count').notNull().default(0),
});

export const metrics = table('metrics', {
  metricKey: text('metric_key').primaryKey(),
  metricValue: integer('metric_value').notNull().default(0),
  updatedAt: integer('updated_at').notNull(),
});

export const latencySamples = table('latency_samples', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  durationMs: integer('duration_ms').notNull(),
  createdAt: integer('created_at').notNull(),
}, (t) => ({
  createdIdx: index('idx_latency_samples_created').on(t.createdAt),
}));

export const fetchSlots = table('fetch_slots', {
  slotId: integer('slot_id').primaryKey(),
  leaseToken: text('lease_token').notNull().default(''),
  leasedUntil: integer('leased_until').notNull().default(0),
});
