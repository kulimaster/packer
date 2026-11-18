/** Jazyk uživatelského rozhraní. Čeština je výchozí, angličtina volitelná. */
export type Language = 'cs' | 'en';

/**
 * Tvary zprávy pro `Intl.PluralRules`. Čeština potřebuje `one` (1), `few` (2–4)
 * a `other` (0 a 5+) – CLDR pro češtinu kategorii `many` nepoužívá.
 * Chybějící tvar spadne na `other`.
 */
export type PluralForms = {
  one: string;
  other: string;
  few?: string;
  many?: string;
};

/** Hodnota v katalogu zpráv: buď prostý text, nebo tvary pro plurál. */
export type CatalogueEntry = string | PluralForms;

/** Hodnoty dosazované do `{placeholder}` ve zprávě. */
export type MessageVars = Record<string, string | number>;

/**
 * Značkovač plurálních zpráv. Drží návratový typ `PluralForms`, aby se do
 * odvozeného typu katalogu nedostaly literální typy jednotlivých tvarů.
 */
export function plural(forms: PluralForms): PluralForms {
  return forms;
}
