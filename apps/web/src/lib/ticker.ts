import { useCallback, useEffect, useState } from 'react';

/**
 * Símbolos seleccionados para mostrar en el ticker marquee.
 * Si el set está vacío, mostramos todos los disponibles.
 */
const KEY = 'cotizaciones:ticker:cripto:symbols';

function read(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(parsed) ? (parsed as string[]) : []);
  } catch {
    return new Set();
  }
}

function write(set: Set<string>) {
  localStorage.setItem(KEY, JSON.stringify([...set]));
}

export function useTickerSelection() {
  const [selection, setSelection] = useState<Set<string>>(() => read());

  // Mantenerlo sincronizado entre tabs / componentes.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setSelection(read());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggle = useCallback((symbol: string) => {
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) next.delete(symbol);
      else next.add(symbol);
      write(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setSelection(() => {
      write(new Set());
      return new Set();
    });
  }, []);

  /** ¿Mostrar este símbolo? */
  const isVisible = useCallback(
    (symbol: string) => selection.size === 0 || selection.has(symbol),
    [selection],
  );

  return { selection, toggle, reset, isVisible };
}
