import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './card';

const meta = {
  title: 'UI/Card',
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: 'p-4',
    children: (
      <div className="space-y-1">
        <p className="font-semibold">Airplane Carry-on</p>
        <p className="text-sm text-on-surface-variant">5 / 8 packed · Under-seat daypack</p>
      </div>
    ),
  },
};

export const Padded: Story = {
  args: {
    className: 'p-6',
    children: <p className="text-sm">Karta s větším vnitřním odsazením.</p>,
  },
};

export const Interactive: Story = {
  args: {
    className:
      'cursor-pointer p-4 transition-shadow hover:shadow-float focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    tabIndex: 0,
    children: <p className="text-sm font-semibold">Klikatelná karta (hover mění stín)</p>,
  },
};
