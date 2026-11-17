import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './select';

const options = (
  <>
    <option value="">No bag</option>
    <option value="carry-on">Peak Design 45L</option>
    <option value="checked">Check-in suitcase</option>
  </>
);

const meta = {
  title: 'UI/Select',
  component: Select,
  args: { children: options },
  decorators: [
    (Story) => (
      <div className="w-[min(22rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: { label: 'Bags', defaultValue: 'carry-on' },
};

export const WithHint: Story = {
  args: {
    label: 'Bag for this category',
    hint: 'Hmotnost kategorie se započítá do zvoleného bagu.',
  },
};

export const WithError: Story = {
  args: { label: 'Bag', error: 'Choose a bag first.' },
};

export const Disabled: Story = {
  args: { label: 'Bag', defaultValue: 'carry-on', disabled: true },
};
