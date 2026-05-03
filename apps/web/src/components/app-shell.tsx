import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Activity, Bitcoin, LineChart, Menu, Moon, Sun } from 'lucide-react';
import { Button, cn } from '@cotizaciones/ui';
import { useTheme } from '../lib/theme';
import { CryptoTickerBar } from '../features/cripto/cripto-ticker-bar';
import { Dropdown } from './dropdown';

const navItems = [
  { to: '/', label: 'Resumen', icon: Activity },
  { to: '/bonos', label: 'Bonos & FX', icon: LineChart },
  { to: '/acciones', label: 'Acciones', icon: LineChart },
  { to: '/cripto', label: 'Cripto', icon: Bitcoin },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <header className="border-b border-border/60">
          <div className="mx-auto flex h-14 w-full items-center gap-3 px-[clamp(0.75rem,2vw,2rem)] sm:gap-6">
            <Link
              to="/"
              className="flex flex-1 items-center gap-2 font-semibold tracking-tight sm:flex-none"
            >
              <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
                <LineChart className="h-4 w-4" />
              </span>
              <span>Cotizaciones</span>
              <span className="hidden text-xs font-normal text-muted-foreground md:inline">
                · panel en vivo
              </span>
            </Link>

            {/* Nav desktop / tablet */}
            <nav className="hidden flex-1 items-center gap-1 sm:flex">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-secondary text-secondary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Theme toggle (siempre visible) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label={isDark ? 'Cambiar a claro' : 'Cambiar a oscuro'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Burger menu (solo mobile) */}
            <div className="sm:hidden">
              <Dropdown
                trigger={({ open, toggle }) => (
                  <button
                    type="button"
                    onClick={toggle}
                    aria-expanded={open}
                    aria-label="Abrir menú"
                    className={cn(
                      'inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-accent',
                      open && 'bg-accent',
                    )}
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                )}
                className="w-56"
              >
                {({ close }) => (
                  <ul className="space-y-0.5">
                    {navItems.map(({ to, label, icon: Icon }) => (
                      <li key={to}>
                        <NavLink
                          to={to}
                          end={to === '/'}
                          onClick={close}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                              isActive
                                ? 'bg-secondary text-secondary-foreground'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                            )
                          }
                        >
                          <Icon className="h-4 w-4" />
                          {label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </Dropdown>
            </div>
          </div>
        </header>
        <CryptoTickerBar />
      </div>
      <main className="mx-auto w-full px-[clamp(0.75rem,2vw,2rem)] py-[clamp(0.75rem,1.5vw,1.5rem)]">
        {children}
      </main>
    </div>
  );
}
