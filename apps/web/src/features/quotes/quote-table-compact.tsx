import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import {
  Card,
  CardContent,
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
 * Card compacto del dashboard — header de una línea (icono + título + hora
 * + EN VIVO), fila de headers de columna y lista densa con favoritos primero.
 *
 * Pensado para apilar 4 cards en una grilla full-width sin perder densidad
 * (≥ 9 filas visibles a 1080p).
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

  const timeLabel = data
    ? data.marketOpen === false
      ? `Cierre · ${formatTime(data.fetchedAt)}`
      : formatTime(data.fetchedAt)
    : '—';

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 px-3 pb-2 pt-3">
        <div className="flex items-center gap-1.5 min-w-0">
          {Icon ? (
            <Icon className="h-3.5 w-3.5 text-celeste shrink-0" />
          ) : (
            <Star className="h-3.5 w-3.5 fill-dorado text-dorado shrink-0" />
          )}
          <CardTitle className="text-sm">
            <Link to={href} className="hover:underline">
              {title}
            </Link>
          </CardTitle>
          <span className="text-[11px] text-muted-foreground tabular-nums truncate">
            {isError ? 'API sin respuesta' : description ?? timeLabel}
          </span>
        </div>
        {data ? <MarketStatus marketOpen={data.marketOpen} stale={data.stale} /> : null}
      </CardHeader>
      <CardContent className="flex-1 px-3 pb-3 pt-0">
        {/* Layout en 4 columnas: estrella | símbolo (izq) | precio (centro) | var% (der).
            El precio queda en una columna 1fr con text-center → ocupa todo el
            ancho disponible pero el número en sí sale centrado. */}
        <div className="grid w-full grid-cols-[1rem_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-3 border-b border-border/60 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span aria-hidden />
          <span>Símbolo</span>
          <span className="text-center">Precio</span>
          <span className="text-right">Var%</span>
        </div>
        <ul className="divide-y divide-border/40 text-sm">
          {isLoading || !items
            ? Array.from({ length: limit }).map((_, i) => (
                <li
                  key={i}
                  className="grid w-full grid-cols-[1rem_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-3 py-1.5"
                >
                  <Skeleton className="h-3.5 w-3.5" />
                  <Skeleton className="h-3.5 w-14" />
                  <Skeleton className="mx-auto h-3.5 w-20" />
                  <Skeleton className="h-4 w-14" />
                </li>
              ))
            : items.map((q) => {
                const fav = isFavorite(q.symbol);
                return (
                  <li
                    key={q.symbol}
                    className="grid w-full grid-cols-[1rem_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-3 py-1.5 transition-colors hover:bg-muted/30"
                  >
                    <button
                      type="button"
                      onClick={() => toggle(q.symbol)}
                      className="text-muted-foreground transition-colors hover:text-dorado"
                      aria-label={fav ? 'Quitar de favoritos' : 'Marcar como favorito'}
                    >
                      <Star
                        className={cn('h-3.5 w-3.5', fav && 'fill-dorado text-dorado')}
                      />
                    </button>
                    <span className="truncate font-mono font-medium">{q.symbol}</span>
                    <span className="text-center font-mono tabular-nums">
                      {formatPrice(q.last, q.currency)}
                    </span>
                    <ChangeBadge
                      value={q.changePercent}
                      className="px-1.5 py-0.5 text-[11px]"
                    />
                  </li>
                );
              })}
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
