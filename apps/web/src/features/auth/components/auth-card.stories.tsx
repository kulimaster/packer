import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { AuthCard, type AuthMode } from './auth-card';

const meta = {
  title: 'Features/AuthCard',
  component: AuthCard,
  parameters: { layout: 'centered' },
  args: {
    mode: 'login',
    onSubmit: () => undefined,
    onModeChange: () => undefined,
  },
} satisfies Meta<typeof AuthCard>;

export default meta;
type Story = StoryObj<typeof meta>;

function Interactive({ initialMode }: { initialMode: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  return <AuthCard mode={mode} onModeChange={setMode} onSubmit={() => undefined} />;
}

export const Login: Story = {
  render: () => <Interactive initialMode="login" />,
};

export const Register: Story = {
  render: () => <Interactive initialMode="register" />,
};

export const Pending: Story = {
  args: { pending: true },
};

export const InvalidCredentials: Story = {
  args: { error: 'Email or password is incorrect.' },
};

export const ServerFieldErrors: Story = {
  args: {
    fieldErrors: {
      email: ['Email is already taken.'],
      password: ['Password is too short.'],
    },
  },
};
