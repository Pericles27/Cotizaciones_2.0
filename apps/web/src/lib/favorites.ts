import { useCallback, useEffect, useState } from 'react';

/**
 * Cuántos símbolos a "destacar" en el dashboard, por panel.
 * Si el usuario marca favoritos, esos vienen primero;
 * si no, se usan los primeros N del panel.
 */
export type PanelKey = 'merval' | 'adrs' | 'sp500' | 'cedears' | 'bonos' | 'cripto';

const KEY = (panel: PanelKey) => `cotizaciones:favorites:${panel}`;

function readSet(panel: PanelKey): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(KEY(panel));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(parsed) ? (parsed as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeSet(panel: PanelKey, set: Set<string>) {
  localStorage.setItem(KEY(panel), JSON.stringify([...set]));
}

export function useFavorites(panel: PanelKey) {
  const [favorites, setFavorites] = useState<Set<string>>(() => readSet(panel));

  useEffect(() => {
    setFavorites(readSet(panel));
  }, [panel]);

  const toggle = useCallback(
    (symbol: string) => {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(symbol)) next.delete(symbol);
        else next.add(symbol);
        writeSet(panel, next);
        return next;
      });
    },
    [panel],
  );

  const isFavorite = useCallback((symbol: string) => favorites.has(symbol), [favorites]);

  return { favorites, isFavorite, toggle };
}
