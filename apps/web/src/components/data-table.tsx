import { Fragment, useMemo, useState } from 'react';
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
  /**
   * Si true, la columna se oculta en pantallas chicas (<md) y aparece dentro
   * del detalle expandido al apretar el chevron en cada fila.
   */
  mobileHidden?: boolean;
  /**
   * Etiqueta corta usada en el detalle expandido en mobile (clave del par
   * label/valor). Si no se define, se usa el `id` capitalizado.
   */
  mobileLabel?: string;
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
 *
 * Responsive: las columnas marcadas con `mobileHidden` desaparecen del header
 * y de las filas en pantallas chicas (<md). En su lugar aparece un chevron
 * al final de cada fila que despliega un detalle con esos campos como pares
 * label/valor — así en mobile la tabla se reduce a lo esencial (símbolo,
 * precio, variación) y el resto se consulta on-demand.
 *
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
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const hasMobileHidden = useMemo(() => columns.some((c) => c.mobileHidden), [columns]);
  /** Cantidad de columnas visibles en mobile (las no-mobileHidden + el chevron). */
  const mobileColCount = useMemo(
    () => columns.filter((c) => !c.mobileHidden).length + (hasMobileHidden ? 1 : 0),
    [columns, hasMobileHidden],
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

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
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
                      // Padding más ajustado en mobile para que entren más datos.
                      'px-2 sm:px-3',
                      col.headerClassName,
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                      sortable && 'cursor-pointer select-none hover:text-foreground',
                      col.mobileHidden && 'hidden md:table-cell',
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
              {hasMobileHidden ? (
                <TableHead className="w-8 px-1 md:hidden" aria-label="" />
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || !rows
              ? Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((col) => (
                      <TableCell
                        key={col.id}
                        className={cn(
                          'px-2 sm:px-3',
                          col.align === 'right' && 'text-right',
                          col.mobileHidden && 'hidden md:table-cell',
                        )}
                      >
                        <Skeleton
                          className={cn('h-4', col.align === 'right' ? 'ml-auto w-24' : 'w-32')}
                        />
                      </TableCell>
                    ))}
                    {hasMobileHidden ? (
                      <TableCell className="w-8 px-1 md:hidden" />
                    ) : null}
                  </TableRow>
                ))
              : slice.length === 0
                ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length + (hasMobileHidden ? 1 : 0)}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        {emptyMessage}
                      </TableCell>
                    </TableRow>
                  )
                : slice.flatMap((row) => {
                    const key = rowKey(row);
                    const isExpanded = expanded.has(key);
                    const out: React.ReactNode[] = [
                      <TableRow
                        key={key}
                        className={cn(isExpanded && 'border-b-0 md:border-b')}
                      >
                        {columns.map((col) => (
                          <TableCell
                            key={col.id}
                            className={cn(
                              'px-2 sm:px-3',
                              col.cellClassName,
                              col.align === 'right' && 'text-right',
                              col.align === 'center' && 'text-center',
                              col.mobileHidden && 'hidden md:table-cell',
                            )}
                          >
                            {col.cell(row)}
                          </TableCell>
                        ))}
                        {hasMobileHidden ? (
                          <TableCell className="w-8 px-1 text-right md:hidden">
                            <button
                              type="button"
                              onClick={() => toggleExpanded(key)}
                              aria-expanded={isExpanded}
                              aria-controls={`row-detail-${key}`}
                              aria-label={isExpanded ? 'Ocultar detalle' : 'Mostrar detalle'}
                              className={cn(
                                'inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                                isExpanded && 'bg-accent text-foreground',
                              )}
                            >
                              <ChevronDown
                                className={cn(
                                  'h-4 w-4 transition-transform',
                                  isExpanded && 'rotate-180',
                                )}
                              />
                            </button>
                          </TableCell>
                        ) : null}
                      </TableRow>,
                    ];
                    if (hasMobileHidden && isExpanded) {
                      const hiddenCols = columns.filter((c) => c.mobileHidden);
                      out.push(
                        <TableRow
                          key={`${key}__detail`}
                          className="border-b bg-muted/30 hover:bg-muted/30 md:hidden"
                        >
                          <TableCell
                            id={`row-detail-${key}`}
                            colSpan={mobileColCount}
                            className="px-3 py-2"
                          >
                            <dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 text-xs">
                              {hiddenCols.map((col) => (
                                <Fragment key={col.id}>
                                  <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                    {col.mobileLabel ?? col.id}
                                  </dt>
                                  <dd className="text-right">{col.cell(row)}</dd>
                                </Fragment>
                              ))}
                            </dl>
                          </TableCell>
                        </TableRow>,
                      );
                    }
                    return out;
                  })}
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
