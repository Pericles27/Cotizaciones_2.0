import { Bitcoin, Building2, Globe2, Landmark } from 'lucide-react';
import { useBonos, useFx } from '../features/bonos/use-bonos';
import { BonosBoard } from '../features/bonos/bonos-board';
import { FxBoard } from '../features/bonos/fx-board';
import { useCripto } from '../features/cripto/use-cripto';
import { CriptoStrip } from '../features/cripto/cripto-strip';
import { useIndices } from '../features/indices/use-indices';
import { IndicesStrip } from '../features/indices/indices-strip';
import { useAdrs, useCedears, useMerval, useSp500 } from '../features/quotes/use-quotes';
import { QuoteTableCompact } from '../features/quotes/quote-table-compact';

const BONOS_DASH_SYMBOLS = ['AL30', 'AL30D', 'GD30', 'GD30D', 'GD35', 'GD35D'];

/**
 * Dashboard panel-en-vivo — usa todo el viewport con tres bandas:
 *
 *   1. Índices (full-width).
 *   2. Bonos Argentinos + Dólar implícito (lg: 50/50).
 *   3. 4 paneles de acciones — Merval, ADRs, S&P 500, CEDEARs (lg: 4 cols).
 *
 * En mobile/tablet (<lg) el ticker cripto del navbar está oculto, por eso
 * acá insertamos un CriptoStrip antes de los paneles de acciones.
 */
export function HomePage() {
  const bonos = useBonos();
  const fx = useFx();
  const cripto = useCripto();
  const indices = useIndices();
  const merval = useMerval();
  const adrs = useAdrs();
  const sp500 = useSp500();
  const cedears = useCedears();

  return (
    <div className="space-y-3">
      <IndicesStrip data={indices.data} isLoading={indices.isLoading} />

      <div className="grid gap-3 lg:grid-cols-2">
        <BonosBoard
          data={bonos.data}
          isLoading={bonos.isLoading}
          symbols={BONOS_DASH_SYMBOLS}
        />
        <FxBoard data={fx.data} isLoading={fx.isLoading} />
      </div>

      {/* Cripto strip — solo mobile/tablet, en lg+ ya está el ticker arriba */}
      <section className="lg:hidden">
        <CriptoStrip data={cripto.data} isLoading={cripto.isLoading} />
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuoteTableCompact
          panel="merval"
          title="Merval"
          icon={Landmark}
          data={merval.data}
          isLoading={merval.isLoading}
          isError={merval.isError}
          limit={9}
          href="/acciones"
        />
        <QuoteTableCompact
          panel="adrs"
          title="ADRs"
          icon={Globe2}
          data={adrs.data}
          isLoading={adrs.isLoading}
          isError={adrs.isError}
          limit={9}
          href="/acciones"
        />
        <QuoteTableCompact
          panel="sp500"
          title="S&P 500"
          icon={Building2}
          data={sp500.data}
          isLoading={sp500.isLoading}
          isError={sp500.isError}
          limit={9}
          href="/acciones"
        />
        <QuoteTableCompact
          panel="cedears"
          title="CEDEARs"
          icon={Bitcoin}
          data={cedears.data}
          isLoading={cedears.isLoading}
          isError={cedears.isError}
          limit={9}
          href="/acciones"
        />
      </div>
    </div>
  );
}
