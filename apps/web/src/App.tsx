import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/app-shell';
import { HomePage } from './routes/home';
import { BonosPage } from './routes/bonos';
import { AccionesPage } from './routes/acciones';
import { CriptoPage } from './routes/cripto';
import { NotFoundPage } from './routes/not-found';

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bonos" element={<BonosPage />} />
        <Route path="/acciones" element={<AccionesPage />} />
        <Route path="/cripto" element={<CriptoPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}
