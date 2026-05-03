import { env } from '../env';
import { cached } from './cache';

const IOL_BASE = 'https://api.invertironline.com';

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

/** Error tipado que las rutas pueden interceptar y devolver como 503. */
export class IolNotConfiguredError extends Error {
  readonly code = 'provider_not_configured' as const;
  constructor() {
    super('La API no está disponible — credenciales del proveedor no configuradas.');
  }
}

/**
 * Cliente de Invertir Online.
 * Cachea el token (~14 min) y expone helpers tipados.
 */
async function fetchToken(): Promise<string> {
  if (!env.iol.configured) throw new IolNotConfiguredError();

  const body = new URLSearchParams({
    username: env.iol.username,
    password: env.iol.password,
    grant_type: 'password',
  });

  const res = await fetch(`${IOL_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    throw new Error(`IOL token fetch failed: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as TokenResponse;
  if (!json.access_token) throw new Error('IOL token missing access_token');
  return json.access_token;
}

export async function getIolToken(): Promise<string> {
  const { value } = await cached('iol:token', 60 * 14, fetchToken);
  return value;
}

/**
 * GET tipado a IOL.
 * Devuelve `null` cuando IOL responde 204 (No Content) o un body vacío,
 * algo que pasa fuera de horario de mercado. Las rutas usan este `null`
 * como señal para caer al "último valor bueno" del cache.
 *
 * Cuando IOL responde 4xx/5xx incluye el body en el mensaje del error
 * (truncado a 200 chars) para diagnosticar configuraciones inválidas.
 */
export async function iolGet<T>(path: string): Promise<T | null> {
  const token = await getIolToken();
  const res = await fetch(`${IOL_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 204) return null;
  if (!res.ok) {
    let body = '';
    try {
      body = (await res.text()).slice(0, 200).replace(/\s+/g, ' ').trim();
    } catch {
      // ignoramos errores leyendo el body
    }
    throw new Error(`Proveedor respondió ${res.status} en ${path}${body ? ` → ${body}` : ''}`);
  }

  const text = await res.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text) as T;
  } catch (err) {
    throw new Error(`Respuesta inválida del proveedor: ${(err as Error).message}`);
  }
}

/**
 * Prueba una lista de paths y devuelve la primera respuesta 2xx no-vacía.
 * Útil para endpoints donde IOL acepta múltiples convenciones (CEDEARs).
 */
export async function iolGetFirstOk<T>(paths: string[]): Promise<T | null> {
  let lastError: Error | null = null;
  for (const path of paths) {
    try {
      const result = await iolGet<T>(path);
      if (result !== null) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[iol] ✓ ${path}`);
        }
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
