import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n';

export function NotFoundPage() {
  const { t } = useI18n();

  return (
    <Card className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-16 text-center">
      <p className="font-display text-5xl font-bold text-primary">404</p>
      <h1 className="text-lg font-semibold">{t('notFound.title')}</h1>
      <Link
        to="/"
        className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        {t('notFound.back')}
      </Link>
    </Card>
  );
}
