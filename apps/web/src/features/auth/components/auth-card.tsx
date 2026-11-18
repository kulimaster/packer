import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useI18n, type I18n } from '@/lib/i18n';

export type AuthMode = 'login' | 'register';

export type AuthFormValues = {
  email: string;
  password: string;
  displayName?: string;
};

function loginSchema(t: I18n['t']) {
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, t('auth.validation.emailRequired'))
      .email(t('auth.validation.emailInvalid')),
    password: z.string().min(1, t('auth.validation.passwordRequired')),
    displayName: z.string().optional(),
  });
}

function registerSchema(t: I18n['t']) {
  return loginSchema(t).extend({
    displayName: z
      .string()
      .trim()
      .min(1, t('auth.validation.displayNameRequired'))
      .max(80, t('auth.validation.displayNameMax')),
    password: z.string().min(10, t('auth.validation.passwordMin')),
  });
}

export type AuthCardProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onSubmit: (values: AuthFormValues) => void;
  pending?: boolean;
  /** Chyba celého formuláře (špatné heslo, nedostupný server). */
  error?: string | null;
  /** Chyby polí z API (400 validation_failed). */
  fieldErrors?: Record<string, string[]>;
};

export function AuthCard({
  mode,
  onModeChange,
  onSubmit,
  pending = false,
  error,
  fieldErrors = {},
}: AuthCardProps) {
  const { t } = useI18n();
  const isRegister = mode === 'register';
  const schema = useMemo(() => (isRegister ? registerSchema(t) : loginSchema(t)), [isRegister, t]);

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', displayName: '' },
  });

  const serverError = (field: keyof AuthFormValues) => {
    const message = fieldErrors[field]?.[0];
    if (!message) {
      return form.formState.errors[field]?.message;
    }
    return message;
  };

  return (
    <Card className="mx-auto w-full max-w-md space-y-6 p-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">
          {isRegister ? t('auth.register.title') : t('auth.login.title')}
        </h2>
        <p className="text-sm text-on-surface-variant">
          {isRegister ? t('auth.register.subtitle') : t('auth.login.subtitle')}
        </p>
      </div>

      <form
        className="space-y-4"
        noValidate
        onSubmit={form.handleSubmit((values) => onSubmit(values))}
      >
        {isRegister ? (
          <Input
            label={t('auth.field.displayName')}
            autoComplete="name"
            placeholder={t('auth.placeholder.displayName')}
            error={serverError('displayName')}
            {...form.register('displayName')}
          />
        ) : null}

        <Input
          label={t('auth.field.email')}
          type="email"
          autoComplete="email"
          placeholder={t('auth.placeholder.email')}
          error={serverError('email')}
          {...form.register('email')}
        />

        <Input
          label={t('auth.field.password')}
          type="password"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          placeholder={isRegister ? t('auth.placeholder.passwordNew') : '••••••••••'}
          error={serverError('password')}
          {...form.register('password')}
        />

        {error ? (
          <p role="alert" className="rounded-input bg-danger-bg px-3 py-2 text-sm text-danger-fg">
            {error}
          </p>
        ) : null}

        <Button type="submit" fullWidth disabled={pending}>
          {pending
            ? t('auth.submit.pending')
            : isRegister
              ? t('auth.submit.register')
              : t('auth.submit.login')}
        </Button>
      </form>

      <p className="text-center text-sm text-on-surface-variant">
        {isRegister ? t('auth.switch.toRegister') : t('auth.switch.toLogin')}{' '}
        <button
          type="button"
          className="font-semibold text-primary hover:underline"
          onClick={() => onModeChange(isRegister ? 'login' : 'register')}
        >
          {isRegister ? t('auth.switch.toLoginAction') : t('auth.switch.toRegisterAction')}
        </button>
      </p>
    </Card>
  );
}
