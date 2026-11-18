import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/cn';
import { useI18n, type I18n } from '@/lib/i18n';
import {
  categoryIconKeys,
  categoryIconMessageKey,
  categoryIcons,
  defaultCategoryIcon,
  type CategoryIconKey,
} from '../icons';

/** Schéma se staví až s překladačem – validační hlášky patří do katalogu. */
function addCategorySchema(t: I18n['t']) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t('categoryForm.validation.nameRequired'))
      .max(80, t('categoryForm.validation.nameMax')),
    icon: z.string().min(1).max(40),
    note: z.string().trim().max(200, t('categoryForm.validation.noteMax')).optional(),
  });
}

export type AddCategoryValues = z.infer<ReturnType<typeof addCategorySchema>>;

export type AddCategoryFormProps = {
  onSubmit: (values: AddCategoryValues) => void;
  onCancel: () => void;
  pending?: boolean;
  error?: string | null;
  fieldErrors?: Record<string, string[]>;
};

export function AddCategoryForm({
  onSubmit,
  onCancel,
  pending = false,
  error,
  fieldErrors = {},
}: AddCategoryFormProps) {
  const { t } = useI18n();
  const schema = useMemo(() => addCategorySchema(t), [t]);

  const form = useForm<AddCategoryValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', icon: defaultCategoryIcon, note: '' },
  });

  const [selectedIcon, setSelectedIcon] = useState<CategoryIconKey>(defaultCategoryIcon);

  const fieldError = (field: keyof AddCategoryValues) =>
    fieldErrors[field]?.[0] ?? form.formState.errors[field]?.message;

  return (
    <Card className="space-y-4 p-4 sm:p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-bold tracking-tight">{t('categoryForm.title')}</h2>
        <p className="text-sm text-on-surface-variant">{t('categoryForm.subtitle')}</p>
      </div>

      <form className="space-y-4" noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <Input
          label={t('categoryForm.field.name')}
          placeholder={t('categoryForm.placeholder.name')}
          autoFocus
          error={fieldError('name')}
          {...form.register('name')}
        />

        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-on-surface">{t('categoryForm.field.icon')}</p>
          <div className="flex flex-wrap gap-1.5">
            {categoryIconKeys.map((key) => {
              const Icon = categoryIcons[key];
              const selected = selectedIcon === key;

              return (
                <button
                  key={key}
                  type="button"
                  aria-label={t(categoryIconMessageKey[key])}
                  aria-pressed={selected}
                  onClick={() => {
                    form.setValue('icon', key, { shouldValidate: true });
                    setSelectedIcon(key);
                  }}
                  className={cn(
                    'flex size-9 items-center justify-center rounded-full border transition-colors',
                    selected
                      ? 'border-primary bg-tertiary text-primary'
                      : 'border-outline bg-card text-on-surface-variant hover:bg-surface-container',
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </button>
              );
            })}
          </div>
          {fieldError('icon') ? (
            <p className="text-xs font-medium text-danger">{fieldError('icon')}</p>
          ) : null}
        </div>

        <Input
          label={t('categoryForm.field.note')}
          placeholder={t('categoryForm.placeholder.note')}
          hint={t('common.optional')}
          error={fieldError('note')}
          {...form.register('note')}
        />

        {error ? (
          <p role="alert" className="rounded-input bg-danger-bg px-3 py-2 text-sm text-danger-fg">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={pending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? t('categoryForm.submitPending') : t('categoryForm.submit')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
