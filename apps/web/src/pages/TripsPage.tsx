import { Plus, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function TripsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Trips</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Naplánuj cestu a sbal se bez zapomenutých věcí.
          </p>
        </div>
        <Button>
          <Plus className="size-4" aria-hidden />
          New Trip
        </Button>
      </header>

      <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-tertiary text-primary">
          <Plane className="size-7" aria-hidden />
        </span>
        <h2 className="text-lg font-semibold">Zatím žádné výlety</h2>
        <p className="max-w-sm text-sm text-on-surface-variant">
          Až bude hotové API, objeví se tady tvoje výlety. Zatím si komponenty prohlédni ve
          Storybooku.
        </p>
      </Card>
    </div>
  );
}
