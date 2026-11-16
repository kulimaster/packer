import type { Preview } from '@storybook/react-vite';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        surface: { name: 'surface', value: '#f8f9fa' },
        card: { name: 'card', value: '#ffffff' },
      },
    },
    a11y: {
      // 'todo' = porušení se zobrazí v UI, neblokují běh
      test: 'todo',
    },
  },
  initialGlobals: {
    backgrounds: { value: 'surface' },
  },
};

export default preview;
