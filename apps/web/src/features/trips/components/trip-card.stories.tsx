import type { Meta, StoryObj } from '@storybook/react-vite';
import { TripCard, type TripSummary } from './trip-card';

const asiaTrip: TripSummary = {
  id: '1',
  title: 'Asia Vacation',
  destination: 'Tokyo & Kyoto, Japan',
  dateRange: 'Nov 20 – Dec 5',
  packed: 18,
  total: 40,
  status: 'in-progress',
  coverId: 'asia-kyoto',
};

const meta = {
  title: 'Trips/TripCard',
  component: TripCard,
  // Karta je navržená na šířku sloupce – v canvasu ji držíme na max-w-md.
  args: { trip: asiaTrip, className: 'max-w-md' },
  argTypes: {
    ctaVariant: { control: 'select', options: ['soft', 'primary'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TripCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {};

export const ReadyToGo: Story = {
  args: {
    trip: {
      ...asiaTrip,
      title: 'Weekend Roadtrip',
      destination: 'Big Sur Coastal Drive',
      dateRange: 'Oct 12 – Oct 14',
      packed: 24,
      total: 24,
      status: 'ready',
      coverId: 'trip-roadtrip',
    },
  },
};

export const NotStarted: Story = {
  args: {
    trip: {
      ...asiaTrip,
      title: 'Bike Trip',
      destination: 'Alps, Italy',
      dateRange: 'May 4 – May 11',
      packed: 0,
      total: 32,
      status: 'not-started',
      coverId: 'trip-bike-trail',
    },
  },
};

/** Trip bez fotky – zůstane gradient, karta nesmí vypadat rozbitá. */
export const WithoutCover: Story = {
  args: {
    trip: { ...asiaTrip, coverId: undefined, imageUrl: undefined },
  },
};

/** Neznámé id (např. fotka byla z registru odebrána) se chová jako žádná fotka. */
export const UnknownCover: Story = {
  args: {
    trip: { ...asiaTrip, coverId: 'destinace-ktera-neexistuje' },
  },
};

/** Světle mint varianta z původního mocku – na porovnání. */
export const SoftAction: Story = {
  args: { ctaVariant: 'soft' },
};

export const LongText: Story = {
  args: {
    trip: {
      ...asiaTrip,
      title: 'Three Weeks Through Japan, South Korea and Taiwan',
      destination: 'Tokyo & Kyoto, Japan; Seoul; Taipei',
      dateRange: 'Nov 20, 2026 – Dec 11, 2026',
    },
  },
};

/** Přehled výletů tak, jak se skládá v mřížce. */
export const Grid: Story = {
  render: () => (
    <div className="grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <TripCard trip={asiaTrip} />
      <TripCard
        trip={{
          id: '2',
          title: 'Weekend Roadtrip',
          destination: 'Big Sur, California',
          dateRange: 'Oct 12 – Oct 14',
          packed: 24,
          total: 24,
          status: 'ready',
          coverId: 'trip-roadtrip',
        }}
      />
      <TripCard
        trip={{
          id: '3',
          title: 'Greek Islands',
          destination: 'Santorini & Ios',
          dateRange: 'Jun 8 – Jun 18',
          packed: 3,
          total: 28,
          status: 'in-progress',
          coverId: 'europe-santorini',
        }}
      />
    </div>
  ),
};
