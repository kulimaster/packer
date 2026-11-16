/**
 * Stáhne výchozí cover fotky z Wikimedia Commons.
 *
 * Proč Commons: volné licence (CC0 / CC BY / CC BY-SA), žádný API klíč, stabilní URL.
 *
 * Co skript vyrobí:
 *   public/covers/<id>.jpg        fotky (lokálně, ne hotlink)
 *   public/covers/covers.json     metadata + atribuce (cache pro opakovaný běh)
 *   public/covers/CREDITS.md      lidsky čitelné atribuce
 *   src/features/trips/covers.generated.ts   typovaný registr pro UI
 *
 * Spuštění: npm run covers:fetch
 * Vynucení nového stažení: npm run covers:fetch -- --force
 */

import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, 'public', 'covers');
const cacheFile = path.join(outDir, 'covers.json');
const generatedFile = path.join(root, 'src', 'features', 'trips', 'covers.generated.ts');
const force = process.argv.includes('--force');
const API = 'https://commons.wikimedia.org/w/api.php';
const USER_AGENT = 'PackerCovers/1.0 (https://github.com/kulimaster/packer)';
/** Šířka stahovaného náhledu. Karta je max ~450 px, 900 px pokryje i retina. */
const WIDTH = 900;

/**
 * Kurátorovaný seznam. `query` = hledání na Commons, `tags` = filtrování v UI.
 * `title` připne konkrétní soubor – použij, když je první výsledek hledání slabý.
 */
const COVERS = [
  // --- destinace: Asie ---
  {
    id: 'asia-tokyo',
    label: 'Tokyo',
    tags: ['asia', 'city'],
    query: 'Tokyo skyline Shinjuku night',
  },
  { id: 'asia-kyoto', label: 'Kyoto', tags: ['asia', 'temple'], query: 'Fushimi Inari torii path' },
  {
    id: 'asia-fuji',
    label: 'Mount Fuji',
    tags: ['asia', 'mountain'],
    query: 'Mount Fuji cherry blossom lake',
  },
  {
    id: 'asia-bali',
    label: 'Bali',
    tags: ['asia', 'nature'],
    query: 'Bali rice terrace Tegalalang',
  },
  {
    id: 'asia-thailand',
    label: 'Thailand',
    tags: ['asia', 'beach'],
    query: 'Railay beach Krabi Thailand',
  },
  {
    id: 'asia-vietnam',
    label: 'Ha Long Bay',
    tags: ['asia', 'sea'],
    query: 'Ha Long Bay limestone karst',
  },
  {
    id: 'asia-himalaya',
    label: 'Himalaya',
    tags: ['asia', 'mountain'],
    query: 'Himalaya Everest mountain range',
  },
  { id: 'asia-india', label: 'Taj Mahal', tags: ['asia', 'city'], query: 'Taj Mahal Agra' },

  // --- destinace: Evropa ---
  {
    id: 'europe-paris',
    label: 'Paris',
    tags: ['europe', 'city'],
    query: 'Eiffel Tower Paris sunset',
  },
  { id: 'europe-alps', label: 'Alps', tags: ['europe', 'mountain'], query: 'Matterhorn Zermatt' },
  {
    id: 'europe-amalfi',
    label: 'Amalfi',
    tags: ['europe', 'sea'],
    query: 'Amalfi Coast Positano',
  },
  {
    id: 'europe-santorini',
    label: 'Santorini',
    tags: ['europe', 'sea'],
    query: 'Santorini Oia white houses',
  },
  {
    id: 'europe-prague',
    label: 'Prague',
    tags: ['europe', 'city'],
    query: 'Prague Charles Bridge Vltava',
  },
  {
    id: 'europe-norway',
    label: 'Norway fjord',
    tags: ['europe', 'nature'],
    query: 'Geirangerfjord Norway',
  },
  {
    id: 'europe-iceland',
    label: 'Iceland',
    tags: ['europe', 'nature'],
    query: 'Skogafoss waterfall Iceland',
  },

  // --- destinace: Amerika ---
  {
    id: 'america-nyc',
    label: 'New York',
    tags: ['america', 'city'],
    query: 'Manhattan skyline New York',
  },
  {
    id: 'america-grand-canyon',
    label: 'Grand Canyon',
    tags: ['america', 'nature'],
    query: 'Grand Canyon South Rim',
    title: 'View of Grand Canyon at Mather Point.jpg',
  },
  {
    id: 'america-patagonia',
    label: 'Patagonia',
    tags: ['america', 'mountain'],
    query: 'Torres del Paine Patagonia',
  },
  {
    id: 'america-yosemite',
    label: 'Yosemite',
    tags: ['america', 'nature'],
    query: 'Yosemite Valley Tunnel View',
  },

  // --- destinace: Afrika, Oceánie ---
  {
    id: 'africa-safari',
    label: 'Safari',
    tags: ['africa', 'wildlife'],
    query: 'Serengeti elephants savanna',
  },
  {
    id: 'africa-sahara',
    label: 'Sahara',
    tags: ['africa', 'desert'],
    query: 'Sahara dunes Merzouga Morocco',
    title: 'Erg Chebbi sunset.jpg',
  },
  {
    id: 'africa-cape-town',
    label: 'Cape Town',
    tags: ['africa', 'city'],
    query: 'Table Mountain Cape Town',
    title: 'Cape Town (ZA), Table Mountain -- 2024 -- 2762+64+66+68+70+72.jpg',
  },
  {
    id: 'oceania-tropical',
    label: 'Tropical island',
    tags: ['oceania', 'beach'],
    query: 'Fiji beach palm trees',
  },
  {
    id: 'australia-outback',
    label: 'Outback',
    tags: ['oceania', 'desert'],
    query: 'Uluru Ayers Rock',
  },

  // --- typ cesty / aktivita ---
  {
    id: 'trip-beach',
    label: 'Beach',
    tags: ['beach', 'summer'],
    query: 'tropical beach turquoise water palm',
    title: 'Navagio beach Zakynthos 3.jpg',
  },
  {
    id: 'trip-bike-road',
    label: 'Road cycling',
    tags: ['bike', 'sport'],
    query: 'road cycling race peloton',
  },
  {
    id: 'trip-bike-trail',
    label: 'Mountain biking',
    tags: ['bike', 'sport'],
    query: 'mountain biking singletrack forest',
    title: 'Mountain bike in downhill race.jpg',
  },
  {
    id: 'trip-hiking',
    label: 'Hiking',
    tags: ['hiking', 'mountain'],
    query: 'hiking trail ridge mountains hiker',
  },
  {
    id: 'trip-camping',
    label: 'Camping',
    tags: ['camping', 'nature'],
    query: 'tent camping wild nature lake',
  },
  {
    id: 'trip-roadtrip',
    label: 'Road trip',
    tags: ['roadtrip'],
    query: 'road trip green mountains',
    title: 'Going-to-the-Sun Road-27527-2.jpg',
  },
  {
    id: 'trip-ski',
    label: 'Skiing',
    tags: ['ski', 'winter'],
    query: 'ski slope alpine skiing',
    title: "Piste de ski sous l'Aiguille Rouge (mars 2023).JPG",
  },
  {
    id: 'trip-desert',
    label: 'Desert',
    tags: ['desert'],
    query: 'sand dunes desert sunset',
  },
];

const BAD_TITLE =
  /map|diagram|logo|flag|coat[ _]of[ _]arms|chart|screenshot|stamp|panorama|plan[ _]of|graph|scheme/i;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function api(params) {
  const url = `${API}?${new URLSearchParams({ action: 'query', format: 'json', ...params })}`;
  const res = await fetch(url, { headers: { 'user-agent': USER_AGENT } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function search(query) {
  const data = await api({
    generator: 'search',
    gsrsearch: `${query} filemime:image/jpeg`,
    gsrnamespace: '6',
    gsrlimit: '15',
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiurlwidth: String(WIDTH),
  });

  // `index` = pořadí relevance, 1 je nejlepší.
  return Object.values(data.query?.pages ?? {}).sort((a, b) => a.index - b.index);
}

function evaluate(page) {
  const info = page.imageinfo?.[0];
  if (!info) return null;
  if (info.mime !== 'image/jpeg') return null;
  if (!info.thumburl) return null;
  // Karta je na šířku – fotky na výšku se oříznou špatně.
  const ratio = info.width / info.height;
  if (ratio < 1.25 || ratio > 2.1) return null;
  if (info.width < 1400) return null;
  if (BAD_TITLE.test(page.title)) return null;

  return {
    title: page.title.replace(/^File:/, ''),
    thumbUrl: info.thumburl,
    sourceUrl: info.descriptionurl,
    width: info.width,
    height: info.height,
    author:
      (info.extmetadata?.Artist?.value ?? '')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim() || null,
    license: info.extmetadata?.LicenseShortName?.value ?? null,
  };
}

async function pick(query) {
  for (const page of await search(query)) {
    const candidate = evaluate(page);
    if (candidate) return candidate;
  }
  return null;
}

/** Přesně zadaný soubor – deterministické při opakovaném běhu. */
async function byTitle(title) {
  const data = await api({
    titles: `File:${title}`,
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiurlwidth: String(WIDTH),
  });
  const page = Object.values(data.query?.pages ?? {})[0];
  if (!page || page.missing !== undefined) return null;
  return evaluate(page);
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function download(url, file) {
  const res = await fetch(url, { headers: { 'user-agent': USER_AGENT } });
  if (!res.ok) throw new Error(`stažení selhalo: ${res.status}`);
  const type = res.headers.get('content-type') ?? '';
  if (!type.startsWith('image/')) throw new Error(`není obrázek: ${type}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 20_000) throw new Error(`podezřele malý soubor: ${buffer.length} B`);
  await writeFile(file, buffer);
  return buffer.length;
}

async function loadCache() {
  try {
    return JSON.parse(await readFile(cacheFile, 'utf8'));
  } catch {
    return [];
  }
}

function quote(value) {
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

async function writeGenerated(covers) {
  const body = covers
    .map(
      (c) => `  {
    id: ${quote(c.id)},
    label: ${quote(c.label)},
    file: ${quote(c.file)},
    tags: [${c.tags.map(quote).join(', ')}],
  },`,
    )
    .join('\n');

  const tags = [...new Set(covers.flatMap((c) => c.tags))];

  const content = `// Generováno skriptem scripts/fetch-covers.mjs – needituj ručně.
// Atribuce a zdroje: public/covers/CREDITS.md

export type CoverTag = ${tags.map(quote).join(' | ')};

export type Cover = {
  /** Stabilní id, ukládá se do Trip.CoverImage. */
  id: string;
  label: string;
  /** Cesta z veřejného rootu, např. /covers/asia-tokyo.jpg */
  file: string;
  tags: CoverTag[];
};

export const covers: readonly Cover[] = [
${body}
];
`;

  await writeFile(generatedFile, content, 'utf8');
}

/** Kurátorská část manifestu, která se do cache vždy promítne. */
function pickMeta({ id, label, tags, query }) {
  return { id, label, tags, query };
}

async function main() {
  await mkdir(outDir, { recursive: true });

  const byId = new Map((await loadCache()).map((c) => [c.id, c]));
  const results = [];
  const failed = [];
  let downloaded = 0;
  let totalBytes = 0;

  for (const cover of COVERS) {
    const file = path.join(outDir, `${cover.id}.jpg`);
    process.stdout.write(`→ ${cover.id.padEnd(22)} `);

    try {
      // Existující fotku i atribuci zachováme – běh nesmí přepsat kurátorský výběr.
      if (!force && (await exists(file)) && byId.has(cover.id)) {
        results.push({ ...byId.get(cover.id), ...pickMeta(cover) });
        console.log('existuje, přeskakuji');
        continue;
      }

      // Připnutý soubor > dřívější výběr > hledání. Drží výběr stabilní i při --force.
      const pinned = cover.title ?? byId.get(cover.id)?.title;
      const found = (pinned ? await byTitle(pinned) : null) ?? (await pick(cover.query));
      if (!found) throw new Error('nic neprošlo filtrem');

      const bytes = await download(found.thumbUrl, file);
      totalBytes += bytes;
      downloaded += 1;
      results.push({ ...pickMeta(cover), ...found, file: `/covers/${cover.id}.jpg`, bytes });
      console.log(`${found.title} (${Math.round(bytes / 1024)} kB)`);
    } catch (error) {
      failed.push({ id: cover.id, error: String(error) });
      console.log(`CHYBA: ${error}`);
    }

    await sleep(500);
  }

  await writeFile(cacheFile, `${JSON.stringify(results, null, 2)}\n`, 'utf8');

  const lines = [
    '# Cover photos',
    '',
    'Výchozí fotky výletů. Všechny pocházejí z [Wikimedia Commons](https://commons.wikimedia.org/)',
    'a jsou pod volnou licencí (CC0 / CC BY / CC BY-SA) nebo public domain.',
    '',
    'Generuje `npm run covers:fetch` – needituj ručně. Fotky jsou lokální (`public/covers/`),',
    'ne hotlinkované: repozitář nezávisí na běhu Commons a nezatěžujeme cizí infrastrukturu.',
    '',
    '| Soubor | Název | Autor | Licence | Zdroj |',
    '|---|---|---|---|---|',
    ...results.map((c) => {
      const author = (c.author ?? 'neznámý').replace(/\|/g, '/');
      const license = (c.license ?? '?').replace(/\|/g, '/');
      return `| \`${c.id}.jpg\` | ${c.label} | ${author} | ${license} | [Commons](${c.sourceUrl}) |`;
    }),
  ];

  await writeFile(path.join(outDir, 'CREDITS.md'), `${lines.join('\n')}\n`, 'utf8');
  await writeGenerated(results);

  console.log('');
  console.log(`Staženo: ${downloaded} (${(totalBytes / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`Celkem v registru: ${results.length}`);
  if (failed.length > 0) {
    console.log(`Nepovedlo se: ${failed.map((f) => `${f.id} (${f.error})`).join(', ')}`);
    process.exitCode = 1;
  }
}

await main();
