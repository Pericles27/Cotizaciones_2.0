import { ArrowLeftRight } from 'lucide-react';
import { Card, CardContent, Skeleton, cn } from '@cotizaciones/ui';
import type { FxBoard } from '@cotizaciones/types';
import { MarketStatus } from '../../components/market-status';
import { formatPrice, formatTime } from '../../lib/format';

interface FxStripProps {
  data: FxBoard | undefined;
  isLoading: boolean;
}

/**
 * Strip horizontal del dólar implícito — todos los pares MEP / CCL
 * en una sola fila para no comer altura del viewport.
 */
export function FxStrip({ data, isLoading }: FxStripProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-2 p-3">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4 text-celeste" />
          <span className="text-sm font-semibold">Dólar implícito</span>
          <span className="text-xs text-muted-foreground">
            {data ? formatTime(data.fetchedAt) : '—'}
          </span>
          {data ? (
            <MarketStatus marketOpen={data.marketOpen} stale={data.stale} />
          ) : null}
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-x-5 gap-y-2">
          {isLoading || !data
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-5 w-32" />)
            : data.items.map((fx) => (
                <FxPill
                  key={`${fx.kind}-${fx.pair}`}
                  kind={fx.kind}
                  pair={fx.pair ?? ''}
                  value={fx.value}
                />
              ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FxPill({ kind, pair, value }: { kind: string; pair: string; value: number }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span
        className={cn(
          'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',
          kind === 'mep' ? 'bg-celeste/15 text-celeste' : 'bg-dorado/15 text-dorado',
        )}
      >
        {kind} {pair}
      </span>
      <span className="font-mono text-base font-semibold tabular-nums">
        {formatPrice(value, 'ARS')}
      </span>
    </div>
  );
}
