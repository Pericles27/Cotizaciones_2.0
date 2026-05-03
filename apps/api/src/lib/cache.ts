/**
 * Cache TTL en memoria, simple y type-safe.
 * Reemplaza el patrón cachedData/setTimeout esparcido por el server original.
 *
 * Además expone `cachedWithFallback`, que mantiene un "último valor bueno"
 * que NO expira: cuando el loader tira o devuelve null (típicamente fuera
 * de horario de mercado), se sirve ese valor con flag `stale: true`.
 */
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
  /** Vino del cache TTL fresco (no se llamó al loader). */
  cached: boolean;
  /** El loader falló o devolvió null y estamos sirviendo el último valor bueno. */
  stale: boolean;
  /** Cuándo se obtuvo el valor servido (puede ser viejo si stale=true). */
  fetchedAt: string;
}

/**
 * Igual que `cached`, pero si el loader falla o devuelve null usa el último
 * valor exitoso. Pensado para datos de mercados que se "congelan" al cierre.
 */
export async function cachedWithFallback<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T | null>,
): Promise<CachedResult<T>> {
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && Date.now() <= hit.expiresAt) {
    return {
      value: hit.value,
      cached: true,
      stale: false,
      fetchedAt: new Date(hit.fetchedAt).toISOString(),
    };
  }

  try {
    const fresh = await loader();
    if (fresh !== null && fresh !== undefined) {
      cacheSet(key, fresh, ttlSeconds);
      return {
        value: fresh,
        cached: false,
        stale: false,
        fetchedAt: new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn(
      `[cache] loader falló para "${key}" (${(err as Error).message}). Usando último valor bueno.`,
    );
  }

  const fallback = lastGood.get(key) as { value: T; fetchedAt: number } | undefined;
  if (fallback) {
    // Reextendemos el TTL para no martillar al provider mientras esté caído.
    store.set(key, {
      value: fallback.value,
      expiresAt: Date.now() + ttlSeconds * 1000,
      fetchedAt: fallback.fetchedAt,
    });
    return {
      value: fallback.value,
      cached: true,
      stale: true,
      fetchedAt: new Date(fallback.fetchedAt).toISOString(),
    };
  }

  throw new Error(`Sin datos disponibles — la API no responde y no hay valor cacheado todavía.`);
}
