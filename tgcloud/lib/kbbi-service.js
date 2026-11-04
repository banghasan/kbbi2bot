import { readCache, writeCache } from './cache.js';
import { fetchKBBI, KBBINotFoundError } from './kbbi-fetch.js';
import { incrementMetric, METRIC_KEYS } from './metrics.js';
import { withFetchSlot } from './limits.js';

async function safeReadCache(query) {
  try {
    return await readCache(query);
  } catch (error) {
    console.warn('cache read failed', error?.message);
    return null;
  }
}

async function safeWriteCache(query, result) {
  try {
    await writeCache(query, result);
  } catch (error) {
    console.warn('cache write failed', error?.message);
  }
}

async function safeMetric(metricKey) {
  try {
    await incrementMetric(metricKey);
  } catch (error) {
    console.warn('service metric failed', error?.message);
  }
}

export async function lookupKBBI(query) {
  const cached = await safeReadCache(query);
  if (cached) {
    await safeMetric(METRIC_KEYS.cacheHits);
    return { result: cached, cached: true };
  }

  await safeMetric(METRIC_KEYS.cacheMisses);
  return withFetchSlot(query, async () => {
    const afterWait = await safeReadCache(query);
    if (afterWait) {
      await safeMetric(METRIC_KEYS.cacheHits);
      return { result: afterWait, cached: true };
    }

    try {
      const result = await fetchKBBI(query);
      await safeWriteCache(query, result);
      await safeMetric(METRIC_KEYS.fetchSuccess);
      return { result, cached: false };
    } catch (error) {
      if (error instanceof KBBINotFoundError) await safeMetric(METRIC_KEYS.notFound);
      else if (error?.kind === 'parse' || error?.cause?.kind === 'parse') await safeMetric(METRIC_KEYS.parseErrors);
      else await safeMetric(METRIC_KEYS.fetchErrors);
      throw error;
    }
  });
}
