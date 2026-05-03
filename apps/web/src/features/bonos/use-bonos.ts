import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { adaptiveRefetchInterval } from '../../lib/refetch';

export function useBonos() {
  return useQuery({
    queryKey: ['bonos'],
    queryFn: api.bonos,
    refetchInterval: adaptiveRefetchInterval,
  });
}

export function useFx() {
  return useQuery({
    queryKey: ['fx'],
    queryFn: api.fx,
    refetchInterval: adaptiveRefetchInterval,
  });
}
