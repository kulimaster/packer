import type { Meta, StoryObj } from '@storybook/react-vite';
import { AddItemForm } from './add-item-form';

const meta = {
  title: 'Features/AddItemForm',
  component: AddItemForm,
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
} satisfies Meta<typeof AddItemForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pending: Story = {
  args: { pending: true },
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
