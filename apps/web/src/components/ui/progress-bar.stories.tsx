import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from './progress-bar';

const meta = {
  title: 'UI/ProgressBar',
  component: ProgressBar,
  args: { value: 18, max: 40 },
  parameters: { layout: 'padded' },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 40 } },
    size: { control: 'select', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: { label: '18 / 40 packed', showValue: true },
};

export const Complete: Story = {
  args: { value: 40, label: 'All packed', showValue: true },
};

export const Empty: Story = {
  args: { value: 0, label: 'Not started', showValue: true },
};

export const Small: Story = {
  args: { size: 'sm', label: '5 / 8 packed' },
};
