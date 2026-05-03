import { Landmark } from 'lucide-react';
import { useBonos, useFx } from '../features/bonos/use-bonos';
import { FxStrip } from '../features/bonos/fx-strip';
import { QuotesDataTable } from '../features/quotes/quotes-data-table';

export function BonosPage() {
  const bonos = useBonos();
  const fx = useFx();

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Bonos & Dólar implícito</h1>
        <p className="text-sm text-muted-foreground">
          Panel completo de bonos soberanos argentinos y cálculo en vivo de MEP / CCL.
        </p>
      </header>

      <FxStrip data={fx.data} isLoading={fx.isLoading} />

      <QuotesDataTable
        panel="bonos"
        title="Bonos"
        description="Bonos soberanos en pesos y dólares"
        icon={Landmark}
        data={bonos.data}
        isLoading={bonos.isLoading}
      />
    </div>
  );
}
