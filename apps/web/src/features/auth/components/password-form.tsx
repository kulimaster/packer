import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useI18n, type I18n } from '@/lib/i18n';

/** Schéma se staví až s překladačem – validační hlášky patří do katalogu. */
function passwordSchema(t: I18n['t']) {
  return z
    .object({
      currentPassword: z.string().min(1, t('auth.validation.passwordRequired')),
      newPassword: z.string().min(10, t('auth.validation.passwordMin')),
      confirmPassword: z.string().min(1, t('settings.password.confirmRequired')),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
      path: ['confirmPassword'],
      message: t('settings.password.mismatch'),
    });
}

export type PasswordValues = z.infer<ReturnType<typeof passwordSchema>>;

export type PasswordFormProps = {
  onSubmit: (values: PasswordValues) => Promise<unknown>;
  pending?: boolean;
  error?: string | null;
  /** Potvrzení po úspěšné změně; řídí ho stránka. */
  status?: string | null;
  fieldErrors?: Record<string, string[]>;
};

export function PasswordForm({
  onSubmit,
  pending = false,
  error,
  status,
  fieldErrors = {},
}: PasswordFormProps) {
  const { t } = useI18n();
  const schema = useMemo(() => passwordSchema(t), [t]);

  const form = useForm<PasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const fieldError = (field: keyof PasswordValues) =>
    fieldErrors[field]?.[0] ?? form.formState.errors[field]?.message;

  return (
    <Card className="space-y-4 p-4 sm:p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-bold tracking-tight">{t('settings.password.title')}</h2>
        <p className="text-sm text-on-surface-variant">{t('settings.password.subtitle')}</p>
      </div>

      <form
        className="space-y-4"
        noValidate
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await onSubmit(values);
            form.reset();
          } catch {
            // Chybu zobrazí stránka – formulář zůstane vyplněný, ať jde opravit heslo.
          }
        })}
      >
        <Input
          label={t('settings.password.current')}
          type="password"
          autoComplete="current-password"
          error={fieldError('currentPassword')}
          {...form.register('currentPassword')}
        />

        <Input
          label={t('settings.password.new')}
          type="password"
          autoComplete="new-password"
          hint={t('settings.password.hint')}
          error={fieldError('newPassword')}
          {...form.register('newPassword')}
        />

        <Input
          label={t('settings.password.confirm')}
          type="password"
          autoComplete="new-password"
          error={fieldError('confirmPassword')}
          {...form.register('confirmPassword')}
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
            {pending ? t('settings.password.submitPending') : t('settings.password.submit')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
