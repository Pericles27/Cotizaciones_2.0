import { Bitcoin, Star } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChangeBadge,
  cn,
} from '@cotizaciones/ui';
import type { CryptoBoard } from '@cotizaciones/types';
import { DataTable, type DataTableColumn, type DataTableFilter } from '../../components/data-table';
import { MarketStatus } from '../../components/market-status';
import { useFavorites } from '../../lib/favorites';
import { formatCompactUsd, formatPrice, formatTime } from '../../lib/format';

interface CriptoDataTableProps {
  data: CryptoBoard | undefined;
  isLoading: boolean;
}

export function CriptoDataTable({ data, isLoading }: CriptoDataTableProps) {
  const { isFavorite, toggle } = useFavorites('cripto');

  type Row = NonNullable<CryptoBoard['items']>[number];

  const columns: DataTableColumn<Row>[] = [
    {
      id: 'fav',
      header: <Star className="h-3 w-3" aria-hidden />,
      align: 'center',
      cell: (row) => (
        <button
          type="button"
          onClick={() => toggle(row.symbol)}
          className="text-muted-foreground transition-colors hover:text-dorado"
          aria-label={isFavorite(row.symbol) ? 'Quitar de favoritos' : 'Marcar como favorito'}
        >
          <Star
            className={cn('h-3.5 w-3.5', isFavorite(row.symbol) && 'fill-dorado text-dorado')}
          />
        </button>
      ),
      headerClassName: 'w-8',
    },
    {
      id: 'rank',
      header: '#',
      align: 'center',
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground">{row.rank ?? '—'}</span>
      ),
      sortBy: (row) => row.rank ?? 9999,
      mobileHidden: true,
      mobileLabel: 'Rank',
    },
    {
      id: 'symbol',
      header: 'Activo',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-mono text-sm font-medium uppercase">{row.symbol}</span>
          <span className="text-xs text-muted-foreground">{row.name}</span>
        </div>
      ),
      sortBy: (row) => row.symbol,
    },
    {
      id: 'price',
      header: 'Precio',
      align: 'right',
      cell: (row) => (
        <span className="font-mono tabular-nums">{formatPrice(row.priceUsd, 'USD')}</span>
      ),
      sortBy: (row) => row.priceUsd,
    },
    {
      id: 'change',
      header: '24h',
      align: 'right',
      cell: (row) => <ChangeBadge value={row.changePercent24h} />,
      sortBy: (row) => row.changePercent24h,
    },
    {
      id: 'mcap',
      header: 'Market Cap',
      align: 'right',
      cell: (row) => (
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {row.marketCapUsd ? formatCompactUsd(row.marketCapUsd) : '—'}
        </span>
      ),
      sortBy: (row) => row.marketCapUsd ?? 0,
      mobileHidden: true,
      mobileLabel: 'Market Cap',
    },
    {
      id: 'vol',
      header: 'Volumen 24h',
      align: 'right',
      cell: (row) => (
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {row.volume24hUsd ? formatCompactUsd(row.volume24hUsd) : '—'}
        </span>
      ),
      sortBy: (row) => row.volume24hUsd ?? 0,
      mobileHidden: true,
      mobileLabel: 'Vol 24h',
    },
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Bitcoin className="h-4 w-4 text-dorado" />
            Cripto
          </CardTitle>
          <CardDescription>
            {data ? `Actualizado ${formatTime(data.fetchedAt)}` : 'Cargando…'} · CoinPaprika
          </CardDescription>
        </div>
        {data ? <MarketStatus marketOpen={data.marketOpen} stale={data.stale} /> : null}
      </CardHeader>
      <CardContent>
        <DataTable
          rows={data?.items}
          columns={columns}
          isLoading={isLoading}
          searchBy={(row) => `${row.symbol} ${row.name}`}
          searchPlaceholder="Buscar cripto…"
          filters={
            [
              {
                id: 'fav',
                label: '⭐ Favoritas',
                predicate: (row: Row) => isFavorite(row.symbol),
              },
              {
                id: 'up',
                label: '▲ Subas 24h',
                predicate: (row: Row) => row.changePercent24h > 0,
              },
              {
                id: 'down',
                label: '▼ Bajas 24h',
                predicate: (row: Row) => row.changePercent24h < 0,
              },
            ] as DataTableFilter<Row>[]
          }
          rowKey={(row) => row.symbol}
          initialSort={{ id: 'rank', dir: 'asc' }}
          initialPageSize={10}
        />
      </CardContent>
    </Card>
  );
}
