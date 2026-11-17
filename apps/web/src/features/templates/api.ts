import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, toApiError } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';
import type { TemplateCardData } from './components/template-card';

export type TemplateSummaryDto = components['schemas']['TemplateSummary'];
export type ImportTemplatesResultDto = components['schemas']['ImportTemplatesResult'];

export const templateKeys = {
  list: ['templates'] as const,
};

export function useTemplates() {
  return useQuery({
    queryKey: templateKeys.list,
    queryFn: async (): Promise<TemplateSummaryDto[]> => {
      const { data, error, response } = await api.GET('/api/templates');

      if (!data) {
        throw toApiError(error, response.status);
      }

      return data;
    },
  });
}

export function useImportTemplates(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateIds: string[]): Promise<ImportTemplatesResultDto> => {
      const { data, error, response } = await api.POST('/api/trips/{tripId}/templates', {
        params: { path: { tripId } },
        body: { templateIds },
      });

      if (!data) {
        throw toApiError(error, response.status);
      }

      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['trips', tripId] });
      void queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function toTemplateCard(template: TemplateSummaryDto): TemplateCardData {
  return {
    id: template.id,
    name: template.name,
    description: template.description ?? undefined,
    icon: template.icon,
    accent: template.accent,
    itemCount: Number(template.itemCount),
    estimatedWeightGrams: Number(template.estimatedWeightGrams),
    categories: template.categories,
  };
}
