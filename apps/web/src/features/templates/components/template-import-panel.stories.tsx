import type { Meta, StoryObj } from '@storybook/react-vite';
import type { TemplateCardData } from './template-card';
import { TemplateImportPanel } from './template-import-panel';

const templates: TemplateCardData[] = [
  {
    id: 'template-1',
    name: 'Airplane Carry-on',
    description: 'Everything for a week in a single carry-on.',
    icon: 'plane',
    accent: 'mint',
    itemCount: 14,
    estimatedWeightGrams: 6420,
    categories: ['Documents', 'Electronics', 'Clothing', 'Toiletries'],
  },
  {
    id: 'template-2',
    name: 'Tropical Weather',
    description: 'Light layers and sun protection for hot, humid destinations.',
    icon: 'umbrella',
    accent: 'amber',
    itemCount: 10,
    estimatedWeightGrams: 2065,
    categories: ['Clothing', 'Beach', 'Health'],
  },
  {
    id: 'template-3',
    name: 'Photography Gear',
    description: 'Camera, lenses and the small accessories you always forget.',
    icon: 'camera',
    accent: 'violet',
    itemCount: 8,
    estimatedWeightGrams: 3120,
    categories: ['Photography', 'Electronics'],
  },
];

const meta = {
  title: 'Templates/TemplateImportPanel',
  component: TemplateImportPanel,
  args: {
    templates,
    selectedIds: [],
    onToggle: () => undefined,
    onClose: () => undefined,
    onConfirm: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="w-[min(34rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof TemplateImportPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSelection: Story = {
  args: { selectedIds: ['template-1', 'template-3'] },
};

export const Pending: Story = {
  args: { selectedIds: ['template-1', 'template-3'], pending: true },
};

export const Error: Story = {
  args: {
    selectedIds: ['template-2'],
    error: 'The trip could not be updated. Try again.',
  },
};

export const Loading: Story = {
  args: { loading: true },
};

export const Empty: Story = {
  args: { templates: [] },
};

export const LongText: Story = {
  args: {
    templates: [
      {
        ...templates[0],
        name: 'Winter Trip for the Whole Family Including Kids',
        description:
          'Layers for freezing mornings, long walks in the snow and everything the kids will forget at home.',
        categories: ['Thermal clothing', 'Health and pharmacy', 'Accessories'],
      },
      ...templates.slice(1),
    ],
    selectedIds: ['template-1'],
  },
};
