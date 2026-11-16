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
};

const meta = {
  title: 'Trips/TripCard',
  component: TripCard,
  args: { trip: asiaTrip },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
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
    },
  },
};

export const NotStarted: Story = {
  args: {
    trip: {
      ...asiaTrip,
      packed: 0,
      total: 40,
      status: 'not-started',
    },
  },
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
