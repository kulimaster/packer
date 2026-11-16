import createClient from 'openapi-fetch';
import type { paths } from './schema';

/**
 * Tvar chybové odpovědi API (docs/api-contract.md). `errors` je vyplněné jen u validace
 * a klíč je název pole v camelCase – frontend ho umí namapovat na konkrétní input.
 */
export type ApiErrorBody = {
  code: string;
  message: string;
  errors?: Record<string, string[]> | null;
};

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }

  /** Chyby jednotlivých polí z 400 odpovědi. */
  get fieldErrors(): Record<string, string[]> {
    return this.body.errors ?? {};
  }
}

export const api = createClient<paths>({
  baseUrl: '',
  // Cookie je httpOnly, takže se musí posílat i napříč origin (dev proxy, produkce Caddy).
  credentials: 'include',
});

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

let csrfToken: string | null = null;

async function fetchCsrfToken(): Promise<string> {
  const { data, error, response } = await api.GET('/api/auth/csrf');

  if (!data) {
    throw toApiError(error, response.status);
  }

  csrfToken = data.token;
  return csrfToken;
}

/**
 * Antiforgery token je vázaný na uživatele – po loginu/logoutu je starý token neplatný
 * a je potřeba vyžádat nový (docs/api-contract.md).
 */
export function invalidateCsrfToken() {
  csrfToken = null;
}

// Každá mutace si token doplní sama, volající kód se o CSRF nestará.
api.use({
  async onRequest({ request }) {
    if (!SAFE_METHODS.has(request.method)) {
      request.headers.set('X-CSRF-TOKEN', csrfToken ?? (await fetchCsrfToken()));
    }

    return request;
  },
});

export function toApiError(error: unknown, status = 0): ApiError {
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    return new ApiError(status, error as ApiErrorBody);
  }

  return new ApiError(status, {
    code: 'network_error',
    message: 'Server is not reachable. Check your connection and try again.',
  });
}
