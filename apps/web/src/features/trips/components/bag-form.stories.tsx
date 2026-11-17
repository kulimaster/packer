import type { Meta, StoryObj } from '@storybook/react-vite';
import { BagForm } from './bag-form';

const meta = {
  title: 'Trips/BagForm',
  component: BagForm,
  args: {
    onSubmit: () => undefined,
    onCancel: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="w-[min(32rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof BagForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {};

export const Edit: Story = {
  args: {
    mode: 'edit',
    defaultValues: { name: 'Peak Design 45L', kind: 'CarryOn', allowanceKg: '10' },
  },
};

export const Pending: Story = {
  args: { pending: true },
};

export const Error: Story = {
  args: { error: 'Bag could not be saved.' },
};

export const ServerFieldErrors: Story = {
  args: {
    fieldErrors: {
      name: ['Name is required.'],
      allowanceKg: ['Allowance must be between 0 and 100 kg.'],
    },
  },
};

export const LongText: Story = {
  args: {
    mode: 'edit',
    defaultValues: {
      name: 'Osprey Farpoint 40 – the one with the broken hip belt',
      kind: 'Checked',
      allowanceKg: '23',
    },
  },
};
