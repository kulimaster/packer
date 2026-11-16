import { LayoutGrid, Plane, SlidersHorizontal } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/cn';

const navigation = [
  { to: '/', label: 'Trips', icon: Plane, end: true },
  { to: '/templates', label: 'Templates', icon: LayoutGrid, end: false },
  { to: '/settings', label: 'Settings', icon: SlidersHorizontal, end: false },
];

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-9 items-center justify-center rounded-full bg-primary text-white">
        <Plane className="size-5" aria-hidden />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">Packer</span>
    </div>
  );
}

export function AppShell() {
  return (
    <div className="min-h-dvh bg-surface">
      {/* Desktop: levý sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-outline bg-card px-4 py-6 lg:flex">
        <Brand />

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold text-on-surface-variant transition-colors',
                  isActive ? 'bg-primary text-white' : 'hover:bg-surface-container',
                )
              }
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="rounded-card bg-surface-container px-3 py-2 text-xs text-on-surface-variant">
          v0.1 · vývoj
        </div>
      </aside>

      <div className="lg:pl-64">
        {/* Mobil: horní lišta */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-outline bg-surface/90 px-4 py-3 backdrop-blur lg:hidden">
          <Brand />
        </header>

        <main className="mx-auto w-full max-w-5xl px-4 pt-6 pb-28 lg:px-8 lg:pb-12">
          <Outlet />
        </main>
      </div>

      {/* Mobil: bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-outline bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
        {navigation.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-semibold',
                isActive ? 'text-primary' : 'text-muted',
              )
            }
          >
            <Icon className="size-5" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
