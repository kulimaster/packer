import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { api, toApiError } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';
import type { TemplateCardData } from './components/template-card';

export type TemplateSummaryDto = components['schemas']['TemplateSummary'];
export type TemplateDetailsDto = components['schemas']['TemplateDetails'];
export type TemplateItemDto = components['schemas']['TemplateItemDetails'];
export type ImportTemplatesResultDto = components['schemas']['ImportTemplatesResult'];

export const templateKeys = {
  list: ['templates'] as const,
  detail: (templateId: string) => ['templates', templateId] as const,
};

/**
 * Seznam i detail se mění společně – karta v knihovně ukazuje počty položek
 * a hmotnost, které se počítají z detailu.
 */
function invalidateTemplates(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: templateKeys.list });
}

export function useTemplate(templateId: string) {
  return useQuery({
    queryKey: templateKeys.detail(templateId),
    queryFn: async (): Promise<TemplateDetailsDto> => {
      const { data, error, response } = await api.GET('/api/templates/{templateId}', {
        params: { path: { templateId } },
      });

      if (!data) {
        throw toApiError(error, response.status);
      }

      return data;
    },
    enabled: templateId.length > 0,
  });
}

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

export type CreateTemplateInput = {
  tripId: string;
  name: string;
  description?: string;
  icon: string;
  accent: string;
};

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tripId,
      name,
      description,
      icon,
      accent,
    }: CreateTemplateInput): Promise<TemplateSummaryDto> => {
      const { data, error, response } = await api.POST('/api/templates', {
        body: {
          tripId,
          name,
          description: description || null,
          icon,
          accent,
        },
      });

      if (!data) {
        throw toApiError(error, response.status);
      }

      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: templateKeys.list });
    },
  });
}

export type UpdateTemplateInput = {
  templateId: string;
  name: string;
  description?: string;
  /** Ikona a barva se v UI needitují – posíláme současné hodnoty, ať je úprava nesmaže. */
  icon: string;
  accent: string;
};

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      name,
      description,
      icon,
      accent,
    }: UpdateTemplateInput): Promise<TemplateSummaryDto> => {
      const { data, error, response } = await api.PUT('/api/templates/{templateId}', {
        params: { path: { templateId } },
        body: { name, description: description || null, icon, accent },
      });

      if (!data) {
        throw toApiError(error, response.status);
      }

      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: templateKeys.list });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string): Promise<void> => {
      const { error, response } = await api.DELETE('/api/templates/{templateId}', {
        params: { path: { templateId } },
      });

      if (error) {
        throw toApiError(error, response.status);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: templateKeys.list });
    },
  });
}

export type TemplateItemInput = {
  categoryName: string;
  title: string;
  note: string | null;
  quantity: number;
  isEssential: boolean;
  /** Bitová maska z API jako string (`None`, `Fragile, Battery`). */
  flags: string;
  weightGrams: number | null;
};

export function useAddTemplateItem(templateId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TemplateItemInput): Promise<TemplateItemDto> => {
      const { data, error, response } = await api.POST('/api/templates/{templateId}/items', {
        params: { path: { templateId } },
        body: input,
      });

      if (!data) {
        throw toApiError(error, response.status);
      }

      return data;
    },
    onSuccess: () => invalidateTemplates(queryClient),
  });
}

export function useUpdateTemplateItem(templateId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      ...body
    }: TemplateItemInput & { itemId: string }): Promise<TemplateItemDto> => {
      const { data, error, response } = await api.PUT(
        '/api/templates/{templateId}/items/{itemId}',
        {
          params: { path: { templateId, itemId } },
          body,
        },
      );

      if (!data) {
        throw toApiError(error, response.status);
      }

      return data;
    },
    onSuccess: () => invalidateTemplates(queryClient),
  });
}

export function useDeleteTemplateItem(templateId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string): Promise<void> => {
      const { error, response } = await api.DELETE('/api/templates/{templateId}/items/{itemId}', {
        params: { path: { templateId, itemId } },
      });

      if (error) {
        throw toApiError(error, response.status);
      }
    },
    onSuccess: () => invalidateTemplates(queryClient),
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
