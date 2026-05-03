import { Circle, MoonStar, Pause } from 'lucide-react';
import { Badge, cn } from '@cotizaciones/ui';

interface MarketStatusProps {
  /** Si el mercado está abierto en este momento. */
  marketOpen?: boolean;
  /** Si la data servida es el último valor cacheado (provider no respondió). */
  stale?: boolean;
  /** Variante "compact" para los headers chicos del dashboard. */
  size?: 'sm' | 'md';
}

/**
 * Pill prominente con el estado del mercado del panel.
 * - Abierto + frescos → punto verde "En vivo"
 * - Cerrado → ámbar "Cerrado" (con luna)
 * - Abierto pero stale → gris "Datos atrasados"
 */
export function MarketStatus({ marketOpen, stale, size = 'sm' }: MarketStatusProps) {
  const sizeClasses = size === 'md' ? 'gap-1.5 px-2.5 py-1 text-xs' : 'gap-1 px-2 py-0.5 text-[10px]';

  if (marketOpen === false) {
    return (
      <Badge
        className={cn(
          'border-transparent bg-amber-500/15 font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400',
          sizeClasses,
        )}
      >
        <MoonStar className={size === 'md' ? 'h-3.5 w-3.5' : 'h-3 w-3'} />
        Mercado cerrado
      </Badge>
    );
  }
  if (stale) {
    return (
      <Badge variant="neutral" className={cn('font-semibold uppercase tracking-wider', sizeClasses)}>
        <Pause className={size === 'md' ? 'h-3.5 w-3.5' : 'h-3 w-3'} />
        Datos atrasados
      </Badge>
    );
  }
  return (
    <Badge
      variant="positive"
      className={cn('font-semibold uppercase tracking-wider', sizeClasses)}
    >
      <Circle
        className={cn(
          'fill-current text-positive',
          size === 'md' ? 'h-2 w-2' : 'h-1.5 w-1.5',
        )}
      />
      En vivo
    </Badge>
  );
}
