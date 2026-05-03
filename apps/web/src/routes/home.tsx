import { Bitcoin, Building2, Globe2, Landmark } from 'lucide-react';
import { useBonos, useFx } from '../features/bonos/use-bonos';
import { BonosCompact } from '../features/bonos/bonos-compact';
import { FxStrip } from '../features/bonos/fx-strip';
import { useCripto } from '../features/cripto/use-cripto';
import { CriptoStrip } from '../features/cripto/cripto-strip';
import { useIndices } from '../features/indices/use-indices';
import { IndicesStrip } from '../features/indices/indices-strip';
import { useAdrs, useCedears, useMerval, useSp500 } from '../features/quotes/use-quotes';
import { QuoteTableCompact } from '../features/quotes/quote-table-compact';

const BONOS_DASH_SYMBOLS = ['AL30', 'AL30D', 'GD30', 'GD30D', 'GD35', 'GD35D'];

/**
 * Dashboard ultra-compacto y full-responsive.
 *
 *  En lg+ el panel de cripto vive en el ticker marquee del AppShell, así que
 *  el dashboard se reduce a FX + Bonos + 4 paneles de acciones — todo entra
 *  en una pantalla típica 1080p.
 *
 *  En mobile/tablet (< lg) mostramos CriptoStrip dentro del dashboard para
 *  no perder visibilidad cuando el ticker está oculto.
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
      <FxStrip data={fx.data} isLoading={fx.isLoading} />

      {/* Cripto strip — solo mobile/tablet, en lg+ ya está el ticker arriba */}
      <section className="lg:hidden">
        <CriptoStrip data={cripto.data} isLoading={cripto.isLoading} />
      </section>

      <BonosCompact data={bonos.data} isLoading={bonos.isLoading} symbols={BONOS_DASH_SYMBOLS} />

      <section
        className="grid justify-center gap-3"
        style={{
          // Tope superior por columna para que no se estiren en pantallas anchas
          // y los cards queden con proporción más cuadrada (~340 × 280 ≈ 1.2:1).
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 340px))',
        }}
      >
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
      </section>
    </div>
  );
}
