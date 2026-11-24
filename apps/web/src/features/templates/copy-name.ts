import type { I18n } from '@/lib/i18n';

/** Limit názvu šablony v doméně (`Template.NameMaxLength`). */
const templateNameMaxLength = 80;

/**
 * Název kopie šablony. Přípona je v UI lokalizovaná, proto ji neskládá server;
 * zároveň hlídáme limit domény, aby dlouhý název neprošel validací až na API.
 */
export function templateCopyName(name: string, t: I18n['t']): string {
  return t('templates.copyName', { name }).slice(0, templateNameMaxLength);
}
