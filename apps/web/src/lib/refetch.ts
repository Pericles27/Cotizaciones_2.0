/**
 * Polling adaptativo según estado del mercado:
 * - abierto  → 30s (datos vivos)
 * - cerrado  → 5min (la API igual va a devolver el último valor bueno)
 * - error    → no refetchear hasta el próximo focus
 */
const OPEN_MS = 30_000;
const CLOSED_MS = 5 * 60_000;

interface QueryWithMarket {
  state: { data?: { marketOpen?: boolean } | undefined; error: unknown };
}

export const adaptiveRefetchInterval = (query: QueryWithMarket) => {
  if (query.state.error) return false;
  const marketOpen = query.state.data?.marketOpen;
  if (marketOpen === false) return CLOSED_MS;
  return OPEN_MS;
};
