import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useI18n, type I18n } from '@/lib/i18n';

/** Schéma se staví až s překladačem – validační hlášky patří do katalogu. */
function tripSchema(t: I18n['t']) {
  return z
    .object({
      title: z
        .string()
        .trim()
        .min(1, t('tripForm.validation.titleRequired'))
        .max(120, t('tripForm.validation.titleMax')),
      destination: z.string().trim().max(160, t('tripForm.validation.destinationMax')).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
    .refine(
      (values) => !values.startDate || !values.endDate || values.endDate >= values.startDate,
      {
        path: ['endDate'],
        message: t('tripForm.validation.endBeforeStart'),
      },
    );
}

export type TripValues = z.infer<ReturnType<typeof tripSchema>>;

export type TripFormProps = {
  /** `edit` schová nadpis a zmenší formulář – používá se přímo na detailu výletu. */
  mode?: 'create' | 'edit';
  defaultValues?: Partial<TripValues>;
  onSubmit: (values: TripValues) => void;
  onCancel: () => void;
  pending?: boolean;
  error?: string | null;
  fieldErrors?: Record<string, string[]>;
};

/** Formulář výletu pro založení i úpravu. Cover se mění jen přes šablony/covers, ne tady. */
export function TripForm({
  mode = 'create',
  defaultValues,
  onSubmit,
  onCancel,
  pending = false,
  error,
  fieldErrors = {},
}: TripFormProps) {
  const { t } = useI18n();
  const schema = useMemo(() => tripSchema(t), [t]);

  const form = useForm<TripValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', destination: '', startDate: '', endDate: '', ...defaultValues },
  });

  const fieldError = (field: keyof TripValues) =>
    fieldErrors[field]?.[0] ?? form.formState.errors[field]?.message;

  const compact = mode === 'edit';
  const submitLabel = compact ? t('tripForm.submit.edit') : t('tripForm.submit');
  const pendingLabel = compact ? t('tripForm.submitPending.edit') : t('tripForm.submitPending');

  const formElement = (
    <form className="space-y-4" noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <Input
        label={t('tripForm.field.title')}
        placeholder={t('tripForm.placeholder.title')}
        autoFocus
        error={fieldError('title')}
        {...form.register('title')}
      />

      <Input
        label={t('tripForm.field.destination')}
        placeholder={t('tripForm.placeholder.destination')}
        error={fieldError('destination')}
        {...form.register('destination')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t('tripForm.field.startDate')}
          type="date"
          error={fieldError('startDate')}
          {...form.register('startDate')}
        />
        <Input
          label={t('tripForm.field.endDate')}
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
        <Button
          type="button"
          variant={compact ? 'ghost' : 'secondary'}
          size={compact ? 'sm' : undefined}
          onClick={onCancel}
          disabled={pending}
        >
          {t('common.cancel')}
        </Button>
        <Button type="submit" size={compact ? 'sm' : undefined} disabled={pending}>
          {pending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );

  if (compact) {
    return <Card className="p-4">{formElement}</Card>;
  }

  return (
    <Card className="space-y-4 p-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">{t('tripForm.title')}</h2>
        <p className="text-sm text-on-surface-variant">{t('tripForm.subtitle')}</p>
      </div>
      {formElement}
    </Card>
  );
}
