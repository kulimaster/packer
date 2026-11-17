/**
 * Hmotnost se v API posílá v gramech (přesná hodnota, žádné floats v DB).
 * Člověk ale čte kilogramy – pod 1 kg necháváme gramy, aby „0.00 kg“ nic neříkalo.
 */
export function formatWeight(grams: number): string {
  if (!Number.isFinite(grams) || grams <= 0) {
    return '—';
  }

  if (grams < 1000) {
    return `${Math.round(grams)} g`;
  }

  const kilograms = Math.round(grams / 10) / 100;

  return `${kilograms} kg`;
}
