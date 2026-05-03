import { ArrowLeftRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@cotizaciones/ui';
import type { FxBoard } from '@cotizaciones/types';
import { MarketStatus } from '../../components/market-status';
import { formatPrice } from '../../lib/format';

interface FxBoardCardProps {
  data: FxBoard | undefined;
  isLoading: boolean;
}

/**
 * Reemplazo del viejo bloque "MEP / CCL" del proyecto original,
 * pero con tipografía monospace para los números, jerarquía clara
 * y estado de carga sin parpadeos.
 */
export function FxBoardCard({ data, isLoading }: FxBoardCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-celeste" />
            Dólar implícito
          </CardTitle>
          {data ? <MarketStatus marketOpen={data.marketOpen} stale={data.stale} /> : null}
        </div>
        <CardDescription>Calculado a partir de bonos soberanos en pesos vs. dólar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FxGroup
          title="MEP"
          items={data?.items.filter((i) => i.kind === 'mep')}
          isLoading={isLoading}
        />
        <FxGroup
          title="CCL"
          items={data?.items.filter((i) => i.kind === 'ccl')}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}

function FxGroup({
  title,
  items,
  isLoading,
}: {
  title: string;
  items: FxBoard['items'] | undefined;
  isLoading: boolean;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <ul className="mt-2 space-y-1.5">
        {isLoading || !items
          ? Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-5 w-24" />
              </li>
            ))
          : items.map((item) => (
              <li
                key={`${item.kind}-${item.pair}`}
                className="flex items-baseline justify-between gap-3"
              >
                <span className="text-sm text-muted-foreground">{item.pair}</span>
                <span className="font-mono text-lg font-semibold tabular-nums">
                  {formatPrice(item.value, 'ARS')}
                </span>
              </li>
            ))}
      </ul>
    </div>
  );
}
