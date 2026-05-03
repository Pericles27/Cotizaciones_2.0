import { Activity } from 'lucide-react';
import type { IndexBoard, IndexQuote } from '@cotizaciones/types';
import { Card, CardContent, ChangeBadge, Skeleton, cn } from '@cotizaciones/ui';

const REGION_LABEL: Record<IndexQuote['region'], string> = {
  ar: '🇦🇷',
  us: '🇺🇸',
  br: '🇧🇷',
  eu: '🇪🇺',
  asia: '🌏',
  commodity: '🛢️',
};

interface IndicesStripProps {
  data: IndexBoard | undefined;
  isLoading: boolean;
}

/**
 * Strip horizontal con los índices clave (Merval, S&P 500, Dow, NASDAQ, IBOVespa).
 * Misma lógica visual que FxStrip pero sin el badge de mercado abierto / cerrado
 * (Yahoo Finance ya devuelve el último valor cuando los mercados están cerrados).
 */
export function IndicesStrip({ data, isLoading }: IndicesStripProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-2 p-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-celeste" />
          <span className="text-sm font-semibold">Índices</span>
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-x-5 gap-y-2">
          {isLoading || !data
            ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-5 w-32" />)
            : data.items.map((idx) => <IndexPill key={idx.symbol} q={idx} />)}
        </div>
      </CardContent>
    </Card>
  );
}

const COMPACT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, useGrouping: true });

function IndexPill({ q }: { q: IndexQuote }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-xs" aria-hidden>
        {REGION_LABEL[q.region]}
      </span>
      <span
        className={cn(
          'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',
          q.region === 'ar'
            ? 'bg-celeste/15 text-celeste'
            : q.region === 'us'
              ? 'bg-primary/15 text-primary'
              : q.region === 'commodity'
                ? 'bg-dorado/15 text-dorado'
                : 'bg-muted text-muted-foreground',
        )}
      >
        {q.name}
      </span>
      <span className="font-mono text-base font-semibold tabular-nums">
        {COMPACT.format(q.last)}
      </span>
      <ChangeBadge value={q.changePercent} className="px-1.5 py-0 text-[10px]" />
    </div>
  );
}
