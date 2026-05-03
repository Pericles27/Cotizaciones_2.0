import { Landmark } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChangeBadge,
  Skeleton,
} from '@cotizaciones/ui';
import type { QuoteList } from '@cotizaciones/types';
import { MarketStatus } from '../../components/market-status';
import { formatPrice, formatTime } from '../../lib/format';

interface BonosCompactProps {
  data: QuoteList | undefined;
  isLoading: boolean;
  /** Solo mostrar estos símbolos (en este orden). */
  symbols: string[];
}

/**
 * Versión compacta — sin tabla, lista densa de 2 líneas por bono.
 * Pensada para no comerse media pantalla en el dashboard.
 */
export function BonosCompact({ data, isLoading, symbols }: BonosCompactProps) {
  const items = data
    ? symbols
        .map((sym) => data.items.find((i) => i.symbol === sym))
        .filter((x): x is NonNullable<typeof x> => Boolean(x))
    : null;

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Landmark className="h-4 w-4 text-celeste" />
            Bonos Argentinos
          </CardTitle>
          <CardDescription className="text-xs">
            {data
              ? data.marketOpen === false
                ? `Cierre · ${formatTime(data.fetchedAt)}`
                : formatTime(data.fetchedAt)
              : 'Cargando…'}
          </CardDescription>
        </div>
        {data ? <MarketStatus marketOpen={data.marketOpen} stale={data.stale} /> : null}
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
          {isLoading || !items
            ? symbols.map((s) => (
                <li key={s} className="rounded-md border border-border/60 px-2 py-1.5">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="mt-1 h-4 w-20" />
                </li>
              ))
            : items.map((q) => (
                <li
                  key={q.symbol}
                  className="rounded-md border border-border/60 bg-card px-2 py-1.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono font-medium">{q.symbol}</span>
                    <ChangeBadge value={q.changePercent} className="px-1.5 py-0 text-[10px]" />
                  </div>
                  <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums">
                    {formatPrice(q.last, q.currency)}
                  </p>
                </li>
              ))}
        </ul>
      </CardContent>
    </Card>
  );
}
