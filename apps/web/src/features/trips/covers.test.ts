import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { covers, coversByTag, getCover, searchCovers } from './covers';

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../public');

describe('registr cover fotek', () => {
  it('má unikátní id', () => {
    const ids = covers.map((cover) => cover.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('má pro každou fotku existující soubor', () => {
    const missing = covers
      .filter((cover) => !existsSync(path.join(publicDir, cover.file)))
      .map((cover) => cover.file);

    expect(missing).toEqual([]);
  });

  it('má u každé fotky název, cestu a aspoň jeden tag', () => {
    for (const cover of covers) {
      expect(cover.label.length).toBeGreaterThan(0);
      expect(cover.file.startsWith('/covers/')).toBe(true);
      expect(cover.tags.length).toBeGreaterThan(0);
    }
  });

  it('vrací undefined pro neznámé id', () => {
    expect(getCover('neexistuje')).toBeUndefined();
    expect(getCover(null)).toBeUndefined();
    expect(getCover(undefined)).toBeUndefined();
  });

  it('dohledá fotku podle id', () => {
    expect(getCover('asia-tokyo')?.label).toBe('Tokyo');
  });

  it('filtruje podle tagu', () => {
    const asia = coversByTag('asia');

    expect(asia.length).toBeGreaterThan(0);
    expect(asia.every((cover) => cover.tags.includes('asia'))).toBe(true);
    expect(coversByTag('all')).toHaveLength(covers.length);
  });

  it('hledá v názvu i v tagích', () => {
    expect(searchCovers('kyoto').map((cover) => cover.id)).toContain('asia-kyoto');
    expect(searchCovers('bike').every((cover) => cover.tags.includes('bike'))).toBe(true);
    expect(searchCovers('   ')).toHaveLength(covers.length);
    expect(searchCovers('nonsense-query')).toHaveLength(0);
  });
});
