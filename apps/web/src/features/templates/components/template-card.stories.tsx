import type { Meta, StoryObj } from '@storybook/react-vite';
import { TemplateCard, type TemplateCardData } from './template-card';

const carryOn: TemplateCardData = {
  id: 'template-1',
  name: 'Airplane Carry-on',
  description: 'Everything for a week in a single carry-on.',
  icon: 'plane',
  accent: 'mint',
  itemCount: 14,
  estimatedWeightGrams: 6420,
  categories: ['Documents', 'Electronics', 'Clothing', 'Toiletries'],
};

const meta = {
  title: 'Templates/TemplateCard',
  component: TemplateCard,
  args: {
    template: carryOn,
    onToggle: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="w-[min(24rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof TemplateCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: { selected: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

/** Bez `onToggle` je karta jen informativní – používá ji knihovna šablon. */
export const Library: Story = {
  args: { onToggle: undefined },
};

export const WithoutDescription: Story = {
  args: { template: { ...carryOn, description: undefined } },
};

export const WithoutCategories: Story = {
  args: { template: { ...carryOn, categories: [] } },
};

export const UnknownIconAndAccent: Story = {
  args: {
    template: { ...carryOn, icon: 'neexistuje', accent: 'neexistuje' },
  },
};

export const LongText: Story = {
  args: {
    template: {
      ...carryOn,
      name: 'Winter Trip for the Whole Family Including Kids',
      description:
        'Layers for freezing mornings, long walks in the snow and everything the kids will forget at home.',
      categories: [
        'Thermal clothing and everything that goes under it',
        'Health and pharmacy',
        'Accessories',
      ],
    },
  },
};
