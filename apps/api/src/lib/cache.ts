interface Entry<T> {
  value: T;
  expiresAt: number;
  fetchedAt: number;
}

const store = new Map<string, Entry<unknown>>();
const lastGood = new Map<string, { value: unknown; fetchedAt: number }>();

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key) as Entry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function cacheSet<T>(key: string, value: T, ttlSeconds: number): T {
  const fetchedAt = Date.now();
  store.set(key, { value, expiresAt: fetchedAt + ttlSeconds * 1000, fetchedAt });
  lastGood.set(key, { value, fetchedAt });
  return value;
}

export async function cached<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<{ value: T; cached: boolean }> {
  const hit = cacheGet<T>(key);
  if (hit !== null) return { value: hit, cached: true };
  const fresh = await loader();
  cacheSet(key, fresh, ttlSeconds);
  return { value: fresh, cached: false };
}

export interface CachedResult<T> {
  value: T;
  cached: boolean;
  /** True when the loader failed or returned null — serving last known good value. */
  stale: boolean;
  fetchedAt: string;
}

/**
 * Like `cached`, but falls back to the last successful value when the loader
 * throws or returns null (e.g. outside market hours). Extends the TTL on
 * fallback to avoid hammering a down provider.
 */
export async function cachedWithFallback<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T | null>,
): Promise<CachedResult<T>> {
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && Date.now() <= hit.expiresAt) {
    return { value: hit.value, cached: true, stale: false, fetchedAt: new Date(hit.fetchedAt).toISOString() };
  }

  try {
    const fresh = await loader();
    if (fresh !== null && fresh !== undefined) {
      cacheSet(key, fresh, ttlSeconds);
      return { value: fresh, cached: false, stale: false, fetchedAt: new Date().toISOString() };
    }
  } catch (err) {
    console.warn(`[cache] loader failed for "${key}" (${(err as Error).message}) — using last good value`);
  }

  const fallback = lastGood.get(key) as { value: T; fetchedAt: number } | undefined;
  if (fallback) {
    store.set(key, { value: fallback.value, expiresAt: Date.now() + ttlSeconds * 1000, fetchedAt: fallback.fetchedAt });
    return { value: fallback.value, cached: true, stale: true, fetchedAt: new Date(fallback.fetchedAt).toISOString() };
  }

  throw new Error('No data available — provider is down and no cached value exists yet.');
}
