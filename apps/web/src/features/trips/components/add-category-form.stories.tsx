import type { Meta, StoryObj } from '@storybook/react-vite';
import { AddCategoryForm } from './add-category-form';

const meta = {
  title: 'Features/AddCategoryForm',
  component: AddCategoryForm,
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
} satisfies Meta<typeof AddCategoryForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pending: Story = {
  args: { pending: true },
};

export const Error: Story = {
  args: { error: 'Category could not be created.' },
};

export const ServerFieldErrors: Story = {
  args: {
    fieldErrors: {
      name: ['Name is required.'],
      note: ['Use 200 characters or fewer.'],
    },
  },
};
