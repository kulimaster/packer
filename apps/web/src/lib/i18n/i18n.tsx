import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { I18nContext, type I18n } from './context';
import { locales, translate, translatePlural } from './translate';
import type { Language } from './types';

/** Klíč v `localStorage`; drží jen volbu jazyka, nic citlivého. */
const storageKey = 'packer.language';

function isLanguage(value: string | null): value is Language {
  return value === 'cs' || value === 'en';
}

function readStoredLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'cs';
  }

  try {
    const stored = window.localStorage.getItem(storageKey);
    return isLanguage(stored) ? stored : 'cs';
  } catch {
    // Privátní režim může `localStorage` zablokovat – výchozí čeština stačí.
    return 'cs';
  }
}

export type I18nProviderProps = {
  children: ReactNode;
  /** Vynutí jazyk při prvním renderu – pro stories a testy. */
  initialLanguage?: Language;
};

/**
 * Drží zvolený jazyk, ukládá ho do `localStorage` a synchronizuje `<html lang>`.
 * Texty samotné dodává `useI18n()` z `context.ts`.
 */
export function I18nProvider({ children, initialLanguage }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(
    () => initialLanguage ?? readStoredLanguage(),
  );

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);

    try {
      window.localStorage.setItem(storageKey, next);
    } catch {
      // Neuloženo – po reloadu se vrátí výchozí čeština, ale UI funguje dál.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<I18n>(
    () => ({
      language,
      locale: locales[language],
      setLanguage,
      t: (key, vars) => translate(language, key, vars),
      plural: (key, count, vars) => translatePlural(language, key, count, vars),
    }),
    [language, setLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
