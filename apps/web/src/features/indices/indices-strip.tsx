import { Activity } from 'lucide-react';
import type { IndexBoard, IndexQuote } from '@cotizaciones/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ChangeBadge,
  Skeleton,
  cn,
} from '@cotizaciones/ui';
import { MarketStatus } from '../../components/market-status';
import { formatTime } from '../../lib/format';

const REGION_FLAG: Record<IndexQuote['region'], string> = {
  ar: '🇦🇷',
  us: '🇺🇸',
  br: '🇧🇷',
  eu: '🇪🇺',
  asia: '🌏',
  commodity: '⬢',
};

const REGION_TEXT: Record<IndexQuote['region'], string> = {
  ar: 'text-celeste',
  us: 'text-foreground',
  br: 'text-positive',
  eu: 'text-foreground',
  asia: 'text-foreground',
  commodity: 'text-dorado',
};

interface IndicesStripProps {
  data: IndexBoard | undefined;
  isLoading: boolean;
}

const NUM = new Intl.NumberFormat('es-AR', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  useGrouping: true,
});

/**
 * Panel de índices — header con título + EN VIVO, contenido en una grilla
 * de 8 columnas (2 / 4 / 8 según viewport) con flag, símbolo, valor y
 * variación. Misma estética que el resto del dashboard.
 */
export function IndicesStrip({ data, isLoading }: IndicesStripProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 px-4 pb-2 pt-3">
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-celeste" />
          <CardTitle className="text-sm">Índices</CardTitle>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {data ? formatTime(data.fetchedAt) : '—'}
          </span>
        </div>
        <MarketStatus stale={data?.stale} />
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 pb-3 pt-1 sm:grid-cols-4 lg:grid-cols-8">
        {isLoading || !data
          ? Array.from({ length: 8 }).map((_, i) => <IndexCellSkeleton key={i} />)
          : data.items.slice(0, 8).map((idx) => <IndexCell key={idx.symbol} q={idx} />)}
      </CardContent>
    </Card>
  );
}

function IndexCell({ q }: { q: IndexQuote }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1 text-[10px]">
        <span className="text-xs leading-none" aria-hidden>
          {REGION_FLAG[q.region]}
        </span>
        <span
          className={cn(
            'font-semibold uppercase tracking-wider',
            REGION_TEXT[q.region],
          )}
        >
          {q.name}
        </span>
      </div>
      <span className="font-mono text-xl font-bold leading-tight tabular-nums">
        {NUM.format(q.last)}
      </span>
      <ChangeBadge value={q.changePercent} className="self-start px-1.5 py-0 text-[10px]" />
    </div>
  );
}

function IndexCellSkeleton() {
  return (
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-4 w-12" />
    </div>
  );
}
