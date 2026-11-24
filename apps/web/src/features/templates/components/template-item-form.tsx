import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useI18n, type I18n } from '@/lib/i18n';
import { itemTraitKeys, itemTraitLabels, type ItemTraitValues } from '@/features/trips/item-traits';

/** Schéma se staví až s překladačem – validační hlášky patří do katalogu. */
function templateItemSchema(t: I18n['t']) {
  return z.object({
    categoryName: z
      .string()
      .trim()
      .min(1, t('templateItemForm.validation.categoryRequired'))
      .max(80, t('templateItemForm.validation.categoryMax')),
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
    note: z.string().trim().max(300, t('itemForm.validation.noteMax')),
    isEssential: z.boolean(),
    flags: z.object({
      carryOnOnly: z.boolean(),
      fragile: z.boolean(),
      tsaLiquid: z.boolean(),
      battery: z.boolean(),
    }),
  });
}

export type TemplateItemValues = z.infer<ReturnType<typeof templateItemSchema>>;

export type TemplateItemFormProps = {
  mode?: 'create' | 'edit';
  defaultValues?: Partial<TemplateItemValues>;
  /** Názvy kategorií šablony do nápovědy – položka se po importu zařadí podle názvu. */
  categories?: string[];
  onSubmit: (values: TemplateItemValues) => void;
  onCancel: () => void;
  pending?: boolean;
  error?: string | null;
  fieldErrors?: Record<string, string[]>;
};

function emptyTraits(): ItemTraitValues {
  return { carryOnOnly: false, fragile: false, tsaLiquid: false, battery: false };
}

/**
 * Formulář položky šablony. Na rozdíl od položky výletu má navíc kategorii –
 * šablona nemá vlastní kategorie, jen názvy, do kterých se import zařadí.
 */
export function TemplateItemForm({
  mode = 'create',
  defaultValues,
  categories = [],
  onSubmit,
  onCancel,
  pending = false,
  error,
  fieldErrors = {},
}: TemplateItemFormProps) {
  const { t } = useI18n();
  const schema = useMemo(() => templateItemSchema(t), [t]);

  const form = useForm<TemplateItemValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      categoryName: '',
      title: '',
      quantity: 1,
      weightGrams: '',
      note: '',
      isEssential: false,
      flags: emptyTraits(),
      ...defaultValues,
    },
  });

  const fieldError = (field: keyof TemplateItemValues) =>
    fieldErrors[field]?.[0] ?? form.formState.errors[field]?.message;

  const submitLabel =
    mode === 'edit' ? t('templateItemForm.submit.edit') : t('templateItemForm.submit.create');
  const pendingLabel =
    mode === 'edit'
      ? t('templateItemForm.submitPending.edit')
      : t('templateItemForm.submitPending.create');

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-3 rounded-input bg-surface-container/60 p-3"
    >
      <Input
        label={t('templateItemForm.field.category')}
        placeholder={t('templateItemForm.placeholder.category')}
        hint={t('templateItemForm.hint.category')}
        list="template-categories"
        autoFocus
        error={fieldError('categoryName')}
        {...form.register('categoryName')}
      />

      {categories.length > 0 ? (
        <datalist id="template-categories">
          {categories.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
      ) : null}

      <Input
        label={t('itemForm.field.title')}
        placeholder={t('itemForm.placeholder.title')}
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
