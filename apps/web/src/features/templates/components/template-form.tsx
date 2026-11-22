import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/cn';
import { useI18n, type I18n } from '@/lib/i18n';

/** Schéma se staví až s překladačem – validační hlášky patří do katalogu. */
function templateSchema(t: I18n['t']) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t('templateForm.validation.nameRequired'))
      .max(80, t('templateForm.validation.nameMax')),
    description: z.string().trim().max(160, t('templateForm.validation.descriptionMax')).optional(),
  });
}

export type TemplateValues = z.infer<ReturnType<typeof templateSchema>>;

export type TemplateFormProps = {
  /** `edit` je kompaktní varianta bez nadpisu – vejde se místo karty v knihovně. */
  mode?: 'create' | 'edit';
  defaultValues?: Partial<TemplateValues>;
  onSubmit: (values: TemplateValues) => void;
  onCancel: () => void;
  pending?: boolean;
  error?: string | null;
  fieldErrors?: Record<string, string[]>;
};

/**
 * Formulář šablony. Ikona a barva se tu needitují – nová šablona je dědí
 * z konstant, úprava posílá stávající hodnoty beze změny.
 */
export function TemplateForm({
  mode = 'create',
  defaultValues,
  onSubmit,
  onCancel,
  pending = false,
  error,
  fieldErrors = {},
}: TemplateFormProps) {
  const { t } = useI18n();
  const schema = useMemo(() => templateSchema(t), [t]);

  const form = useForm<TemplateValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', ...defaultValues },
  });

  const fieldError = (field: keyof TemplateValues) =>
    fieldErrors[field]?.[0] ?? form.formState.errors[field]?.message;

  const compact = mode === 'edit';
  const submitLabel = compact ? t('templateForm.submit.edit') : t('templateForm.submit');
  const pendingLabel = compact
    ? t('templateForm.submitPending.edit')
    : t('templateForm.submitPending');

  const formElement = (
    <form className="space-y-4" noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <Input
        label={t('templateForm.field.name')}
        placeholder={t('templateForm.placeholder.name')}
        autoFocus
        error={fieldError('name')}
        {...form.register('name')}
      />

      <Input
        label={t('templateForm.field.description')}
        placeholder={t('templateForm.placeholder.description')}
        hint={t('common.optional')}
        error={fieldError('description')}
        {...form.register('description')}
      />

      {error ? (
        <p role="alert" className="rounded-input bg-danger-bg px-3 py-2 text-sm text-danger-fg">
          {error}
        </p>
      ) : null}

      <div
        className={cn(
          'flex flex-col-reverse gap-3 sm:flex-row sm:justify-end',
          compact && 'sm:items-center',
        )}
      >
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

  if (!compact) {
    return (
      <Card className="space-y-4 p-4 sm:p-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold tracking-tight">{t('templateForm.title.create')}</h2>
          <p className="text-sm text-on-surface-variant">{t('templateForm.subtitle.create')}</p>
        </div>
        {formElement}
      </Card>
    );
  }

  return <div className="rounded-input bg-surface-container/60 p-3">{formElement}</div>;
}
