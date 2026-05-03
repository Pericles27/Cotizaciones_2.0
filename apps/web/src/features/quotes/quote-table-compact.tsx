import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChangeBadge,
  Skeleton,
  cn,
} from '@cotizaciones/ui';
import type { LucideIcon } from 'lucide-react';
import type { QuoteList } from '@cotizaciones/types';
import { MarketStatus } from '../../components/market-status';
import { useFavorites, type PanelKey } from '../../lib/favorites';
import { formatPrice, formatTime } from '../../lib/format';

interface QuoteTableCompactProps {
  panel: PanelKey;
  title: string;
  description?: string;
  icon?: LucideIcon;
  data: QuoteList | undefined;
  isLoading: boolean;
  isError?: boolean;
  /** Cantidad de filas a mostrar. */
  limit: number;
  /** Link al ver completo. */
  href: string;
}

/**
 * Card compacto para el dashboard — favorites primero, luego top N por |variación|.
 * Permite marcar / desmarcar favoritos con un click en la estrellita.
 */
export function QuoteTableCompact({
  panel,
  title,
  description,
  icon: Icon,
  data,
  isLoading,
  isError,
  limit,
  href,
}: QuoteTableCompactProps) {
  const { isFavorite, toggle } = useFavorites(panel);

  const items = data
    ? sortPreferringFavorites(data.items, isFavorite).slice(0, limit)
    : null;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-0.5">
          <CardTitle className="flex items-center gap-1.5 text-sm">
            {Icon ? <Icon className="h-3.5 w-3.5 text-celeste" /> : null}
            <Link to={href} className="hover:underline">
              {title}
            </Link>
          </CardTitle>
          <CardDescription className="text-xs">
            {isError
              ? 'API sin respuesta'
              : description
                ? description
                : data
                  ? data.marketOpen === false
                    ? `Cierre · ${formatTime(data.fetchedAt)}`
                    : formatTime(data.fetchedAt)
                  : 'Cargando…'}
          </CardDescription>
        </div>
        {data ? <MarketStatus marketOpen={data.marketOpen} stale={data.stale} /> : null}
      </CardHeader>
      <CardContent className="flex-1 px-2 pb-2">
        <ul className="divide-y divide-border/50 text-xs">
          {isLoading || !items
            ? Array.from({ length: limit }).map((_, i) => (
                <li key={i} className="flex items-center justify-between gap-2 py-1.5 px-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-14" />
                </li>
              ))
            : items.map((q) => (
                <li
                  key={q.symbol}
                  className="flex items-center justify-between gap-2 py-1.5 px-1 hover:bg-muted/30 rounded"
                >
                  <button
                    type="button"
                    onClick={() => toggle(q.symbol)}
                    className="text-muted-foreground transition-colors hover:text-dorado"
                    aria-label={isFavorite(q.symbol) ? 'Quitar de favoritos' : 'Marcar como favorito'}
                  >
                    <Star
                      className={cn(
                        'h-3 w-3',
                        isFavorite(q.symbol) && 'fill-dorado text-dorado',
                      )}
                    />
                  </button>
                  <span className="flex-1 truncate font-mono font-medium">{q.symbol}</span>
                  <span className="font-mono tabular-nums text-muted-foreground">
                    {formatPrice(q.last, q.currency)}
                  </span>
                  <ChangeBadge value={q.changePercent} className="px-1.5 py-0 text-[10px]" />
                </li>
              ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/** Favoritos primero (orden alfabético entre ellos), luego el resto por |var %| desc. */
function sortPreferringFavorites<T extends { symbol: string; changePercent: number }>(
  items: T[],
  isFavorite: (sym: string) => boolean,
): T[] {
  const favs: T[] = [];
  const rest: T[] = [];
  for (const item of items) {
    (isFavorite(item.symbol) ? favs : rest).push(item);
  }
  favs.sort((a, b) => a.symbol.localeCompare(b.symbol));
  rest.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
  return [...favs, ...rest];
}
