import { Landmark } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ChangeBadge,
  Skeleton,
} from '@cotizaciones/ui';
import type { QuoteList } from '@cotizaciones/types';
import { MarketStatus } from '../../components/market-status';
import { formatPrice, formatTime } from '../../lib/format';

interface BonosBoardProps {
  data: QuoteList | undefined;
  isLoading: boolean;
  /** Solo mostrar estos símbolos (en este orden). */
  symbols: string[];
}

/**
 * Panel de bonos del dashboard — celdas verticales (símbolo + precio + var)
 * en una grilla de 6 columnas. Misma estética que IndicesStrip y FxBoard
 * para mantener la consistencia visual del dashboard.
 */
export function BonosBoard({ data, isLoading, symbols }: BonosBoardProps) {
  const items = data
    ? symbols
        .map((sym) => data.items.find((i) => i.symbol === sym))
        .filter((x): x is NonNullable<typeof x> => Boolean(x))
    : null;

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between space-y-0 px-4 pb-2 pt-3">
        <div className="flex items-center gap-2">
          <Landmark className="h-3.5 w-3.5 text-celeste" />
          <CardTitle className="text-sm">Bonos Argentinos</CardTitle>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {data ? formatTime(data.fetchedAt) : '—'}
          </span>
        </div>
        {data ? <MarketStatus marketOpen={data.marketOpen} stale={data.stale} /> : null}
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-x-3 gap-y-3 px-4 pb-3 pt-1 sm:grid-cols-6">
        {isLoading || !items
          ? symbols.map((s) => (
              <div key={s} className="flex flex-col gap-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))
          : items.map((q) => (
              <div key={q.symbol} className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {q.symbol}
                </span>
                <span className="font-mono text-base font-bold leading-tight tabular-nums">
                  {formatPrice(q.last, q.currency)}
                </span>
                <ChangeBadge
                  value={q.changePercent}
                  className="self-start px-1.5 py-0 text-[10px]"
                />
              </div>
            ))}
      </CardContent>
    </Card>
  );
}
