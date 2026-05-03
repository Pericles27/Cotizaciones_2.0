import { useMemo, useState } from 'react';
import { Search, Settings2 } from 'lucide-react';
import { Input, Skeleton, cn } from '@cotizaciones/ui';
import type { CryptoQuote } from '@cotizaciones/types';
import { Dropdown } from '../../components/dropdown';
import { formatPrice } from '../../lib/format';
import { useTickerSelection } from '../../lib/ticker';
import { useCripto } from './use-cripto';

/** Como máximo cuántas cripto mostramos a la vez en la barra. */
const TICKER_LIMIT = 10;

/**
 * Barra horizontal con scroll continuo de precios cripto.
 * Visible solo en lg+ (debajo del navbar).
 *
 * - Loop seamless duplicando la lista (translateX 0 → -50%).
 * - Pausa con :hover para leer un valor.
 * - Dropdown ⚙️ con buscador y checkboxes para elegir hasta 10 monedas.
 * - Si la selección está vacía, mostramos las top 10 por volumen.
 */
export function CryptoTickerBar() {
  const cripto = useCripto();
  const { isVisible, toggle, selection, reset } = useTickerSelection();

  const allItems = cripto.data?.items ?? [];

  // Capped a 10. Si el usuario no eligió nada, mostramos las primeras
  // (que ya vienen ordenadas por volumen desde el backend).
  const visible = useMemo(
    () => allItems.filter((c) => isVisible(c.symbol)).slice(0, TICKER_LIMIT),
    [allItems, isVisible],
  );

  return (
    <div className="hidden lg:block border-b border-border/60 bg-card/50 backdrop-blur">
      <div className="flex h-9 items-center">
        <div className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Cripto
        </div>
        <div className="relative flex-1 overflow-hidden">
          {/* Fades en los bordes para que el loop entre/salga suave */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-card/90 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-card/90 to-transparent"
          />
          {cripto.isLoading || visible.length === 0 ? (
            <div className="flex gap-6 px-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-32" />
              ))}
            </div>
          ) : (
            <div className="animate-marquee pause-on-hover flex w-max gap-8 px-3">
              {[...visible, ...visible].map((c, i) => (
                <TickerItem key={`${c.symbol}-${i}`} crypto={c} />
              ))}
            </div>
          )}
        </div>
        <TickerEditor
          allItems={allItems}
          selection={selection}
          isVisible={isVisible}
          toggle={toggle}
          reset={reset}
        />
      </div>
    </div>
  );
}

interface TickerEditorProps {
  allItems: CryptoQuote[];
  selection: Set<string>;
  isVisible: (symbol: string) => boolean;
  toggle: (symbol: string) => void;
  reset: () => void;
}

function TickerEditor({ allItems, selection, isVisible, toggle, reset }: TickerEditorProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(
      (c) => c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
    );
  }, [allItems, query]);

  const visibleCount = allItems.filter((c) => isVisible(c.symbol)).length;
  const overLimit = visibleCount > TICKER_LIMIT;

  return (
    <Dropdown
      trigger={({ open, toggle: t }) => (
        <button
          type="button"
          onClick={t}
          aria-expanded={open}
          className={cn(
            'flex h-9 items-center gap-1.5 border-l border-border/60 px-3 text-xs font-medium transition-colors hover:bg-accent',
            open && 'bg-accent',
          )}
        >
          <Settings2 className="h-3.5 w-3.5" />
          <span className="hidden xl:inline">Editar</span>
          <span className="text-[10px] text-muted-foreground">
            ({selection.size === 0 ? `top ${TICKER_LIMIT}` : `${Math.min(selection.size, TICKER_LIMIT)}/${selection.size}`})
          </span>
        </button>
      )}
      className="w-[280px]"
    >
      {() => (
        <div className="space-y-2">
          <div className="space-y-2 px-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Mostrar (máx. {TICKER_LIMIT})
              </span>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setQuery('');
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Resetear
              </button>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por símbolo o nombre…"
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>
          <ul className="max-h-72 space-y-0.5 overflow-y-auto">
            {allItems.length === 0 ? (
              <li className="px-2 py-1.5 text-xs text-muted-foreground">Cargando…</li>
            ) : filtered.length === 0 ? (
              <li className="px-2 py-3 text-center text-xs text-muted-foreground">
                Sin resultados.
              </li>
            ) : (
              filtered.map((c) => {
                const checked = isVisible(c.symbol);
                return (
                  <li key={c.symbol}>
                    <label
                      className={cn(
                        'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-accent',
                        checked && 'bg-accent/40',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(c.symbol)}
                        className="h-3.5 w-3.5 accent-primary"
                      />
                      <span className="font-mono font-medium uppercase">{c.symbol}</span>
                      <span className="flex-1 truncate text-muted-foreground">{c.name}</span>
                    </label>
                  </li>
                );
              })
            )}
          </ul>
          <p className="border-t border-border/60 px-1 pt-2 text-[10px] text-muted-foreground">
            {selection.size === 0
              ? `Sin selección → mostrando top ${TICKER_LIMIT} por volumen.`
              : overLimit
                ? `Tenés ${selection.size} seleccionadas, mostramos solo las primeras ${TICKER_LIMIT}.`
                : `${selection.size} seleccionada${selection.size === 1 ? '' : 's'}.`}
          </p>
        </div>
      )}
    </Dropdown>
  );
}

function TickerItem({ crypto }: { crypto: CryptoQuote }) {
  const positive = crypto.changePercent24h > 0;
  const negative = crypto.changePercent24h < 0;
  return (
    <div className="flex items-center gap-2 whitespace-nowrap text-xs">
      <span className="font-mono font-bold uppercase text-foreground">{crypto.symbol}</span>
      <span className="font-mono tabular-nums text-muted-foreground">
        {formatPrice(crypto.priceUsd, 'USD')}
      </span>
      <span
        className={cn(
          'font-mono font-medium tabular-nums',
          positive && 'text-positive',
          negative && 'text-negative',
          !positive && !negative && 'text-muted-foreground',
        )}
      >
        {positive ? '+' : ''}
        {crypto.changePercent24h.toFixed(2)}%
      </span>
    </div>
  );
}
