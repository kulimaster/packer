import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProfileForm } from './profile-form';

const meta = {
  title: 'Features/ProfileForm',
  component: ProfileForm,
  decorators: [
    (Story) => (
      <div className="w-[min(32rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: 'centered' },
  args: {
    email: 'martin@example.com',
    defaultValues: { displayName: 'Martin' },
    onSubmit: () => Promise.resolve(),
  },
} satisfies Meta<typeof ProfileForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pending: Story = {
  args: { pending: true },
};

export const Error: Story = {
  args: { error: 'Profile could not be saved.' },
};

export const Saved: Story = {
  args: { status: 'Saved.' },
};

export const ServerFieldErrors: Story = {
  args: {
    fieldErrors: {
      displayName: ['Display name is required.'],
    },
  },
};

/** Dlouhé jméno – ověří, že se input nerozjede. */
export const LongName: Story = {
  args: {
    defaultValues: {
      displayName: 'Martin Kulich s opravdu velmi dlouhým jménem, které se nevejde do běžné karty',
    },
  },
};
