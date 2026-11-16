import { covers, type Cover, type CoverTag } from './covers.generated';

export { covers };
export type { Cover, CoverTag };

/** Rychlé hledání coveru podle id. */
export const coverById: ReadonlyMap<string, Cover> = new Map(
  covers.map((cover) => [cover.id, cover]),
);

/** Všechny tagy, které v registru existují – pro filtry v UI. */
export const coverTags: readonly CoverTag[] = [...new Set(covers.flatMap((c) => c.tags))].sort();

/** Nejoblíbenější destinace – pro nabídku, když uživatel nechce vybírat. */
export const featuredCovers: readonly Cover[] = covers.filter((c) =>
  ['asia-tokyo', 'asia-kyoto', 'europe-alps', 'trip-beach', 'america-nyc', 'trip-hiking'].includes(
    c.id,
  ),
);

/**
 * Dohledá cover podle id. Neznámé id (např. z databáze po odebrání fotky)
 * vrací `undefined` – volající musí umět zobrazit fallback.
 */
export function getCover(id: string | null | undefined): Cover | undefined {
  return id ? coverById.get(id) : undefined;
}

export function coversByTag(tag: CoverTag | 'all'): readonly Cover[] {
  return tag === 'all' ? covers : covers.filter((cover) => cover.tags.includes(tag));
}

/** Fulltext přes název a tagy. Prázdný dotaz vrací vše. */
export function searchCovers(query: string): readonly Cover[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return covers;
  return covers.filter(
    (cover) =>
      cover.label.toLowerCase().includes(needle) || cover.tags.some((tag) => tag.includes(needle)),
  );
}
