import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus } from 'lucide-react';
import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  args: { children: 'Continue packing' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'soft', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = { args: { variant: 'secondary' } };

export const Ghost: Story = { args: { variant: 'ghost' } };

export const Danger: Story = { args: { variant: 'danger', children: 'Delete trip' } };

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Plus className="size-4" aria-hidden />
        New Trip
      </>
    ),
  },
};

export const Loading: Story = { args: { isLoading: true, children: 'Saving…' } };

export const Disabled: Story = { args: { disabled: true } };

export const FullWidth: Story = {
  args: { fullWidth: true },
  parameters: { layout: 'padded' },
};
