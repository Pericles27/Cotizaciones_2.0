import type {
  ApiResponse,
  CryptoBoard,
  FxBoard,
  IndexBoard,
  QuoteList,
} from '@cotizaciones/types';

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.ok) throw new Error(json.error.message);
  return json.data;
}

export const api = {
  bonos: () => get<QuoteList>('/bonos'),
  fx: () => get<FxBoard>('/bonos/fx'),
  merval: () => get<QuoteList>('/acciones/merval'),
  sp500: () => get<QuoteList>('/acciones/sp500'),
  adrs: () => get<QuoteList>('/acciones/adrs'),
  cedears: () => get<QuoteList>('/acciones/cedears'),
  cripto: () => get<CryptoBoard>('/cripto'),
  indices: () => get<IndexBoard>('/indices'),
};
