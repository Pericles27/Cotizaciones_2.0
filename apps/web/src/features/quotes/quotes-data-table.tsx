import { Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, ChangeBadge, cn } from '@cotizaciones/ui';
import type { LucideIcon } from 'lucide-react';
import type { QuoteList } from '@cotizaciones/types';
import { DataTable, type DataTableColumn, type DataTableFilter } from '../../components/data-table';
import { MarketStatus } from '../../components/market-status';
import { useFavorites, type PanelKey } from '../../lib/favorites';
import { formatPrice, formatTime } from '../../lib/format';

interface QuotesDataTableProps {
  panel: PanelKey;
  title: string;
  icon?: LucideIcon;
  description?: string;
  data: QuoteList | undefined;
  isLoading: boolean;
}

/**
 * Tabla completa con búsqueda + orden + paginación, usada en las páginas
 * dedicadas (/acciones, /bonos). Soporta favoritos con star icon.
 */
export function QuotesDataTable({
  panel,
  title,
  icon: Icon,
  description,
  data,
  isLoading,
}: QuotesDataTableProps) {
  const { isFavorite, toggle } = useFavorites(panel);

  type Row = NonNullable<QuoteList['items']>[number];

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
      id: 'symbol',
      header: 'Símbolo',
      cell: (row) => <span className="font-mono font-medium">{row.symbol}</span>,
      sortBy: (row) => row.symbol,
    },
    {
      id: 'name',
      header: 'Nombre',
      cell: (row) => (
        <span className="text-muted-foreground">
          {row.name ?? '—'}
        </span>
      ),
      sortBy: (row) => row.name ?? '',
    },
    {
      id: 'last',
      header: 'Último',
      align: 'right',
      cell: (row) => (
        <span className="font-mono tabular-nums">{formatPrice(row.last, row.currency)}</span>
      ),
      sortBy: (row) => row.last,
    },
    {
      id: 'change',
      header: 'Var %',
      align: 'right',
      cell: (row) => <ChangeBadge value={row.changePercent} />,
      sortBy: (row) => row.changePercent,
    },
    {
      id: 'volume',
      header: 'Volumen',
      align: 'right',
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {row.volume != null ? Intl.NumberFormat('es-AR').format(row.volume) : '—'}
        </span>
      ),
      sortBy: (row) => row.volume ?? 0,
    },
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            {Icon ? <Icon className="h-4 w-4 text-celeste" /> : null}
            {title}
          </CardTitle>
          <CardDescription>
            {description ? `${description} · ` : ''}
            {data
              ? data.marketOpen === false
                ? `Datos del cierre · ${formatTime(data.fetchedAt)}`
                : `Actualizado ${formatTime(data.fetchedAt)}`
              : 'Cargando…'}
          </CardDescription>
        </div>
        {data ? <MarketStatus marketOpen={data.marketOpen} stale={data.stale} /> : null}
      </CardHeader>
      <CardContent>
        <DataTable
          rows={data?.items}
          columns={columns}
          isLoading={isLoading}
          searchBy={(row) => `${row.symbol} ${row.name ?? ''}`}
          searchPlaceholder="Buscar por símbolo o nombre…"
          filters={
            [
              {
                id: 'fav',
                label: '⭐ Favoritas',
                predicate: (row: Row) => isFavorite(row.symbol),
              },
              { id: 'up', label: '▲ Solo subas', predicate: (row: Row) => row.changePercent > 0 },
              {
                id: 'down',
                label: '▼ Solo bajas',
                predicate: (row: Row) => row.changePercent < 0,
              },
            ] as DataTableFilter<Row>[]
          }
          rowKey={(row) => row.symbol}
          initialSort={{ id: 'change', dir: 'desc' }}
          initialPageSize={25}
        />
      </CardContent>
    </Card>
  );
}
