import type { Meta, StoryObj } from '@storybook/react-vite';
import { ItemRow, type PackingItem } from './item-row';

const passport: PackingItem = {
  id: '1',
  title: 'Passport',
  quantity: 1,
  isEssential: true,
  flags: 'None',
  isPacked: false,
  estimatedWeightGrams: 0,
};

const meta = {
  title: 'Trips/ItemRow',
  component: ItemRow,
  decorators: [
    (Story) => (
      <ul className="w-[min(40rem,calc(100vw-2rem))] rounded-card border border-outline bg-card">
        <Story />
      </ul>
    ),
  ],
  args: {
    item: passport,
    onTogglePacked: () => undefined,
    onDelete: () => undefined,
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ItemRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Packed: Story = {
  args: { item: { ...passport, isPacked: true } },
};

export const WithNote: Story = {
  args: {
    item: { ...passport, note: 'Check validity > 6 months' },
  },
};

export const QuantityAndWeight: Story = {
  args: {
    item: {
      ...passport,
      title: 'Merino socks',
      quantity: 3,
      isEssential: false,
      weightGrams: 320,
      estimatedWeightGrams: 960,
    },
  },
};

export const WithTraits: Story = {
  args: {
    item: {
      ...passport,
      title: 'Power bank',
      isEssential: false,
      flags: 'Battery, CarryOnOnly',
      weightGrams: 240,
      estimatedWeightGrams: 240,
    },
  },
};

export const Pending: Story = {
  args: { pending: true },
};

export const LongText: Story = {
  args: {
    item: {
      ...passport,
      title: 'Universal travel adapter with USB-C and USB-A ports',
      note: 'Works in Japan, South Korea and Taiwan – check the plug type before leaving.',
    },
  },
};

/** Bez akcí – jen ke čtení (např. v přehledu šablony). */
export const ReadOnly: Story = {
  args: { onTogglePacked: undefined, onDelete: undefined },
};
