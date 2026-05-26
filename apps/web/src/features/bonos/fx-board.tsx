import { ArrowLeftRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  cn,
} from '@cotizaciones/ui';
import type { FxBoard as FxBoardData } from '@cotizaciones/types';
import { MarketStatus } from '../../components/market-status';
import { formatPrice, formatTime } from '../../lib/format';

interface FxBoardProps {
  data: FxBoardData | undefined;
  isLoading: boolean;
}

/**
 * Panel de dólar implícito del dashboard — pares MEP / CCL en celdas
 * verticales, alineadas con BonosBoard / IndicesStrip.
 */
export function FxBoard({ data, isLoading }: FxBoardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between space-y-0 px-4 pb-2 pt-3">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="h-3.5 w-3.5 text-celeste" />
          <CardTitle className="text-sm">Dólar implícito</CardTitle>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {data ? formatTime(data.fetchedAt) : '—'}
          </span>
        </div>
        {data ? <MarketStatus marketOpen={data.marketOpen} stale={data.stale} /> : null}
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-x-3 gap-y-3 px-4 pb-3 pt-1 sm:grid-cols-5">
        {isLoading || !data
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))
          : data.items.map((fx) => (
              <div
                key={`${fx.kind}-${fx.pair ?? ''}`}
                className="flex flex-col gap-0.5"
              >
                <div className="flex items-baseline gap-1 text-[10px] uppercase tracking-wider">
                  <span
                    className={cn(
                      'font-semibold',
                      fx.kind === 'mep' ? 'text-celeste' : 'text-dorado',
                    )}
                  >
                    {fx.kind}
                  </span>
                  {fx.pair ? (
                    <span className="text-muted-foreground">{fx.pair}</span>
                  ) : null}
                </div>
                <span className="font-mono text-base font-bold leading-tight tabular-nums">
                  {formatPrice(fx.value, 'ARS')}
                </span>
              </div>
            ))}
      </CardContent>
    </Card>
  );
}
