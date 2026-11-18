import { createContext, useContext } from 'react';
import {
  locales,
  translate,
  translatePlural,
  type MessageKey,
  type PluralMessageKey,
} from './translate';
import type { Language, MessageVars } from './types';

export type I18n = {
  language: Language;
  /** Locale pro `Intl.*` (`cs-CZ`/`en-US`). */
  locale: string;
  setLanguage: (language: Language) => void;
  t: (key: MessageKey, vars?: MessageVars) => string;
  plural: (key: PluralMessageKey, count: number, vars?: MessageVars) => string;
};

/**
 * Výchozí hodnota pro komponenty bez provideru (Storybook, izolované testy).
 * Přepínač jazyka v tomto režimu nic nemění – scénáře s ním patří pod provider.
 */
export const defaultI18n: I18n = {
  language: 'cs',
  locale: locales.cs,
  setLanguage: () => {},
  t: (key, vars) => translate('cs', key, vars),
  plural: (key, count, vars) => translatePlural('cs', key, count, vars),
};

export const I18nContext = createContext<I18n>(defaultI18n);

export function useI18n(): I18n {
  return useContext(I18nContext);
}
