import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { errorText } from '@/lib/api/errors';
import { useI18n } from '@/lib/i18n';
import { useLogin, useRegister } from '../api';
import { AuthCard, type AuthFormValues, type AuthMode } from './auth-card';

/**
 * Napojení přihlašovacího formuláře na API. Prezentační `AuthCard` zůstává bez stavů
 * o serveru, takže se dá snadno testovat a storybookovat.
 */
export function AuthPanel() {
  const { t } = useI18n();
  const [mode, setMode] = useState<AuthMode>('login');
  const login = useLogin();
  const register = useRegister();
  const active = mode === 'register' ? register : login;
  const resetLogin = login.reset;
  const resetRegister = register.reset;

  useEffect(() => {
    // Chyba z předchozího režimu nemá ve formuláři co dělat.
    resetLogin();
    resetRegister();
  }, [mode, resetLogin, resetRegister]);

  const handleSubmit = (values: AuthFormValues) => {
    if (mode === 'register') {
      register.mutate({
        email: values.email,
        password: values.password,
        displayName: values.displayName ?? '',
      });
      return;
    }

    login.mutate({ email: values.email, password: values.password });
  };

  const error = errorText(active.error, t);

  return (
    <AuthCard
      key={mode}
      mode={mode}
      onModeChange={setMode}
      onSubmit={handleSubmit}
      pending={active.isPending}
      error={error}
      fieldErrors={active.error instanceof ApiError ? active.error.fieldErrors : {}}
    />
  );
}
