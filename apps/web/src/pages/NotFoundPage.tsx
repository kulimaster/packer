import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';

export function NotFoundPage() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <p className="font-display text-5xl font-bold text-primary">404</p>
      <h1 className="text-lg font-semibold">{t('notFound.title')}</h1>
      <Link to="/" className="text-sm font-semibold text-primary hover:underline">
        {t('notFound.back')}
      </Link>
    </div>
  );
}
