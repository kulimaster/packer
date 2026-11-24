import { Copy, Pencil, Sparkles, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  toTemplateCard,
  useDeleteTemplate,
  useDuplicateTemplate,
  useTemplates,
  useUpdateTemplate,
  type TemplateSummaryDto,
} from '@/features/templates/api';
import { TemplateCard } from '@/features/templates/components/template-card';
import { TemplateForm, type TemplateValues } from '@/features/templates/components/template-form';
import { templateCopyName } from '@/features/templates/copy-name';
import { ApiError } from '@/lib/api/client';
import { errorText } from '@/lib/api/errors';
import { useI18n } from '@/lib/i18n';

export function TemplatesPage() {
  const { t } = useI18n();
  const templates = useTemplates();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const duplicateTemplate = useDuplicateTemplate();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const handleUpdate = (template: TemplateSummaryDto, values: TemplateValues) => {
    updateTemplate.mutate(
      {
        templateId: template.id,
        name: values.name,
        description: values.description,
        icon: template.icon,
        accent: template.accent,
      },
      { onSuccess: () => setEditingId(null) },
    );
  };

  const handleDelete = (templateId: string) => {
    setDeletingId(templateId);
    deleteTemplate.mutate(templateId, { onSettled: () => setDeletingId(null) });
  };

  const handleDuplicate = (template: TemplateSummaryDto) => {
    setDuplicatingId(template.id);
    duplicateTemplate.mutate(
      { templateId: template.id, name: templateCopyName(template.name, t) },
      { onSettled: () => setDuplicatingId(null) },
    );
  };

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

          {updateTemplate.error || deleteTemplate.error || duplicateTemplate.error ? (
            <p role="alert" className="rounded-input bg-danger-bg px-3 py-2 text-sm text-danger-fg">
              {errorText(
                updateTemplate.error ?? deleteTemplate.error ?? duplicateTemplate.error,
                t,
              )}
            </p>
          ) : null}

          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {templates.data.map((template) => (
              <li key={template.id} className="flex flex-col gap-2">
                {editingId === template.id ? (
                  <Card className="p-3">
                    <TemplateForm
                      mode="edit"
                      defaultValues={{
                        name: template.name,
                        description: template.description ?? '',
                      }}
                      onSubmit={(values) => handleUpdate(template, values)}
                      onCancel={() => setEditingId(null)}
                      pending={
                        updateTemplate.isPending &&
                        updateTemplate.variables?.templateId === template.id
                      }
                      fieldErrors={
                        updateTemplate.error instanceof ApiError &&
                        updateTemplate.variables?.templateId === template.id
                          ? updateTemplate.error.fieldErrors
                          : {}
                      }
                    />
                  </Card>
                ) : (
                  <>
                    <Link
                      to={`/templates/${template.id}`}
                      className="flex-1 rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <TemplateCard
                        template={toTemplateCard(template)}
                        className="h-full hover:border-outline-strong"
                      />
                    </Link>

                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicate(template)}
                        isLoading={duplicateTemplate.isPending && duplicatingId === template.id}
                      >
                        <Copy className="size-4" aria-hidden />
                        {t('templates.duplicate')}
                      </Button>

                      {template.isSystem ? null : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              updateTemplate.reset();
                              setEditingId(template.id);
                            }}
                          >
                            <Pencil className="size-4" aria-hidden />
                            {t('templates.edit')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(template.id)}
                            isLoading={deleteTemplate.isPending && deletingId === template.id}
                          >
                            <Trash2 className="size-4" aria-hidden />
                            {t('templates.delete')}
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                )}
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
