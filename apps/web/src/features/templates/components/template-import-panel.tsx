import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/cn';
import { TemplateCard, type TemplateCardData } from './template-card';

export type TemplateImportPanelProps = {
  templates: TemplateCardData[];
  selectedIds: string[];
  onToggle: (templateId: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  pending?: boolean;
  error?: string | null;
  loading?: boolean;
  className?: string;
};

/**
 * Multi-select panel pro import šablon do výletu. Stav výběru drží stránka,
 * panel je presentational – stejně jako bagy a kategorie.
 */
export function TemplateImportPanel({
  templates,
  selectedIds,
  onToggle,
  onClose,
  onConfirm,
  pending = false,
  error,
  loading = false,
  className,
}: TemplateImportPanelProps) {
  const selectedCount = selectedIds.length;
  const confirmLabel =
    selectedCount === 0
      ? 'Add templates'
      : `Add ${selectedCount} ${selectedCount === 1 ? 'template' : 'templates'}`;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex items-start justify-between gap-3 border-b border-outline px-4 py-3">
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight">Add templates</h2>
          <p className="text-xs text-on-surface-variant">
            Pick one or more kits. Items are appended to your packing list.
          </p>
        </div>
        <IconButton
          size="sm"
          aria-label="Close template picker"
          onClick={onClose}
          disabled={pending}
        >
          <X className="size-4" aria-hidden />
        </IconButton>
      </div>

      <div className="max-h-[26rem] space-y-2 overflow-y-auto p-4">
        {loading ? (
          <p className="px-1 py-6 text-center text-sm text-on-surface-variant">
            Loading templates…
          </p>
        ) : templates.length === 0 ? (
          <p className="px-1 py-6 text-center text-sm text-on-surface-variant">
            No templates available yet.
          </p>
        ) : (
          templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              selected={selectedIds.includes(template.id)}
              onToggle={() => onToggle(template.id)}
              disabled={pending}
            />
          ))
        )}
      </div>

      {error ? (
        <p
          role="alert"
          className="mx-4 mb-3 rounded-input bg-danger-bg px-3 py-2 text-sm text-danger-fg"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline px-4 py-3">
        <p className="text-xs text-on-surface-variant">
          {selectedCount === 0
            ? 'Nothing selected yet.'
            : `${selectedCount} selected · categories are matched by name`}
        </p>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={selectedCount === 0 || pending}
            isLoading={pending}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Card>
  );
}
