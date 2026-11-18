import type { I18n } from '@/lib/i18n';
import { ApiError } from './client';

/**
 * Chybová hláška pro UI. Kódy, které vznikají ve frontendu (nedostupný server),
 * se překládají; hlášky z API zůstávají v angličtině – jsou součástí kontraktu.
 */
export function errorText(error: unknown, t: I18n['t']): string | null {
  if (!error) {
    return null;
  }

  if (error instanceof ApiError) {
    return error.body.code === 'network_error' ? t('error.network') : error.message;
  }

  return error instanceof Error ? error.message : t('common.somethingWentWrong');
}
