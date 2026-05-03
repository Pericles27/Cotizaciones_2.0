import { Building2, Globe2, Landmark } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@cotizaciones/ui';
import { useAdrs, useCedears, useMerval, useSp500 } from '../features/quotes/use-quotes';
import { QuotesDataTable } from '../features/quotes/quotes-data-table';

/**
 * Página dedicada de Acciones — vista completa con búsqueda, orden y paginación.
 */
export function AccionesPage() {
  const merval = useMerval();
  const adrs = useAdrs();
  const sp500 = useSp500();
  const cedears = useCedears();

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Acciones</h1>
        <p className="text-sm text-muted-foreground">
          Paneles completos del Merval, ADRs argentinos en NY, S&amp;P 500 y CEDEARs argentinos.
        </p>
      </header>

      <Tabs defaultValue="merval">
        <TabsList>
          <TabsTrigger value="merval">
            <Landmark className="h-3.5 w-3.5" />
            Merval
          </TabsTrigger>
          <TabsTrigger value="adrs">
            <Globe2 className="h-3.5 w-3.5" />
            ADRs
          </TabsTrigger>
          <TabsTrigger value="sp500">
            <Building2 className="h-3.5 w-3.5" />
            S&amp;P 500
          </TabsTrigger>
          <TabsTrigger value="cedears">CEDEARs</TabsTrigger>
        </TabsList>

        <TabsContent value="merval">
          <QuotesDataTable
            panel="merval"
            title="Merval"
            description="Acciones argentinas"
            icon={Landmark}
            data={merval.data}
            isLoading={merval.isLoading}
          />
        </TabsContent>

        <TabsContent value="adrs">
          <QuotesDataTable
            panel="adrs"
            title="ADRs"
            description="Argentinas listadas en Nueva York"
            icon={Globe2}
            data={adrs.data}
            isLoading={adrs.isLoading}
          />
        </TabsContent>

        <TabsContent value="sp500">
          <QuotesDataTable
            panel="sp500"
            title="S&P 500"
            description="Top americanas"
            icon={Building2}
            data={sp500.data}
            isLoading={sp500.isLoading}
          />
        </TabsContent>

        <TabsContent value="cedears">
          <QuotesDataTable
            panel="cedears"
            title="CEDEARs"
            description="Recibos argentinos de acciones extranjeras"
            data={cedears.data}
            isLoading={cedears.isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
