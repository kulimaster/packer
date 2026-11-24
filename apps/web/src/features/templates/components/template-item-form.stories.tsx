import type { Meta, StoryObj } from '@storybook/react-vite';
import { TemplateItemForm } from './template-item-form';

const meta = {
  title: 'Features/TemplateItemForm',
  component: TemplateItemForm,
  args: {
    onSubmit: () => undefined,
    onCancel: () => undefined,
    categories: ['Documents', 'Electronics', 'Clothing'],
  },
  decorators: [
    (Story) => (
      <div className="w-[min(34rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof TemplateItemForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Úprava položky šablony – formulář je předplněný a tlačítko říká „Uložit“. */
export const Edit: Story = {
  args: {
    mode: 'edit',
    defaultValues: {
      categoryName: 'Documents',
      title: 'Passport',
      quantity: 2,
      weightGrams: '30',
      isEssential: true,
      note: 'Druhý pas kvůli vízům',
      flags: { carryOnOnly: true, fragile: false, tsaLiquid: false, battery: false },
    },
  },
};

/** Všechny vlastnosti zaškrtnuté – řada checkboxů se musí vejít i na malý displej. */
export const AllTraits: Story = {
  args: {
    mode: 'edit',
    defaultValues: {
      categoryName: 'Electronics',
      title: 'Power bank',
      quantity: 1,
      weightGrams: '240',
      note: 'Nabít před odletem',
      flags: { carryOnOnly: true, fragile: false, tsaLiquid: true, battery: true },
    },
  },
};

/** Dlouhá poznámka na limitu 300 znaků – pole se nesmí rozbít. */
export const LongNote: Story = {
  args: {
    mode: 'edit',
    defaultValues: {
      categoryName: 'Electronics',
      title: 'Camera lens',
      note:
        'Vždycky ji beru v příručním zavazadle, protože do odbaveného bych ji nedal. ' +
        'Ještě před odletem zkontrolovat, že krytky drží a že je ve futrálu i látka na čištění.',
      weightGrams: '640',
      flags: { carryOnOnly: true, fragile: true, tsaLiquid: false, battery: false },
    },
  },
};

/** Šablona zatím žádné kategorie nemá – datalist s nápovědou se nevykreslí. */
export const WithoutCategories: Story = {
  args: { categories: [] },
};

export const Pending: Story = {
  args: { pending: true },
};

export const EditPending: Story = {
  args: {
    mode: 'edit',
    pending: true,
    defaultValues: { categoryName: 'Documents', title: 'Passport', quantity: 2, weightGrams: '30' },
  },
};

export const Error: Story = {
  args: { error: 'Item could not be saved.' },
};

export const ServerFieldErrors: Story = {
  args: {
    fieldErrors: {
      categoryName: ['Category is required.'],
      title: ['Title is required.'],
      quantity: ['Quantity must be between 1 and 999.'],
    },
  },
};
