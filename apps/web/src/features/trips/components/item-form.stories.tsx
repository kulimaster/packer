import type { Meta, StoryObj } from '@storybook/react-vite';
import { ItemForm } from './item-form';

const meta = {
  title: 'Features/ItemForm',
  component: ItemForm,
  args: {
    onSubmit: () => undefined,
    onCancel: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="w-[min(34rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ItemForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Úprava existující položky – formulář je předplněný a tlačítko říká „Uložit“. */
export const Edit: Story = {
  args: {
    mode: 'edit',
    defaultValues: {
      title: 'Passport',
      quantity: 2,
      weightGrams: '30',
      isEssential: true,
      note: 'Druhý pas kvůli vízům',
      flags: { carryOnOnly: true, fragile: false, tsaLiquid: false, battery: false },
    },
  },
};

/** Všechny vlastnosti zaškrtnuté – ověří, že se řada checkboxů vejde i na malý displej. */
export const AllTraits: Story = {
  args: {
    mode: 'edit',
    defaultValues: {
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
      title: 'Camera lens',
      note:
        'Vždycky ji beru v příručním zavazadle, protože do odbaveného bych ji nedal. ' +
        'Ještě před odletem zkontrolovat, že krytky drží a že je ve futrálu i látka na čištění.',
      weightGrams: '640',
      flags: { carryOnOnly: true, fragile: true, tsaLiquid: false, battery: false },
    },
  },
};

export const Pending: Story = {
  args: { pending: true },
};

export const EditPending: Story = {
  args: {
    mode: 'edit',
    pending: true,
    defaultValues: { title: 'Passport', quantity: 2, weightGrams: '30' },
  },
};

export const Error: Story = {
  args: { error: 'Item could not be saved.' },
};

export const ServerFieldErrors: Story = {
  args: {
    fieldErrors: {
      title: ['Title is required.'],
      quantity: ['Quantity must be between 1 and 999.'],
    },
  },
};
