import type { Meta, StoryObj } from '@storybook/react-vite';
import type { PackingBag } from './bag-card';
import { BagsPanel } from './bags-panel';

const bags: PackingBag[] = [
  {
    id: 'bag-1',
    name: 'Peak Design 45L',
    kind: 'CarryOn',
    allowanceKg: 10,
    estimatedWeightGrams: 4200,
  },
  {
    id: 'bag-2',
    name: 'Check-in suitcase',
    kind: 'Checked',
    allowanceKg: 23,
    estimatedWeightGrams: 12_400,
  },
];

const categories = [
  { id: 'cat-1', name: 'Documents', bagId: 'bag-1' },
  { id: 'cat-2', name: 'Electronics', bagId: 'bag-1' },
  { id: 'cat-3', name: 'Clothing', bagId: 'bag-2' },
];

const meta = {
  title: 'Trips/BagsPanel',
  component: BagsPanel,
  args: {
    bags,
    categories,
    totalWeightGrams: 16_600,
    creating: false,
    onStartCreating: () => undefined,
    onCancelCreating: () => undefined,
    onCreate: () => undefined,
    editingBagId: null,
    onStartEditing: () => undefined,
    onCancelEditing: () => undefined,
    onUpdate: () => undefined,
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
} satisfies Meta<typeof BagsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { bags: [], totalWeightGrams: 0 },
};

export const Creating: Story = {
  args: { creating: true },
};

export const CreatingPending: Story = {
  args: { creating: true, createPending: true },
};

export const CreatingError: Story = {
  args: {
    creating: true,
    createError: 'Bag could not be saved.',
    createFieldErrors: { name: ['Name is required.'] },
  },
};

export const Editing: Story = {
  args: { editingBagId: 'bag-1' },
};

export const EditingPending: Story = {
  args: { editingBagId: 'bag-1', updatePending: true },
};

export const EditingError: Story = {
  args: {
    editingBagId: 'bag-1',
    updateError: 'Bag could not be saved.',
    updateFieldErrors: { allowanceKg: ['Allowance must be between 0 and 100 kg.'] },
  },
};

export const Deleting: Story = {
  args: { deletingBagId: 'bag-2' },
};

export const ReadOnly: Story = {
  args: { readOnly: true },
};

export const ReadOnlyEmpty: Story = {
  args: { readOnly: true, bags: [], totalWeightGrams: 0 },
};

export const LongText: Story = {
  args: {
    bags: [
      {
        ...bags[0],
        name: 'Osprey Farpoint 40 – the one with the broken hip belt',
      },
      ...bags.slice(1),
    ],
    categories: [
      { id: 'cat-1', name: 'Documents and travel papers', bagId: 'bag-1' },
      {
        id: 'cat-2',
        name: 'Electronics, chargers and everything with a lithium battery',
        bagId: 'bag-1',
      },
      { id: 'cat-3', name: 'Clothing', bagId: 'bag-2' },
    ],
  },
};
