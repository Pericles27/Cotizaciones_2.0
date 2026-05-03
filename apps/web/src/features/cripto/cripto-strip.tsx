import { useMemo } from 'react';
import { Bitcoin } from 'lucide-react';
import type { CryptoQuote } from '@cotizaciones/types';
import { Card, ChangeBadge, Skeleton, cn } from '@cotizaciones/ui';
import { formatCompactUsd, formatPrice } from '../../lib/format';
import { useTickerSelection } from '../../lib/ticker';

/** Mismo cap que el ticker desktop. */
const STRIP_LIMIT = 10;

interface CriptoStripProps {
  data: { items: CryptoQuote[]; fetchedAt: string } | undefined;
  isLoading: boolean;
}

/**
 * Strip horizontal de cripto pensado para el dashboard mobile/tablet.
 * En lg+ está oculto porque el ticker marquee del navbar lo reemplaza.
 *
 * Aplica el mismo criterio que el ticker:
 *   - máximo 10 visibles
 *   - usa la selección persistida en localStorage (compartida con el ticker)
 *   - si no hay selección, top 10 por volumen
 */
export function CriptoStrip({ data, isLoading }: CriptoStripProps) {
  const { isVisible } = useTickerSelection();

  const visible = useMemo(() => {
    if (!data) return null;
    return data.items.filter((c) => isVisible(c.symbol)).slice(0, STRIP_LIMIT);
  }, [data, isVisible]);

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {isLoading || !visible
        ? Array.from({ length: 6 }).map((_, i) => <CryptoCardSkeleton key={i} />)
        : visible.map((c) => <CryptoTickerCard key={c.symbol} crypto={c} />)}
    </div>
  );
}

function CryptoTickerCard({ crypto }: { crypto: CryptoQuote }) {
  return (
    <Card className="flex flex-col gap-2 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Bitcoin className={cn('h-3 w-3', crypto.symbol === 'BTC' && 'text-dorado')} />
            <span className="font-mono font-medium uppercase">{crypto.symbol}</span>
          </div>
          <p className="truncate text-sm font-medium">{crypto.name}</p>
        </div>
        <ChangeBadge value={crypto.changePercent24h} />
      </div>
      <div>
        <p className="font-mono text-lg font-semibold tabular-nums">
          {formatPrice(crypto.priceUsd, 'USD')}
        </p>
        {crypto.marketCapUsd ? (
          <p className="text-xs text-muted-foreground">
            mcap {formatCompactUsd(crypto.marketCapUsd)}
          </p>
        ) : null}
      </div>
    </Card>
  );
}

function CryptoCardSkeleton() {
  return (
    <Card className="flex flex-col gap-2 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-3 w-16" />
    </Card>
  );
}
