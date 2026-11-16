import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './checkbox';

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  args: { 'aria-label': 'Passport' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

export const Disabled: Story = { args: { disabled: true } };

export const WithLabel: Story = {
  render: (args) => (
    <label className="flex cursor-pointer items-start gap-3">
      <Checkbox {...args} />
      <span className="space-y-0.5">
        <span className="block text-sm text-on-surface">Passport &amp; Boarding Pass</span>
        <span className="block text-xs text-on-surface-variant">Check validity &gt; 6 months</span>
      </span>
    </label>
  ),
};

export const PackedRow: Story = {
  render: () => (
    <label className="flex cursor-pointer items-start gap-3">
      <Checkbox defaultChecked aria-label="Eye mask" />
      <span className="space-y-0.5">
        <span className="block text-sm text-muted line-through">Eye Mask &amp; Earplugs</span>
        <span className="block text-xs text-muted">Sleeping kit mesh pouch front slip</span>
      </span>
    </label>
  ),
};
