import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, invalidateCsrfToken, toApiError } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type CurrentUser = components['schemas']['UserResponse'];

export const authKeys = {
  me: ['auth', 'me'] as const,
};

/**
 * Vrací `null` pro nepřihlášeného – 401 je běžný stav, ne chyba, a stránka podle něj
 * zobrazí přihlášení. Ostatní chyby se propagují do `error`.
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async (): Promise<CurrentUser | null> => {
      const { data, error, response } = await api.GET('/api/auth/me');

      if (data) {
        return data;
      }

      if (response.status === 401) {
        return null;
      }

      throw toApiError(error, response.status);
    },
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = LoginInput & {
  displayName: string;
};

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LoginInput): Promise<CurrentUser> => {
      const { data, error, response } = await api.POST('/api/auth/login', { body: input });

      if (!data) {
        throw toApiError(error, response.status);
      }

      invalidateCsrfToken();
      return data;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user);
      void queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RegisterInput): Promise<CurrentUser> => {
      const { data, error, response } = await api.POST('/api/auth/register', { body: input });

      if (!data) {
        throw toApiError(error, response.status);
      }

      invalidateCsrfToken();
      return data;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user);
      void queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.POST('/api/auth/logout');
      invalidateCsrfToken();
    },
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me, null);
      queryClient.removeQueries({ queryKey: ['trips'] });
    },
  });
}
