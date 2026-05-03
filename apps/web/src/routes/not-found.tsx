import { Link } from 'react-router-dom';
import { Button } from '@cotizaciones/ui';

export function NotFoundPage() {
  return (
    <div className="grid place-items-center py-24 text-center">
      <div className="space-y-3">
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="text-3xl font-semibold tracking-tight">No encontramos esa página</h1>
        <p className="text-sm text-muted-foreground">
          Probablemente cambiamos la ruta al modernizar la app.
        </p>
        <Button asChild className="mt-2">
          <Link to="/">Volver al panel</Link>
        </Button>
      </div>
    </div>
  );
}
