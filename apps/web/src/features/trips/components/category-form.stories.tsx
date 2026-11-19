import type { Meta, StoryObj } from '@storybook/react-vite';
import { CategoryForm } from './category-form';

const meta = {
  title: 'Features/CategoryForm',
  component: CategoryForm,
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
} satisfies Meta<typeof CategoryForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Úprava existující kategorie – kompaktní formulář bez nadpisu. */
export const Edit: Story = {
  args: {
    mode: 'edit',
    defaultValues: { name: 'Documents', icon: 'briefcase', note: 'Front pocket' },
  },
};

export const Pending: Story = {
  args: { pending: true },
};

export const EditPending: Story = {
  args: {
    mode: 'edit',
    pending: true,
    defaultValues: { name: 'Documents', icon: 'briefcase' },
  },
};

export const Error: Story = {
  args: { mode: 'edit', error: 'Category could not be saved.' },
};

export const ServerFieldErrors: Story = {
  args: {
    fieldErrors: {
      name: ['Name is required.'],
      note: ['Use 200 characters or fewer.'],
    },
  },
};
