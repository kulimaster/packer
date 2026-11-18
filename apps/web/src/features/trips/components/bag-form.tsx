import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useI18n, type I18n } from '@/lib/i18n';
import { bagKindKeys, bagKindMessageKey } from '../bag-kind';

/** Schéma se staví až s překladačem – validační hlášky patří do katalogu. */
function bagSchema(t: I18n['t']) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t('bagForm.validation.nameRequired'))
      .max(80, t('bagForm.validation.nameMax')),
    kind: z.enum(['CarryOn', 'Checked', 'Personal']),
    allowanceKg: z
      .string()
      .trim()
      .refine(
        (value) => value === '' || (/^\d+(\.\d{1,2})?$/.test(value) && Number(value) <= 100),
        t('bagForm.validation.allowance'),
      ),
  });
}

export type BagValues = z.infer<ReturnType<typeof bagSchema>>;

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
  const { t } = useI18n();
  const schema = useMemo(() => bagSchema(t), [t]);

  const form = useForm<BagValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      kind: 'CarryOn',
      allowanceKg: '',
      ...defaultValues,
    },
  });

  const fieldError = (field: keyof BagValues) =>
    fieldErrors[field]?.[0] ?? form.formState.errors[field]?.message;

  const submitLabel = mode === 'create' ? t('bagForm.submit.create') : t('bagForm.submit.edit');
  const pendingLabel = mode === 'create' ? t('bagForm.pending.create') : t('bagForm.pending.edit');

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-3 rounded-input bg-surface-container/60 p-3"
    >
      <Input
        label={t('bagForm.field.name')}
        placeholder={t('bagForm.placeholder.name')}
        autoFocus={mode === 'create'}
        error={fieldError('name')}
        {...form.register('name')}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label={t('bagForm.field.kind')}
          error={fieldError('kind')}
          {...form.register('kind')}
        >
          {bagKindKeys.map((kind) => (
            <option key={kind} value={kind}>
              {t(bagKindMessageKey[kind])}
            </option>
          ))}
        </Select>
        <Input
          label={t('bagForm.field.allowance')}
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          step={0.5}
          placeholder={t('common.optional')}
          hint={t('bagForm.hint.allowance')}
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
          {t('common.cancel')}
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
