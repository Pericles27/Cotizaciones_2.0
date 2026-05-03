import { Landmark } from 'lucide-react';
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
import type { QuoteList } from '@cotizaciones/types';
import { MarketStatus } from '../../components/market-status';
import { formatPrice, formatTime } from '../../lib/format';

interface BonosTableCardProps {
  data: QuoteList | undefined;
  isLoading: boolean;
}

export function BonosTableCard({ data, isLoading }: BonosTableCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-celeste" />
            Bonos Argentinos
            <span aria-hidden className="ml-1 inline-flex">
              <span className="h-3 w-1 bg-celeste" />
              <span className="h-3 w-1 bg-white" />
              <span className="h-3 w-1 bg-celeste" />
            </span>
          </CardTitle>
          <CardDescription>
            {data
              ? data.marketOpen === false
                ? `Datos del cierre · ${formatTime(data.fetchedAt)}`
                : `Actualizado ${formatTime(data.fetchedAt)}`
              : 'Cargando datos…'}
          </CardDescription>
        </div>
        {data ? <MarketStatus marketOpen={data.marketOpen} stale={data.stale} /> : null}
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Símbolo</TableHead>
              <TableHead className="text-right">Último</TableHead>
              <TableHead className="text-right">Variación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || !data
              ? Array.from({ length: 9 }).map((_, i) => (
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
              : data.items.map((q) => (
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
