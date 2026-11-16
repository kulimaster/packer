import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  args: { children: 'Packed' },
  argTypes: {
    tone: {
      control: 'select',
      options: ['neutral', 'packed', 'essential', 'warning', 'info', 'success'],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = { args: { tone: 'neutral', children: '8 items' } };

export const Packed: Story = { args: { tone: 'packed' } };

export const Essential: Story = { args: { tone: 'essential', children: 'Essential' } };

export const Warning: Story = { args: { tone: 'warning', children: 'Fragile' } };

export const Info: Story = { args: { tone: 'info', children: '<100ml TSA' } };

export const Success: Story = { args: { tone: 'success', children: 'Ready to go' } };

export const AllTones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge tone="neutral">8 items</Badge>
      <Badge tone="packed">Packed</Badge>
      <Badge tone="essential">Essential</Badge>
      <Badge tone="warning">Fragile</Badge>
      <Badge tone="info">&lt;100ml TSA</Badge>
      <Badge tone="success">Ready to go</Badge>
    </div>
  ),
};
