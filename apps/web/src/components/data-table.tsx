import { useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Search } from 'lucide-react';
import {
  Button,
  Input,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from '@cotizaciones/ui';

export type SortDir = 'asc' | 'desc';

export interface DataTableColumn<Row> {
  /** Identificador único de la columna. */
  id: string;
  /** Encabezado a renderizar. */
  header: React.ReactNode;
  /** Renderizador de la celda. */
  cell: (row: Row) => React.ReactNode;
  /** Si la columna se puede ordenar y cómo extraer el valor. */
  sortBy?: (row: Row) => number | string;
  /** Alineación de la celda y el encabezado. */
  align?: 'left' | 'right' | 'center';
  /** Clases extra para la celda. */
  cellClassName?: string;
  /** Clases extra para el encabezado. */
  headerClassName?: string;
}

export interface DataTableFilter<Row> {
  id: string;
  label: string;
  /** Predicate: si devuelve true, la fila pasa el filtro. */
  predicate: (row: Row) => boolean;
  defaultActive?: boolean;
}

interface DataTableProps<Row> {
  rows: Row[] | undefined;
  columns: DataTableColumn<Row>[];
  isLoading?: boolean;
  /** Función opcional que decide si la fila matchea con el query de búsqueda. */
  searchBy?: (row: Row) => string;
  searchPlaceholder?: string;
  /** Filtros toggleables — se renderizan como pills arriba de la tabla. */
  filters?: DataTableFilter<Row>[];
  initialSort?: { id: string; dir: SortDir };
  initialPageSize?: 10 | 25 | 50;
  rowKey: (row: Row) => string;
  /** Mensaje cuando no hay resultados. */
  emptyMessage?: React.ReactNode;
}

const PAGE_SIZES = [10, 25, 50] as const;

/**
 * Tabla genérica con búsqueda, orden por columna y paginación.
 * Sin dependencias de TanStack Table — todo en useState/useMemo.
 */
export function DataTable<Row>({
  rows,
  columns,
  isLoading,
  searchBy,
  searchPlaceholder = 'Buscar…',
  filters,
  initialSort,
  initialPageSize = 25,
  rowKey,
  emptyMessage = 'Sin resultados.',
}: DataTableProps<Row>) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{ id: string; dir: SortDir } | null>(initialSort ?? null);
  const [pageSize, setPageSize] = useState<10 | 25 | 50>(initialPageSize);
  const [page, setPage] = useState(0);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(
    () => new Set(filters?.filter((f) => f.defaultActive).map((f) => f.id) ?? []),
  );

  const filtered = useMemo(() => {
    if (!rows) return [];
    let result = rows;
    if (filters && activeFilters.size > 0) {
      const active = filters.filter((f) => activeFilters.has(f.id));
      result = result.filter((r) => active.every((f) => f.predicate(r)));
    }
    if (query.trim() && searchBy) {
      const q = query.trim().toLowerCase();
      result = result.filter((r) => searchBy(r).toLowerCase().includes(q));
    }
    return result;
  }, [rows, query, searchBy, filters, activeFilters]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.id === sort.id);
    if (!col?.sortBy) return filtered;
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = col.sortBy!(a);
      const bv = col.sortBy!(b);
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });
  }, [filtered, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const slice = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const toggleSort = (id: string) => {
    setSort((prev) => {
      if (!prev || prev.id !== id) return { id, dir: 'desc' };
      if (prev.dir === 'desc') return { id, dir: 'asc' };
      return null;
    });
    setPage(0);
  };

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setPage(0);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {searchBy ? (
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder={searchPlaceholder}
              className="pl-8"
            />
          </div>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-medium tabular-nums">
            {sorted.length} {sorted.length === 1 ? 'resultado' : 'resultados'}
          </span>
          <label className="flex items-center gap-1.5">
            <span>Por página</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value) as 10 | 25 | 50);
                setPage(0);
              }}
              className="rounded-md border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {filters && filters.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {filters.map((f) => {
            const active = activeFilters.has(f.id);
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => toggleFilter(f.id)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                  active
                    ? 'border-primary/40 bg-primary/15 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-accent',
                )}
                aria-pressed={active}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => {
                const isSorted = sort?.id === col.id;
                const sortable = Boolean(col.sortBy);
                return (
                  <TableHead
                    key={col.id}
                    className={cn(
                      col.headerClassName,
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                      sortable && 'cursor-pointer select-none hover:text-foreground',
                    )}
                    onClick={sortable ? () => toggleSort(col.id) : undefined}
                  >
                    <span
                      className={cn(
                        'inline-flex items-center gap-1',
                        col.align === 'right' && 'justify-end',
                      )}
                    >
                      {col.header}
                      {isSorted ? (
                        sort.dir === 'desc' ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronUp className="h-3 w-3" />
                        )
                      ) : null}
                    </span>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || !rows
              ? Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((col) => (
                      <TableCell
                        key={col.id}
                        className={cn(col.align === 'right' && 'text-right')}
                      >
                        <Skeleton
                          className={cn('h-4', col.align === 'right' ? 'ml-auto w-24' : 'w-32')}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : slice.length === 0
                ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        {emptyMessage}
                      </TableCell>
                    </TableRow>
                  )
                : slice.map((row) => (
                    <TableRow key={rowKey(row)}>
                      {columns.map((col) => (
                        <TableCell
                          key={col.id}
                          className={cn(
                            col.cellClassName,
                            col.align === 'right' && 'text-right',
                            col.align === 'center' && 'text-center',
                          )}
                        >
                          {col.cell(row)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Página {safePage + 1} de {pageCount}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={safePage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            aria-label="Página siguiente"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
