import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const createTripSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required.').max(120, 'Use 120 characters or fewer.'),
    destination: z.string().trim().max(160, 'Use 160 characters or fewer.').optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .refine((values) => !values.startDate || !values.endDate || values.endDate >= values.startDate, {
    path: ['endDate'],
    message: 'End date must not be before start date.',
  });

export type CreateTripValues = z.infer<typeof createTripSchema>;

export type CreateTripFormProps = {
  onSubmit: (values: CreateTripValues) => void;
  onCancel: () => void;
  pending?: boolean;
  error?: string | null;
  fieldErrors?: Record<string, string[]>;
};

export function CreateTripForm({
  onSubmit,
  onCancel,
  pending = false,
  error,
  fieldErrors = {},
}: CreateTripFormProps) {
  const form = useForm<CreateTripValues>({
    resolver: zodResolver(createTripSchema),
    defaultValues: { title: '', destination: '', startDate: '', endDate: '' },
  });

  const fieldError = (field: keyof CreateTripValues) =>
    fieldErrors[field]?.[0] ?? form.formState.errors[field]?.message;

  return (
    <Card className="space-y-4 p-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">New trip</h2>
        <p className="text-sm text-on-surface-variant">
          Zatím jen základ – kategorie a položky přidáš v detailu výletu.
        </p>
      </div>

      <form className="space-y-4" noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <Input
          label="Title"
          placeholder="Asia Vacation"
          autoFocus
          error={fieldError('title')}
          {...form.register('title')}
        />

        <Input
          label="Destination"
          placeholder="Tokyo & Kyoto, Japan"
          error={fieldError('destination')}
          {...form.register('destination')}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Start date"
            type="date"
            error={fieldError('startDate')}
            {...form.register('startDate')}
          />
          <Input
            label="End date"
            type="date"
            error={fieldError('endDate')}
            {...form.register('endDate')}
          />
        </div>

        {error ? (
          <p role="alert" className="rounded-input bg-danger-bg px-3 py-2 text-sm text-danger-fg">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? 'Creating…' : 'Create trip'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
