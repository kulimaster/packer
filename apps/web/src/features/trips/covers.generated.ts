// Generováno skriptem scripts/fetch-covers.mjs – needituj ručně.
// Atribuce a zdroje: public/covers/CREDITS.md

export type CoverTag = 'asia' | 'city' | 'temple' | 'mountain' | 'nature' | 'beach' | 'sea' | 'europe' | 'america' | 'africa' | 'wildlife' | 'desert' | 'oceania' | 'summer' | 'bike' | 'sport' | 'hiking' | 'camping' | 'roadtrip' | 'ski' | 'winter';

export type Cover = {
  /** Stabilní id, ukládá se do Trip.CoverImage. */
  id: string;
  label: string;
  /** Cesta z veřejného rootu, např. /covers/asia-tokyo.jpg */
  file: string;
  tags: CoverTag[];
};

export const covers: readonly Cover[] = [
  {
    id: 'asia-tokyo',
    label: 'Tokyo',
    file: '/covers/asia-tokyo.jpg',
    tags: ['asia', 'city'],
  },
  {
    id: 'asia-kyoto',
    label: 'Kyoto',
    file: '/covers/asia-kyoto.jpg',
    tags: ['asia', 'temple'],
  },
  {
    id: 'asia-fuji',
    label: 'Mount Fuji',
    file: '/covers/asia-fuji.jpg',
    tags: ['asia', 'mountain'],
  },
  {
    id: 'asia-bali',
    label: 'Bali',
    file: '/covers/asia-bali.jpg',
    tags: ['asia', 'nature'],
  },
  {
    id: 'asia-thailand',
    label: 'Thailand',
    file: '/covers/asia-thailand.jpg',
    tags: ['asia', 'beach'],
  },
  {
    id: 'asia-vietnam',
    label: 'Ha Long Bay',
    file: '/covers/asia-vietnam.jpg',
    tags: ['asia', 'sea'],
  },
  {
    id: 'asia-himalaya',
    label: 'Himalaya',
    file: '/covers/asia-himalaya.jpg',
    tags: ['asia', 'mountain'],
  },
  {
    id: 'asia-india',
    label: 'Taj Mahal',
    file: '/covers/asia-india.jpg',
    tags: ['asia', 'city'],
  },
  {
    id: 'europe-paris',
    label: 'Paris',
    file: '/covers/europe-paris.jpg',
    tags: ['europe', 'city'],
  },
  {
    id: 'europe-alps',
    label: 'Alps',
    file: '/covers/europe-alps.jpg',
    tags: ['europe', 'mountain'],
  },
  {
    id: 'europe-amalfi',
    label: 'Amalfi',
    file: '/covers/europe-amalfi.jpg',
    tags: ['europe', 'sea'],
  },
  {
    id: 'europe-santorini',
    label: 'Santorini',
    file: '/covers/europe-santorini.jpg',
    tags: ['europe', 'sea'],
  },
  {
    id: 'europe-prague',
    label: 'Prague',
    file: '/covers/europe-prague.jpg',
    tags: ['europe', 'city'],
  },
  {
    id: 'europe-norway',
    label: 'Norway fjord',
    file: '/covers/europe-norway.jpg',
    tags: ['europe', 'nature'],
  },
  {
    id: 'europe-iceland',
    label: 'Iceland',
    file: '/covers/europe-iceland.jpg',
    tags: ['europe', 'nature'],
  },
  {
    id: 'america-nyc',
    label: 'New York',
    file: '/covers/america-nyc.jpg',
    tags: ['america', 'city'],
  },
  {
    id: 'america-grand-canyon',
    label: 'Grand Canyon',
    file: '/covers/america-grand-canyon.jpg',
    tags: ['america', 'nature'],
  },
  {
    id: 'america-patagonia',
    label: 'Patagonia',
    file: '/covers/america-patagonia.jpg',
    tags: ['america', 'mountain'],
  },
  {
    id: 'america-yosemite',
    label: 'Yosemite',
    file: '/covers/america-yosemite.jpg',
    tags: ['america', 'nature'],
  },
  {
    id: 'africa-safari',
    label: 'Safari',
    file: '/covers/africa-safari.jpg',
    tags: ['africa', 'wildlife'],
  },
  {
    id: 'africa-sahara',
    label: 'Sahara',
    file: '/covers/africa-sahara.jpg',
    tags: ['africa', 'desert'],
  },
  {
    id: 'africa-cape-town',
    label: 'Cape Town',
    file: '/covers/africa-cape-town.jpg',
    tags: ['africa', 'city'],
  },
  {
    id: 'oceania-tropical',
    label: 'Tropical island',
    file: '/covers/oceania-tropical.jpg',
    tags: ['oceania', 'beach'],
  },
  {
    id: 'australia-outback',
    label: 'Outback',
    file: '/covers/australia-outback.jpg',
    tags: ['oceania', 'desert'],
  },
  {
    id: 'trip-beach',
    label: 'Beach',
    file: '/covers/trip-beach.jpg',
    tags: ['beach', 'summer'],
  },
  {
    id: 'trip-bike-road',
    label: 'Road cycling',
    file: '/covers/trip-bike-road.jpg',
    tags: ['bike', 'sport'],
  },
  {
    id: 'trip-bike-trail',
    label: 'Mountain biking',
    file: '/covers/trip-bike-trail.jpg',
    tags: ['bike', 'sport'],
  },
  {
    id: 'trip-hiking',
    label: 'Hiking',
    file: '/covers/trip-hiking.jpg',
    tags: ['hiking', 'mountain'],
  },
  {
    id: 'trip-camping',
    label: 'Camping',
    file: '/covers/trip-camping.jpg',
    tags: ['camping', 'nature'],
  },
  {
    id: 'trip-roadtrip',
    label: 'Road trip',
    file: '/covers/trip-roadtrip.jpg',
    tags: ['roadtrip'],
  },
  {
    id: 'trip-ski',
    label: 'Skiing',
    file: '/covers/trip-ski.jpg',
    tags: ['ski', 'winter'],
  },
  {
    id: 'trip-desert',
    label: 'Desert',
    file: '/covers/trip-desert.jpg',
    tags: ['desert'],
  },
];
