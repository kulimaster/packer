import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

const addItemSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(120, 'Use 120 characters or fewer.'),
  quantity: z.number().int().min(1, 'At least 1.').max(999, 'At most 999.'),
  weightGrams: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || (/^\d+$/.test(value) && Number(value) <= 100_000),
      'Use a whole number of grams (0–100000).',
    ),
  isEssential: z.boolean(),
});

export type AddItemValues = z.infer<typeof addItemSchema>;

export type AddItemFormProps = {
  onSubmit: (values: AddItemValues) => void;
  onCancel: () => void;
  pending?: boolean;
  error?: string | null;
  fieldErrors?: Record<string, string[]>;
};

/**
 * Rychlé přidání položky přímo v kartě kategorie. Vědomě neřeší note a flags –
 * ty patří do plného editoru, který přijde s úpravami položek.
 */
export function AddItemForm({
  onSubmit,
  onCancel,
  pending = false,
  error,
  fieldErrors = {},
}: AddItemFormProps) {
  const form = useForm<AddItemValues>({
    resolver: zodResolver(addItemSchema),
    defaultValues: { title: '', quantity: 1, weightGrams: '', isEssential: false },
  });

  const fieldError = (field: keyof AddItemValues) =>
    fieldErrors[field]?.[0] ?? form.formState.errors[field]?.message;

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-3 rounded-input bg-surface-container/60 p-3"
    >
      <Input
        label="Item"
        placeholder="Passport"
        autoFocus
        error={fieldError('title')}
        {...form.register('title')}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Quantity"
          type="number"
          min={1}
          max={999}
          error={fieldError('quantity')}
          {...form.register('quantity', { valueAsNumber: true })}
        />
        <Input
          label="Weight (g)"
          type="number"
          inputMode="numeric"
          min={0}
          max={100_000}
          placeholder="Optional"
          hint="Weight of one piece."
          error={fieldError('weightGrams')}
          {...form.register('weightGrams')}
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-on-surface">
        <Checkbox {...form.register('isEssential')} />
        Essential
      </label>

      {error ? (
        <p role="alert" className="rounded-input bg-danger-bg px-3 py-2 text-sm text-danger-fg">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? 'Adding…' : 'Add item'}
        </Button>
      </div>
    </form>
  );
}
