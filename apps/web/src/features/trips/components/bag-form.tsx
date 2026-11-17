import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { bagKindKeys, bagKindLabel } from '../bag-kind';

const bagSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(80, 'Use 80 characters or fewer.'),
  kind: z.enum(['CarryOn', 'Checked', 'Personal']),
  allowanceKg: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || (/^\d+(\.\d{1,2})?$/.test(value) && Number(value) <= 100),
      'Use kilograms between 0 and 100.',
    ),
});

export type BagValues = z.infer<typeof bagSchema>;

export type BagFormProps = {
  mode?: 'create' | 'edit';
  defaultValues?: Partial<BagValues>;
  onSubmit: (values: BagValues) => void;
  onCancel: () => void;
  pending?: boolean;
  error?: string | null;
  fieldErrors?: Record<string, string[]>;
};

/** Formulář bagu. Slouží pro založení i úpravu – liší se jen nadpisem a textem tlačítka. */
export function BagForm({
  mode = 'create',
  defaultValues,
  onSubmit,
  onCancel,
  pending = false,
  error,
  fieldErrors = {},
}: BagFormProps) {
  const form = useForm<BagValues>({
    resolver: zodResolver(bagSchema),
    defaultValues: {
      name: '',
      kind: 'CarryOn',
      allowanceKg: '',
      ...defaultValues,
    },
  });

  const fieldError = (field: keyof BagValues) =>
    fieldErrors[field]?.[0] ?? form.formState.errors[field]?.message;

  const submitLabel = mode === 'create' ? 'Add bag' : 'Save bag';
  const pendingLabel = mode === 'create' ? 'Adding…' : 'Saving…';

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-3 rounded-input bg-surface-container/60 p-3"
    >
      <Input
        label="Name"
        placeholder="Peak Design 45L"
        autoFocus={mode === 'create'}
        error={fieldError('name')}
        {...form.register('name')}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Select label="Type" error={fieldError('kind')} {...form.register('kind')}>
          {bagKindKeys.map((kind) => (
            <option key={kind} value={kind}>
              {bagKindLabel[kind]}
            </option>
          ))}
        </Select>
        <Input
          label="Allowance (kg)"
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          step={0.5}
          placeholder="Optional"
          hint="Carrier limit, not the bag weight."
          error={fieldError('allowanceKg')}
          {...form.register('allowanceKg')}
        />
      </div>

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
          {pending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
