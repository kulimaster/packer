import type { Meta, StoryObj } from '@storybook/react-vite';
import { ItemForm } from './item-form';

const meta = {
  title: 'Features/ItemForm',
  component: ItemForm,
  args: {
    onSubmit: () => undefined,
    onCancel: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="w-[min(34rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ItemForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Úprava existující položky – formulář je předplněný a tlačítko říká „Uložit“. */
export const Edit: Story = {
  args: {
    mode: 'edit',
    defaultValues: { title: 'Passport', quantity: 2, weightGrams: '30', isEssential: true },
  },
};

export const Pending: Story = {
  args: { pending: true },
};

export const EditPending: Story = {
  args: {
    mode: 'edit',
    pending: true,
    defaultValues: { title: 'Passport', quantity: 2, weightGrams: '30' },
  },
};

export const Error: Story = {
  args: { error: 'Item could not be saved.' },
};

export const ServerFieldErrors: Story = {
  args: {
    fieldErrors: {
      title: ['Title is required.'],
      quantity: ['Quantity must be between 1 and 999.'],
    },
  },
};
