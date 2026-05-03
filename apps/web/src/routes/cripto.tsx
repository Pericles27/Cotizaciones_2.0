import { CriptoDataTable } from '../features/cripto/cripto-data-table';
import { CriptoStats } from '../features/cripto/cripto-stats';
import { useCripto } from '../features/cripto/use-cripto';

/**
 * Página dedicada de cripto — layout profesional:
 *   1. Header con título + descripción.
 *   2. Stats macro (4 cards: total seguidas, volumen, top gainer, top loser).
 *   3. Tabla principal con búsqueda, filtros, orden y paginación.
 *
 * En lg+ el strip de cards de cripto vive en el ticker marquee del navbar,
 * así que acá no lo duplicamos.
 */
export function CriptoPage() {
  const cripto = useCripto();

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Cripto</h1>
        <p className="text-sm text-muted-foreground">
          Top 150 pares USDT por volumen 24h, vía Binance — buscá, filtrá y marcá tus favoritas con
          ⭐ para que aparezcan primero.
        </p>
      </header>

      <CriptoStats data={cripto.data} isLoading={cripto.isLoading} />

      <CriptoDataTable data={cripto.data} isLoading={cripto.isLoading} />
    </div>
  );
}
