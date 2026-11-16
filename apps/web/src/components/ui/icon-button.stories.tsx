import type { Meta, StoryObj } from '@storybook/react-vite';
import { Share2, Trash2, X } from 'lucide-react';
import { IconButton } from './icon-button';

const meta = {
  title: 'UI/IconButton',
  component: IconButton,
  args: {
    'aria-label': 'Close',
    children: <X className="size-5" aria-hidden />,
  },
  argTypes: {
    variant: { control: 'select', options: ['ghost', 'outline', 'solid'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ghost: Story = {};

export const Outline: Story = {
  args: {
    variant: 'outline',
    'aria-label': 'Share trip',
    children: <Share2 className="size-5" aria-hidden />,
  },
};

export const Solid: Story = { args: { variant: 'solid' } };

export const Small: Story = { args: { size: 'sm' } };

export const Large: Story = { args: { size: 'lg' } };

export const Disabled: Story = {
  args: {
    disabled: true,
    'aria-label': 'Delete',
    children: <Trash2 className="size-5" aria-hidden />,
  },
};
