import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { adaptiveRefetchInterval } from '../../lib/refetch';

export function useMerval() {
  return useQuery({
    queryKey: ['merval'],
    queryFn: api.merval,
    refetchInterval: adaptiveRefetchInterval,
  });
}

export function useSp500() {
  return useQuery({
    queryKey: ['sp500'],
    queryFn: api.sp500,
    refetchInterval: adaptiveRefetchInterval,
  });
}

export function useAdrs() {
  return useQuery({
    queryKey: ['adrs'],
    queryFn: api.adrs,
    refetchInterval: adaptiveRefetchInterval,
  });
}

export function useCedears() {
  return useQuery({
    queryKey: ['cedears'],
    queryFn: api.cedears,
    refetchInterval: adaptiveRefetchInterval,
  });
}
