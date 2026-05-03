import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { adaptiveRefetchInterval } from '../../lib/refetch';

export function useCripto() {
  return useQuery({
    queryKey: ['cripto'],
    queryFn: api.cripto,
    refetchInterval: adaptiveRefetchInterval,
  });
}
