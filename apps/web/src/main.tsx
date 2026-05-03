import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './lib/theme';
import { App } from './App';
import './styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      // refetchInterval lo definen los hooks (adaptativo según horario de mercado).
      refetchOnWindowFocus: true,
      retry: 2,
    },
  },
});

const root = document.getElementById('root');
if (!root) throw new Error('No #root');

createRoot(root).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="cotizaciones-theme">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
