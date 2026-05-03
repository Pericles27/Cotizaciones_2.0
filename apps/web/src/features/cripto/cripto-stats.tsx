import { ArrowDown, ArrowUp, Coins, TrendingUp } from 'lucide-react';
import { Card, CardContent, Skeleton, cn } from '@cotizaciones/ui';
import type { CryptoBoard, CryptoQuote } from '@cotizaciones/types';
import { formatCompactUsd, formatPrice } from '../../lib/format';

interface CriptoStatsProps {
  data: CryptoBoard | undefined;
  isLoading: boolean;
}

/**
 * Resumen tipo "ribbon" con métricas macro del mercado cripto:
 * top gainer, top loser, volumen total y cantidad de monedas seguidas.
 */
export function CriptoStats({ data, isLoading }: CriptoStatsProps) {
  const { gainer, loser, totalVolume, count } = computeStats(data?.items);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={Coins}
        label="Activos seguidos"
        primary={isLoading ? null : count.toString()}
        secondary="por volumen 24h"
      />
      <StatCard
        icon={TrendingUp}
        label="Volumen total 24h"
        primary={isLoading || !totalVolume ? null : formatCompactUsd(totalVolume)}
        secondary="de los pares trackeados"
      />
      <GainerLoserCard
        kind="gainer"
        coin={gainer}
        isLoading={isLoading}
      />
      <GainerLoserCard
        kind="loser"
        coin={loser}
        isLoading={isLoading}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  primary,
  secondary,
}: {
  icon: typeof Coins;
  label: string;
  primary: string | null;
  secondary?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          {primary === null ? (
            <Skeleton className="mt-1 h-5 w-24" />
          ) : (
            <p className="font-mono text-lg font-semibold tabular-nums">{primary}</p>
          )}
          {secondary ? (
            <p className="text-[11px] text-muted-foreground">{secondary}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function GainerLoserCard({
  kind,
  coin,
  isLoading,
}: {
  kind: 'gainer' | 'loser';
  coin: CryptoQuote | null;
  isLoading: boolean;
}) {
  const positive = kind === 'gainer';
  const Icon = positive ? ArrowUp : ArrowDown;
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={cn(
            'grid h-10 w-10 place-items-center rounded-lg',
            positive ? 'bg-positive/15 text-positive' : 'bg-negative/15 text-negative',
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {positive ? 'Top suba 24h' : 'Top baja 24h'}
          </p>
          {isLoading || !coin ? (
            <Skeleton className="mt-1 h-5 w-32" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-base font-bold uppercase">{coin.symbol}</span>
              <span
                className={cn(
                  'font-mono text-sm font-semibold tabular-nums',
                  positive ? 'text-positive' : 'text-negative',
                )}
              >
                {positive ? '+' : ''}
                {coin.changePercent24h.toFixed(2)}%
              </span>
            </div>
          )}
          {coin ? (
            <p className="text-[11px] text-muted-foreground">{formatPrice(coin.priceUsd, 'USD')}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

interface Stats {
  gainer: CryptoQuote | null;
  loser: CryptoQuote | null;
  totalVolume: number | null;
  count: number;
}

function computeStats(items: CryptoQuote[] | undefined): Stats {
  if (!items || items.length === 0) {
    return { gainer: null, loser: null, totalVolume: null, count: 0 };
  }
  let gainer = items[0]!;
  let loser = items[0]!;
  let totalVolume = 0;
  for (const it of items) {
    if (it.changePercent24h > gainer.changePercent24h) gainer = it;
    if (it.changePercent24h < loser.changePercent24h) loser = it;
    totalVolume += it.volume24hUsd ?? 0;
  }
  return { gainer, loser, totalVolume, count: items.length };
}
