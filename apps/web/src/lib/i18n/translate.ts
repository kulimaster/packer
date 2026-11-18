import { cs, type Messages } from './messages.cs';
import { en } from './messages.en';
import type { Language, MessageVars, PluralForms } from './types';

/** Klíč prosté zprávy – pluralní klíče sem nesmí. */
export type MessageKey = {
  [K in keyof Messages]: Messages[K] extends PluralForms ? never : K;
}[keyof Messages];

/** Klíč pluralní zprávy – jen záznamy se tvary pro `Intl.PluralRules`. */
export type PluralMessageKey = {
  [K in keyof Messages]: Messages[K] extends PluralForms ? K : never;
}[keyof Messages];

const dictionaries: Record<Language, Messages> = { cs, en };

export const locales: Record<Language, string> = {
  cs: 'cs-CZ',
  en: 'en-US',
};

const pluralRules: Record<Language, Intl.PluralRules> = {
  cs: new Intl.PluralRules('cs-CZ'),
  en: new Intl.PluralRules('en-US'),
};

function interpolate(template: string, vars?: MessageVars): string {
  if (!vars) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in vars ? String(vars[name]) : placeholder,
  );
}

/** Prostý text ze záznamu katalogu. Pluralní záznam sem nepatří – hlídá to typ. */
function entryText(entry: string | PluralForms): string {
  if (typeof entry === 'string') {
    return entry;
  }

  throw new Error('Plural entry must be translated with plural().');
}

export function translate(language: Language, key: MessageKey, vars?: MessageVars): string {
  return interpolate(entryText(dictionaries[language][key]), vars);
}

export function translatePlural(
  language: Language,
  key: PluralMessageKey,
  count: number,
  vars?: MessageVars,
): string {
  const entry = dictionaries[language][key];

  if (typeof entry === 'string') {
    throw new Error('Non-plural entry must be translated with t().');
  }

  const category = pluralRules[language].select(count);
  const form = formsFor(entry, category);

  return interpolate(form, { ...vars, count });
}

function formsFor(entry: PluralForms, category: Intl.LDMLPluralRule): string {
  switch (category) {
    case 'one':
      return entry.one;
    case 'few':
      return entry.few ?? entry.many ?? entry.other;
    case 'many':
      return entry.many ?? entry.other;
    default:
      return entry.other;
  }
}

/** Jazyk, do kterého přepínač přepíná. */
export function otherLanguage(language: Language): Language {
  return language === 'cs' ? 'en' : 'cs';
}
