import type { Meta, StoryObj } from '@storybook/react-vite';
import { TemplateForm } from './template-form';

const meta = {
  title: 'Features/TemplateForm',
  component: TemplateForm,
  args: {
    onSubmit: () => undefined,
    onCancel: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="w-[min(36rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof TemplateForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Úprava existující šablony – kompaktní varianta bez nadpisu. */
export const Edit: Story = {
  args: {
    mode: 'edit',
    defaultValues: { name: 'Airplane Carry-on', description: 'Co mám v příručním zavazadle' },
  },
};

export const Pending: Story = {
  args: { pending: true },
};

export const EditPending: Story = {
  args: {
    mode: 'edit',
    pending: true,
    defaultValues: { name: 'Airplane Carry-on' },
  },
};

export const Error: Story = {
  args: { mode: 'edit', error: 'Template could not be saved.' },
};

export const ServerFieldErrors: Story = {
  args: {
    fieldErrors: {
      name: ['Name is required.'],
      description: ['Use 160 characters or fewer.'],
    },
  },
};

/** Dlouhé hodnoty – ověří, že se input a popis nerozjedou. */
export const LongText: Story = {
  args: {
    defaultValues: {
      name: 'Opravdu dlouhý název šablony na pracovní cestu s notebookem',
      description:
        'Podrobný popis, který se skoro nevejde do limitu, aby bylo vidět, jak se text láme v inputu.',
    },
  },
};
