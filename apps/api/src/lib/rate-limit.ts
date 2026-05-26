import type { Context, MiddlewareHandler, Next } from 'hono';

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
  keyFn?: (c: Context) => string;
}

interface WindowEntry {
  timestamps: number[];
  resetAt: number;
}

/**
 * In-memory sliding-window rate limiter.
 * Single-instance only — use Redis for horizontal scaling.
 */
export function rateLimiter(opts: RateLimitOptions = {}): MiddlewareHandler {
  const windowMs = opts.windowMs ?? 60_000;
  const max = opts.max ?? 60;
  const message = opts.message ?? 'Too many requests. Please try again later.';
  const keyFn = opts.keyFn ?? defaultKey;

  const store = new Map<string, WindowEntry>();

  const gc = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 5 * 60_000);

  if (typeof gc.unref === 'function') gc.unref();

  return async (c: Context, next: Next): Promise<void | Response> => {
    const key = keyFn(c);
    const now = Date.now();

    let entry = store.get(key);
    if (!entry) {
      entry = { timestamps: [], resetAt: now + windowMs };
      store.set(key, entry);
    }

    entry.timestamps = entry.timestamps.filter((t) => t > now - windowMs);
    entry.resetAt = now + windowMs;

    if (entry.timestamps.length >= max) {
      c.header('Retry-After', String(Math.ceil(windowMs / 1000)));
      c.header('X-RateLimit-Limit', String(max));
      c.header('X-RateLimit-Remaining', '0');
      return c.json({ ok: false as const, error: { code: 'rate_limit', message } }, 429);
    }

    entry.timestamps.push(now);
    c.header('X-RateLimit-Limit', String(max));
    c.header('X-RateLimit-Remaining', String(max - entry.timestamps.length));

    await next();
  };
}

function defaultKey(c: Context): string {
  const forwarded = c.req.header('x-forwarded-for') ?? '';
  const firstIp = forwarded.split(',')[0]?.trim() ?? '';
  return firstIp || c.req.header('cf-connecting-ip') || c.req.header('x-real-ip') || 'unknown';
}
