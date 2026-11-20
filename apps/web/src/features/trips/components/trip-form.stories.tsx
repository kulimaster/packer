import type { Meta, StoryObj } from '@storybook/react-vite';
import { TripForm } from './trip-form';

const meta = {
  title: 'Features/TripForm',
  component: TripForm,
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
} satisfies Meta<typeof TripForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Úprava výletu – formulář je předplněný a bez nadpisu. */
export const Edit: Story = {
  args: {
    mode: 'edit',
    defaultValues: {
      title: 'Asia Vacation',
      destination: 'Tokyo & Kyoto, Japan',
      startDate: '2026-05-01',
      endDate: '2026-05-12',
    },
  },
};

export const Pending: Story = {
  args: { pending: true },
};

export const EditPending: Story = {
  args: {
    mode: 'edit',
    pending: true,
    defaultValues: { title: 'Asia Vacation' },
  },
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
