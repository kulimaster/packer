import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chip } from './chip';

const meta = {
  title: 'UI/Chip',
  component: Chip,
  args: { children: 'All (40)' },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unselected: Story = {};

export const Selected: Story = { args: { selected: true } };

export const Disabled: Story = { args: { disabled: true } };

export const FilterRow: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Chip selected>All (40)</Chip>
      <Chip>To pack (22)</Chip>
      <Chip>Packed (18)</Chip>
      <Chip>Essentials (6)</Chip>
    </div>
  ),
};
