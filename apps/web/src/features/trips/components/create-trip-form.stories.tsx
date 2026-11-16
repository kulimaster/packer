import type { Meta, StoryObj } from '@storybook/react-vite';
import { CreateTripForm } from './create-trip-form';

const meta = {
  title: 'Features/CreateTripForm',
  component: CreateTripForm,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-[min(36rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  args: {
    onSubmit: () => undefined,
    onCancel: () => undefined,
  },
} satisfies Meta<typeof CreateTripForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pending: Story = {
  args: { pending: true },
};

export const Error: Story = {
  args: { error: 'You already have a trip with this name.' },
};

export const ServerFieldErrors: Story = {
  args: {
    fieldErrors: {
      title: ['Title is required.'],
      endDate: ['End date must not be before start date.'],
    },
  },
};
