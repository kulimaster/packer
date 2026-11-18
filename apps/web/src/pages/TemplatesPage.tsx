import { Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { toTemplateCard, useTemplates } from '@/features/templates/api';
import { TemplateCard } from '@/features/templates/components/template-card';
import { errorText } from '@/lib/api/errors';
import { useI18n } from '@/lib/i18n';

export function TemplatesPage() {
  const { t } = useI18n();
  const templates = useTemplates();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t('templates.title')}</h1>
        <p className="mt-1 text-sm text-on-surface-variant">{t('templates.subtitle')}</p>
      </header>

      {templates.isPending ? <TemplatesLoading /> : null}

      {templates.isError ? (
        <Card className="space-y-2 px-6 py-8 text-center">
          <h2 className="text-lg font-semibold">{t('templates.error.title')}</h2>
          <p className="text-sm text-on-surface-variant">{errorText(templates.error, t)}</p>
        </Card>
      ) : null}

      {templates.data?.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-tertiary text-primary">
            <Sparkles className="size-7" aria-hidden />
          </span>
          <h2 className="text-lg font-semibold">{t('templates.empty.title')}</h2>
          <p className="max-w-sm text-sm text-on-surface-variant">{t('templates.empty.body')}</p>
        </Card>
      ) : null}

      {templates.data && templates.data.length > 0 ? (
        <>
          <p className="rounded-card border border-outline bg-card px-4 py-3 text-sm text-on-surface-variant">
            {t('templates.hint')} {t('templates.hintDetail')}
          </p>

          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {templates.data.map((template) => (
              <li key={template.id}>
                <TemplateCard template={toTemplateCard(template)} className="h-full" />
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

function TemplatesLoading() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
      {[0, 1, 2].map((index) => (
        <Card key={index} className="h-28 animate-pulse bg-surface-container" />
      ))}
    </div>
  );
}
