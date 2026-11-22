import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useI18n, type I18n } from '@/lib/i18n';
import { itemTraitKeys, itemTraitLabels, type ItemTraitValues } from '../item-traits';

/** Schéma se staví až s překladačem – validační hlášky patří do katalogu. */
function itemSchema(t: I18n['t']) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(1, t('itemForm.validation.titleRequired'))
      .max(120, t('itemForm.validation.titleMax')),
    quantity: z
      .number()
      .int()
      .min(1, t('itemForm.validation.quantityMin'))
      .max(999, t('itemForm.validation.quantityMax')),
    weightGrams: z
      .string()
      .trim()
      .refine(
        (value) => value === '' || (/^\d+$/.test(value) && Number(value) <= 100_000),
        t('itemForm.validation.weight'),
      ),
    isEssential: z.boolean(),
    note: z.string().trim().max(300, t('itemForm.validation.noteMax')),
    flags: z.object({
      carryOnOnly: z.boolean(),
      fragile: z.boolean(),
      tsaLiquid: z.boolean(),
      battery: z.boolean(),
    }),
  });
}

export type ItemValues = z.infer<ReturnType<typeof itemSchema>>;

export type ItemFormProps = {
  /** `edit` mění jen texty tlačítek, pole jsou stejná jako při založení. */
  mode?: 'create' | 'edit';
  defaultValues?: Partial<ItemValues>;
  onSubmit: (values: ItemValues) => void;
  onCancel: () => void;
  pending?: boolean;
  error?: string | null;
  fieldErrors?: Record<string, string[]>;
};

/** Prázdné vlastnosti – ať jsou defaulty na jednom místě. */
function emptyTraits(): ItemTraitValues {
  return { carryOnOnly: false, fragile: false, tsaLiquid: false, battery: false };
}

/**
 * Formulář položky pro založení i úpravu – název, počet, hmotnost, poznámka
 * a vlastnosti, které ovlivňují balení (příruční, křehké, TSA, baterie).
 */
export function ItemForm({
  mode = 'create',
  defaultValues,
  onSubmit,
  onCancel,
  pending = false,
  error,
  fieldErrors = {},
}: ItemFormProps) {
  const { t } = useI18n();
  const schema = useMemo(() => itemSchema(t), [t]);

  const form = useForm<ItemValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      quantity: 1,
      weightGrams: '',
      isEssential: false,
      note: '',
      flags: emptyTraits(),
      ...defaultValues,
    },
  });

  const fieldError = (field: keyof ItemValues) =>
    fieldErrors[field]?.[0] ?? form.formState.errors[field]?.message;

  const submitLabel = mode === 'edit' ? t('itemForm.submit.edit') : t('itemForm.submit.create');
  const pendingLabel =
    mode === 'edit' ? t('itemForm.submitPending.edit') : t('itemForm.submitPending.create');

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-3 rounded-input bg-surface-container/60 p-3"
    >
      <Input
        label={t('itemForm.field.title')}
        placeholder={t('itemForm.placeholder.title')}
        autoFocus
        error={fieldError('title')}
        {...form.register('title')}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label={t('itemForm.field.quantity')}
          type="number"
          min={1}
          max={999}
          error={fieldError('quantity')}
          {...form.register('quantity', { valueAsNumber: true })}
        />
        <Input
          label={t('itemForm.field.weight')}
          type="number"
          inputMode="numeric"
          min={0}
          max={100_000}
          placeholder={t('itemForm.placeholder.weight')}
          hint={t('itemForm.hint.weight')}
          error={fieldError('weightGrams')}
          {...form.register('weightGrams')}
        />
      </div>

      <Input
        label={t('itemForm.field.note')}
        placeholder={t('itemForm.placeholder.note')}
        maxLength={300}
        error={fieldError('note')}
        {...form.register('note')}
      />

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-on-surface">
          {t('itemForm.field.flags')}
        </legend>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {itemTraitKeys.map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-2 text-sm font-medium text-on-surface"
            >
              <Checkbox {...form.register(`flags.${key}`)} />
              {t(itemTraitLabels[key])}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-on-surface">
        <Checkbox {...form.register('isEssential')} />
        {t('itemForm.essential')}
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
          {pending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
