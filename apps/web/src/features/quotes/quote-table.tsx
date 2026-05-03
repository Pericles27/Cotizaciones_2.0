import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChangeBadge,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@cotizaciones/ui';
import type { LucideIcon } from 'lucide-react';
import type { QuoteList } from '@cotizaciones/types';
import { MarketStatus } from '../../components/market-status';
import { formatPrice, formatTime } from '../../lib/format';

export interface QuoteTableCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  data: QuoteList | undefined;
  isLoading: boolean;
  isError?: boolean;
  /** Cantidad máxima de filas a mostrar (útil en el dashboard). */
  limit?: number;
  /** Texto adicional antes del símbolo (ej: bandera unicode). */
  symbolPrefix?: (symbol: string) => string;
  className?: string;
}

/**
 * Tabla de cotizaciones genérica — sirve para Bonos, Merval, ADRs y S&P.
 * Usa skeletons mientras carga y cae limpio si la API responde 503.
 */
export function QuoteTableCard({
  title,
  description,
  icon: Icon,
  data,
  isLoading,
  isError,
  limit,
  className,
}: QuoteTableCardProps) {
  const items = limit ? data?.items.slice(0, limit) : data?.items;

  const statusLabel = data
    ? data.marketOpen === false
      ? `Datos del cierre · ${formatTime(data.fetchedAt)}`
      : `Actualizado ${formatTime(data.fetchedAt)}`
    : 'Cargando datos…';

  return (
    <Card className={className}>
      <CardHeader className="space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            {Icon ? <Icon className="h-4 w-4 text-celeste" /> : null}
            {title}
          </CardTitle>
          {data ? <MarketStatus marketOpen={data.marketOpen} stale={data.stale} /> : null}
        </div>
        <CardDescription>
          {isError
            ? 'La API no responde en este momento.'
            : description
              ? `${description} · ${statusLabel.toLowerCase()}`
              : statusLabel}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Símbolo</TableHead>
              <TableHead className="text-right">Último</TableHead>
              <TableHead className="text-right">Var %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || !items
              ? Array.from({ length: limit ?? 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-4 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-5 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              : items.map((q) => (
                  <TableRow key={q.symbol}>
                    <TableCell className="font-mono font-medium">{q.symbol}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {formatPrice(q.last, q.currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      <ChangeBadge value={q.changePercent} />
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
