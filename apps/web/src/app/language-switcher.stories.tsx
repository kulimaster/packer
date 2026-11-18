import type { Meta, StoryObj } from '@storybook/react-vite';
import { I18nProvider } from '@/lib/i18n';
import { LanguageSwitcher } from './language-switcher';

const meta = {
  title: 'App/LanguageSwitcher',
  component: LanguageSwitcher,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof LanguageSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Výchozí čeština – tlačítko nabízí přepnutí do angličtiny. */
export const Czech: Story = {
  decorators: [
    (Story) => (
      <I18nProvider initialLanguage="cs">
        <Story />
      </I18nProvider>
    ),
  ],
};

/** Anglické UI – tlačítko nabízí návrat do češtiny. */
export const English: Story = {
  decorators: [
    (Story) => (
      <I18nProvider initialLanguage="en">
        <Story />
      </I18nProvider>
    ),
  ],
};

/** V úzkém sidebaru se přepínač musí vejít pod navigaci. */
export const Sidebar: Story = {
  decorators: [
    (Story) => (
      <I18nProvider initialLanguage="cs">
        <div className="w-56 rounded-card border border-outline bg-card p-4">
          <Story />
        </div>
      </I18nProvider>
    ),
  ],
};
