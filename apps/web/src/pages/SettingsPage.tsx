import { useI18n } from '@/lib/i18n';

export function SettingsPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="mt-1 text-sm text-on-surface-variant">{t('settings.subtitle')}</p>
      </header>

      <p className="rounded-card border border-dashed border-outline-strong bg-card/60 px-6 py-12 text-center text-sm text-on-surface-variant">
        {t('settings.placeholder')}
      </p>
    </div>
  );
}
