import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  useChangePassword,
  useCurrentUser,
  useUpdateProfile,
  type CurrentUser,
} from '@/features/auth/api';
import { AuthPanel } from '@/features/auth/components/auth-panel';
import { PasswordForm, type PasswordValues } from '@/features/auth/components/password-form';
import { ProfileForm, type ProfileValues } from '@/features/auth/components/profile-form';
import { ApiError } from '@/lib/api/client';
import { errorText } from '@/lib/api/errors';
import { useI18n } from '@/lib/i18n';

export function SettingsPage() {
  const { t } = useI18n();
  const user = useCurrentUser();

  if (user.isPending) {
    return <SettingsLoading />;
  }

  if (user.isError) {
    return (
      <Card className="space-y-4 px-6 py-12 text-center">
        <h2 className="text-lg font-semibold">{t('settings.error.title')}</h2>
        <p className="text-sm text-on-surface-variant">{errorText(user.error, t)}</p>
        <Button variant="secondary" onClick={() => void user.refetch()}>
          {t('common.tryAgain')}
        </Button>
      </Card>
    );
  }

  if (!user.data) {
    return (
      <div className="py-6">
        <AuthPanel />
      </div>
    );
  }

  return <SettingsContent user={user.data} />;
}

function SettingsContent({ user }: { user: CurrentUser }) {
  const { t } = useI18n();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const handleProfile = (values: ProfileValues) => {
    updateProfile.reset();

    return updateProfile.mutateAsync(values.displayName);
  };

  const handlePassword = (values: PasswordValues) => {
    changePassword.reset();

    return changePassword.mutateAsync({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  };

  const profileFieldErrors =
    updateProfile.error instanceof ApiError ? updateProfile.error.fieldErrors : {};
  const passwordFieldErrors =
    changePassword.error instanceof ApiError ? changePassword.error.fieldErrors : {};

  /** Když API poslalo chyby polí, nemá smysl ukazovat ještě obecnou hlášku nad formulářem. */
  const formError = (error: unknown, fieldErrors: Record<string, string[]>) =>
    Object.keys(fieldErrors).length > 0 ? null : errorText(error, t);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="mt-1 text-sm text-on-surface-variant">{t('settings.subtitle')}</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <ProfileForm
          email={user.email}
          defaultValues={{ displayName: user.displayName }}
          onSubmit={handleProfile}
          pending={updateProfile.isPending}
          error={formError(updateProfile.error, profileFieldErrors)}
          status={updateProfile.isSuccess ? t('settings.profile.saved') : null}
          fieldErrors={profileFieldErrors}
        />

        <PasswordForm
          onSubmit={handlePassword}
          pending={changePassword.isPending}
          error={formError(changePassword.error, passwordFieldErrors)}
          status={changePassword.isSuccess ? t('settings.password.saved') : null}
          fieldErrors={passwordFieldErrors}
        />
      </div>
    </div>
  );
}

function SettingsLoading() {
  return (
    <div className="grid gap-4 lg:grid-cols-2" aria-hidden>
      {[0, 1].map((key) => (
        <Card key={key} className="h-72 animate-pulse bg-surface-container" />
      ))}
    </div>
  );
}
