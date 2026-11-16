import type { Meta, StoryObj } from '@storybook/react-vite';
import { Search } from 'lucide-react';
import { Input } from './input';

const meta = {
  title: 'UI/Input',
  component: Input,
  args: { placeholder: 'Search templates…' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: { label: 'Trip name', placeholder: 'Asia Vacation' },
};

export const WithHint: Story = {
  args: {
    label: 'Destination',
    placeholder: 'Tokyo & Kyoto, Japan',
    hint: 'Použije se pro počasí a tipy na místě.',
  },
};

export const WithIcon: Story = {
  args: { icon: <Search className="size-4" />, placeholder: 'Search trips, gear…' },
};

export const WithError: Story = {
  args: { label: 'Trip name', defaultValue: ' ', error: 'Název nesmí být prázdný.' },
};

export const Disabled: Story = {
  args: { label: 'Destination', defaultValue: 'Tokyo & Kyoto', disabled: true },
};
