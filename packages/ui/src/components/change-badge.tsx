import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { Badge } from './badge';
import { cn } from '../lib/cn';

export interface ChangeBadgeProps {
  /** Variación porcentual (puede venir como 1.23 = 1.23%). */
  value: number;
  /** Cantidad de decimales a mostrar. Por defecto 2. */
  precision?: number;
  className?: string;
}

/**
 * Badge semántico para cambios porcentuales: verde / rojo / neutro,
 * con flecha y formato consistente. Reemplaza el viejo "selector"
 * de clases del proyecto original.
 */
export function ChangeBadge({ value, precision = 2, className }: ChangeBadgeProps) {
  const positive = value > 0;
  const negative = value < 0;
  const variant = positive ? 'positive' : negative ? 'negative' : 'neutral';
  const Icon = positive ? ArrowUp : negative ? ArrowDown : Minus;
  const sign = positive ? '+' : '';

  return (
    <Badge variant={variant} className={cn('gap-1 font-mono tabular-nums', className)}>
      <Icon className="h-3 w-3" />
      {sign}
      {value.toFixed(precision)}%
    </Badge>
  );
}
