import type { Meta, StoryObj } from '@storybook/react-vite';
import { CategoryCard, type PackingCategory } from './category-card';

const carryOn: PackingCategory = {
  id: '1',
  name: 'Airplane Carry-on',
  icon: 'plane',
  note: 'Under-seat daypack',
  packed: 1,
  total: 3,
  estimatedWeightGrams: 1420,
  items: [
    {
      id: '1',
      title: 'Passport',
      quantity: 1,
      isEssential: true,
      flags: 'None',
      isPacked: true,
      estimatedWeightGrams: 0,
    },
    {
      id: '2',
      title: 'Power bank',
      quantity: 1,
      isEssential: false,
      flags: 'Battery, CarryOnOnly',
      isPacked: false,
      weightGrams: 240,
      estimatedWeightGrams: 240,
    },
    {
      id: '3',
      title: 'Merino socks',
      quantity: 3,
      isEssential: false,
      flags: 'None',
      isPacked: false,
      weightGrams: 320,
      estimatedWeightGrams: 1180,
      note: 'Two pairs is usually enough',
    },
  ],
};

const meta = {
  title: 'Trips/CategoryCard',
  component: CategoryCard,
  args: {
    category: carryOn,
    bags: [
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
        estimatedWeightGrams: 0,
      },
    ],
    onAssignBag: () => undefined,
    onStartAdding: () => undefined,
    onCancelAdding: () => undefined,
    onAddItem: () => undefined,
    onUpdateItem: () => Promise.resolve(),
    onToggleItem: () => undefined,
    onDeleteItem: () => undefined,
    onUpdateCategory: () => Promise.resolve(),
    onDeleteCategory: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="w-[min(42rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof CategoryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AssignedToBag: Story = {
  args: {
    category: { ...carryOn, bagId: 'bag-1' },
  },
};

export const BagAssignPending: Story = {
  args: {
    category: { ...carryOn, bagId: 'bag-1' },
    bagAssignPending: true,
  },
};

export const NoBags: Story = {
  args: { bags: [], onAssignBag: undefined },
};

export const ReadOnly: Story = {
  args: { readOnly: true, category: { ...carryOn, bagId: 'bag-1' } },
};

export const Empty: Story = {
  args: {
    category: { ...carryOn, packed: 0, total: 0, estimatedWeightGrams: 0, items: [] },
  },
};

export const Adding: Story = {
  args: { adding: true },
};

export const AddingPending: Story = {
  args: { adding: true, addingPending: true },
};

export const AddingError: Story = {
  args: {
    adding: true,
    addError: 'Item could not be saved.',
    addFieldErrors: { title: ['Title is required.'] },
  },
};

export const PendingItem: Story = {
  args: { pendingItemId: '2' },
};

/** Klikni na tužku u řádku – formulář úpravy se otevře místo řádku. */
export const EditingItem: Story = {
  args: {
    category: { ...carryOn, items: [{ ...carryOn.items[1]!, note: 'Charged to 100 %' }] },
  },
};

export const UpdatingItemError: Story = {
  args: {
    updateItemError: 'Item could not be saved.',
    updateItemFieldErrors: { quantity: ['At most 999.'] },
  },
};

export const UnknownIcon: Story = {
  args: {
    category: { ...carryOn, icon: 'ikona-ktera-neexistuje' },
  },
};

export const LongText: Story = {
  args: {
    category: {
      ...carryOn,
      name: 'Electronics, chargers and everything with a lithium battery',
      note: 'Everything in this section must stay in the cabin – checked luggage gets scanned.',
    },
  },
};
