import { env } from '../env';
import { cached, cacheSet } from './cache';

const IOL_BASE = 'https://api.invertironline.com';

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

export class IolNotConfiguredError extends Error {
  readonly code = 'provider_not_configured' as const;
  constructor() {
    super('API unavailable — provider credentials not configured.');
  }
}

async function fetchToken(): Promise<string> {
  if (!env.iol.configured) throw new IolNotConfiguredError();

  const res = await fetch(`${IOL_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      username: process.env['IOL_USERNAME'] ?? process.env['REACT_APP_API_MAIL'] ?? '',
      password: env.iol.password,
      grant_type: 'password',
    }),
  });

  if (!res.ok) throw new Error(`IOL token request failed: ${res.status} ${res.statusText}`);

  const json = (await res.json()) as TokenResponse;
  if (!json.access_token) throw new Error('IOL token response missing access_token');
  return json.access_token;
}

export async function getIolToken(): Promise<string> {
  const { value } = await cached('iol:token', 60 * 14, fetchToken);
  return value;
}

function invalidateToken(): void {
  cacheSet('iol:token', '', 0);
}

/**
 * Typed GET against IOL.
 * Returns null on 204 or empty body (market closed).
 * On 401, invalidates the cached token and retries once.
 */
export async function iolGet<T>(path: string, retry = true): Promise<T | null> {
  const token = await getIolToken();
  const res = await fetch(`${IOL_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401 && retry) {
    console.warn('[iol] 401 received — refreshing token and retrying');
    invalidateToken();
    return iolGet<T>(path, false);
  }

  if (res.status === 204) return null;

  if (!res.ok) {
    let body = '';
    try { body = (await res.text()).slice(0, 200).replace(/\s+/g, ' ').trim(); } catch { /* ignore */ }
    throw new Error(`Provider responded ${res.status} at ${path}${body ? ` — ${body}` : ''}`);
  }

  const text = await res.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text) as T;
  } catch (err) {
    throw new Error(`Invalid provider response: ${(err as Error).message}`);
  }
}

/** Tries multiple paths and returns the first non-null 2xx response. */
export async function iolGetFirstOk<T>(paths: string[]): Promise<T | null> {
  let lastError: Error | null = null;
  for (const path of paths) {
    try {
      const result = await iolGet<T>(path);
      if (result !== null) {
        if (env.NODE_ENV !== 'production') console.log(`[iol] ✓ ${path}`);
        return result;
      }
    } catch (err) {
      lastError = err as Error;
      console.warn(`[iol] ✗ ${(err as Error).message}`);
    }
  }
  if (lastError) throw lastError;
  return null;
}
