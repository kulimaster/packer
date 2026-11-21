import type { Meta, StoryObj } from '@storybook/react-vite';
import { PasswordForm } from './password-form';

const meta = {
  title: 'Features/PasswordForm',
  component: PasswordForm,
  decorators: [
    (Story) => (
      <div className="w-[min(32rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: 'centered' },
  args: {
    onSubmit: () => Promise.resolve(),
  },
} satisfies Meta<typeof PasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pending: Story = {
  args: { pending: true },
};

export const Error: Story = {
  args: { error: 'Password could not be changed.' },
};

export const Saved: Story = {
  args: { status: 'Password changed.' },
};

export const ServerFieldErrors: Story = {
  args: {
    fieldErrors: {
      currentPassword: ['Password is incorrect.'],
      newPassword: ['Use at least 10 characters.'],
    },
  },
};
