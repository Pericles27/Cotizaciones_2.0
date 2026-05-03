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
import { Bitcoin } from 'lucide-react';
import type { CryptoQuote } from '@cotizaciones/types';
import { formatCompactUsd, formatPrice, formatTime } from '../../lib/format';

interface CriptoGridProps {
  data: { items: CryptoQuote[]; fetchedAt: string } | undefined;
  isLoading: boolean;
}

/** Tabla completa de cripto para la página dedicada. */
export function CriptoGrid({ data, isLoading }: CriptoGridProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bitcoin className="h-4 w-4 text-dorado" />
          Cripto — Top tickers
        </CardTitle>
        <CardDescription>
          {data ? `Actualizado ${formatTime(data.fetchedAt)}` : 'Cargando datos…'} · Datos de
          CoinPaprika
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">24h</TableHead>
              <TableHead className="text-right">Market Cap</TableHead>
              <TableHead className="text-right">Volumen 24h</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || !data
              ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-center">
                      <Skeleton className="mx-auto h-4 w-6" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-4 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-5 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-4 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-4 w-24" />
                    </TableCell>
                  </TableRow>
                ))
              : data.items.map((c) => (
                  <TableRow key={c.symbol}>
                    <TableCell className="text-center font-mono text-xs text-muted-foreground">
                      {c.rank ?? '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-medium uppercase">{c.symbol}</span>
                        <span className="text-xs text-muted-foreground">{c.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {formatPrice(c.priceUsd, 'USD')}
                    </TableCell>
                    <TableCell className="text-right">
                      <ChangeBadge value={c.changePercent24h} />
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums text-muted-foreground">
                      {c.marketCapUsd ? formatCompactUsd(c.marketCapUsd) : '—'}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums text-muted-foreground">
                      {c.volume24hUsd ? formatCompactUsd(c.volume24hUsd) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
