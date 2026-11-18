import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useI18n, type I18n } from '@/lib/i18n';

/** Schéma se staví až s překladačem – validační hlášky patří do katalogu. */
function addItemSchema(t: I18n['t']) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(1, t('addItem.validation.titleRequired'))
      .max(120, t('addItem.validation.titleMax')),
    quantity: z
      .number()
      .int()
      .min(1, t('addItem.validation.quantityMin'))
      .max(999, t('addItem.validation.quantityMax')),
    weightGrams: z
      .string()
      .trim()
      .refine(
        (value) => value === '' || (/^\d+$/.test(value) && Number(value) <= 100_000),
        t('addItem.validation.weight'),
      ),
    isEssential: z.boolean(),
  });
}

export type AddItemValues = z.infer<ReturnType<typeof addItemSchema>>;

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
  const { t } = useI18n();
  const schema = useMemo(() => addItemSchema(t), [t]);

  const form = useForm<AddItemValues>({
    resolver: zodResolver(schema),
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
        label={t('addItem.field.item')}
        placeholder={t('addItem.placeholder.item')}
        autoFocus
        error={fieldError('title')}
        {...form.register('title')}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label={t('addItem.field.quantity')}
          type="number"
          min={1}
          max={999}
          error={fieldError('quantity')}
          {...form.register('quantity', { valueAsNumber: true })}
        />
        <Input
          label={t('addItem.field.weight')}
          type="number"
          inputMode="numeric"
          min={0}
          max={100_000}
          placeholder={t('addItem.placeholder.weight')}
          hint={t('addItem.hint.weight')}
          error={fieldError('weightGrams')}
          {...form.register('weightGrams')}
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-on-surface">
        <Checkbox {...form.register('isEssential')} />
        {t('addItem.essential')}
      </label>

      {error ? (
        <p role="alert" className="rounded-input bg-danger-bg px-3 py-2 text-sm text-danger-fg">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={pending}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? t('addItem.submitPending') : t('addItem.submit')}
        </Button>
      </div>
    </form>
  );
}
