import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

/**
 * Los índices se actualizan más lento que tickers individuales.
 * 60s de intervalo es más que suficiente.
 */
export function useIndices() {
  return useQuery({
    queryKey: ['indices'],
    queryFn: api.indices,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
