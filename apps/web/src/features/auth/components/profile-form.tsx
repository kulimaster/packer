import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useI18n, type I18n } from '@/lib/i18n';

/** Schéma se staví až s překladačem – validační hlášky patří do katalogu. */
function profileSchema(t: I18n['t']) {
  return z.object({
    displayName: z
      .string()
      .trim()
      .min(1, t('auth.validation.displayNameRequired'))
      .max(80, t('auth.validation.displayNameMax')),
  });
}

export type ProfileValues = z.infer<ReturnType<typeof profileSchema>>;

export type ProfileFormProps = {
  /** E-mail se zatím měnit nedá – jen se zobrazuje. */
  email: string;
  defaultValues?: Partial<ProfileValues>;
  onSubmit: (values: ProfileValues) => Promise<unknown>;
  pending?: boolean;
  error?: string | null;
  /** Potvrzení po úspěšném uložení; řídí ho stránka. */
  status?: string | null;
  fieldErrors?: Record<string, string[]>;
};

export function ProfileForm({
  email,
  defaultValues,
  onSubmit,
  pending = false,
  error,
  status,
  fieldErrors = {},
}: ProfileFormProps) {
  const { t } = useI18n();
  const schema = useMemo(() => profileSchema(t), [t]);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: '', ...defaultValues },
  });

  const fieldError = (field: keyof ProfileValues) =>
    fieldErrors[field]?.[0] ?? form.formState.errors[field]?.message;

  return (
    <Card className="space-y-4 p-4 sm:p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-bold tracking-tight">{t('settings.profile.title')}</h2>
        <p className="text-sm text-on-surface-variant">{t('settings.profile.subtitle')}</p>
      </div>

      <form
        className="space-y-4"
        noValidate
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await onSubmit(values);
            form.reset(values);
          } catch {
            // Chybu zobrazí stránka – formulář jen zůstane otevřený s vyplněnými hodnotami.
          }
        })}
      >
        <div className="rounded-input bg-surface-container px-3 py-2">
          <p className="text-xs font-semibold tracking-wide text-on-surface-variant uppercase">
            {t('settings.profile.email')}
          </p>
          <p className="text-sm text-on-surface">{email}</p>
        </div>

        <Input
          label={t('settings.profile.displayName')}
          autoComplete="name"
          error={fieldError('displayName')}
          {...form.register('displayName')}
        />

        {error ? (
          <p role="alert" className="rounded-input bg-danger-bg px-3 py-2 text-sm text-danger-fg">
            {error}
          </p>
        ) : null}

        {status ? (
          <p role="status" className="rounded-input bg-tertiary px-3 py-2 text-sm text-primary">
            {status}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? t('settings.profile.submitPending') : t('settings.profile.submit')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
