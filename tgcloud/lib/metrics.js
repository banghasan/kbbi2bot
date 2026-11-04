import db, { desc, sql } from 'sdk/db';
import { latencySamples, metrics } from '../schema.js';
import { MAX_LATENCY_SAMPLES } from './constants.js';

export const METRIC_KEYS = {
  requests: 'requests',
  cacheHits: 'cache_hits',
  cacheMisses: 'cache_misses',
  fetchSuccess: 'fetch_success',
  notFound: 'not_found',
  fetchErrors: 'fetch_errors',
  rateLimited: 'rate_limited',
  guestQueries: 'guest_queries',
  parseErrors: 'parse_errors',
  concurrencyBusy: 'concurrency_busy',
};

export async function incrementMetric(metricKey, amount = 1, now = Date.now()) {
  await db.run(sql`
    INSERT INTO metrics (metric_key, metric_value, updated_at)
    VALUES (${metricKey}, ${amount}, ${now})
    ON CONFLICT(metric_key) DO UPDATE SET
      metric_value = metric_value + ${amount},
      updated_at = ${now}
  `);
}

export async function recordLatency(durationMs, now = Date.now()) {
  await db.insert(latencySamples).values({ durationMs: Math.max(0, Math.round(durationMs)), createdAt: now }).run();
  await db.run(sql`
    DELETE FROM latency_samples
    WHERE id NOT IN (SELECT id FROM latency_samples ORDER BY id DESC LIMIT ${MAX_LATENCY_SAMPLES})
  `);
}

function percentile(values, percentileValue) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((percentileValue / 100) * sorted.length) - 1);
  return sorted[Math.max(0, index)];
}

export async function readStats() {
  const rows = await db.select().from(metrics).all();
  const values = Object.fromEntries(rows.map((row) => [row.metricKey, Number(row.metricValue) || 0]));
  const samples = await db.select({ durationMs: latencySamples.durationMs })
    .from(latencySamples)
    .orderBy(desc(latencySamples.id))
    .limit(MAX_LATENCY_SAMPLES)
    .all();
  const durations = samples.map((row) => Number(row.durationMs) || 0);
  const total = durations.reduce((sum, duration) => sum + duration, 0);
  return {
    requests: values[METRIC_KEYS.requests] ?? 0,
    cacheHits: values[METRIC_KEYS.cacheHits] ?? 0,
    cacheMisses: values[METRIC_KEYS.cacheMisses] ?? 0,
    fetchSuccess: values[METRIC_KEYS.fetchSuccess] ?? 0,
    notFound: values[METRIC_KEYS.notFound] ?? 0,
    fetchErrors: values[METRIC_KEYS.fetchErrors] ?? 0,
    rateLimited: values[METRIC_KEYS.rateLimited] ?? 0,
    guestQueries: values[METRIC_KEYS.guestQueries] ?? 0,
    parseErrors: values[METRIC_KEYS.parseErrors] ?? 0,
    concurrencyBusy: values[METRIC_KEYS.concurrencyBusy] ?? 0,
    averageLatencyMs: durations.length ? total / durations.length : 0,
    p95LatencyMs: percentile(durations, 95),
  };
}

export async function incrementMany(keys) {
  for (const key of keys) await incrementMetric(key);
}
