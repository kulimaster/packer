import type { Meta, StoryObj } from '@storybook/react-vite';
import { BagCard, type PackingBag } from './bag-card';

const carryOn: PackingBag = {
  id: 'bag-1',
  name: 'Peak Design 45L',
  kind: 'CarryOn',
  allowanceKg: 10,
  estimatedWeightGrams: 4200,
};

const meta = {
  title: 'Trips/BagCard',
  component: BagCard,
  args: {
    bag: carryOn,
    categoryNames: ['Documents', 'Electronics'],
    onStartEditing: () => undefined,
    onCancelEditing: () => undefined,
    onSubmit: () => undefined,
    onDelete: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="w-[min(22rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof BagCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoAllowance: Story = {
  args: { bag: { ...carryOn, allowanceKg: undefined, kind: 'Personal' } },
};

export const Empty: Story = {
  args: {
    bag: { ...carryOn, estimatedWeightGrams: 0 },
    categoryNames: [],
  },
};

export const OverLimit: Story = {
  args: { bag: { ...carryOn, estimatedWeightGrams: 11_400 } },
};

export const AtLimit: Story = {
  args: { bag: { ...carryOn, estimatedWeightGrams: 10_000 } },
};

export const Editing: Story = {
  args: { editing: true },
};

export const EditingPending: Story = {
  args: { editing: true, updatePending: true },
};

export const EditingError: Story = {
  args: {
    editing: true,
    updateError: 'Bag could not be saved.',
    updateFieldErrors: { name: ['Name is required.'] },
  },
};

export const Deleting: Story = {
  args: { deleting: true },
};

export const LongText: Story = {
  args: {
    bag: {
      ...carryOn,
      name: 'Osprey Farpoint 40 – the one with the broken hip belt',
      kind: 'Checked',
      allowanceKg: 23,
    },
    categoryNames: [
      'Documents and travel papers',
      'Electronics, chargers and everything with a lithium battery',
      'Clothing',
    ],
  },
};
