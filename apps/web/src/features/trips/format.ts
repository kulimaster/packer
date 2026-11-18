/** Výchozí locale pro případy, kdy volající jazyk neřeší (stories, testy). */
const defaultLocale = 'cs-CZ';

const numberFormats = new Map<string, Intl.NumberFormat>();

function numberFormat(locale: string): Intl.NumberFormat {
  let format = numberFormats.get(locale);

  if (!format) {
    format = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
    numberFormats.set(locale, format);
  }

  return format;
}

/**
 * Hmotnost se v API posílá v gramech (přesná hodnota, žádné floats v DB).
 * Člověk ale čte kilogramy – pod 1 kg necháváme gramy, aby „0,00 kg“ nic neříkalo.
 */
export function formatWeight(grams: number, locale: string = defaultLocale): string {
  if (!Number.isFinite(grams) || grams <= 0) {
    return '—';
  }

  if (grams < 1000) {
    return `${Math.round(grams)} g`;
  }

  const kilograms = Math.round(grams / 10) / 100;

  return `${numberFormat(locale).format(kilograms)} kg`;
}

/** Limity dopravců se zadávají v kilogramech; nula znamená „bez limitu“. */
export function formatKilograms(kilogramsValue: number, locale: string = defaultLocale): string {
  return `${numberFormat(locale).format(kilogramsValue)} kg`;
}
