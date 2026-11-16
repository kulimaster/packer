import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import { covers, coversByTag, coverTags, searchCovers, type Cover, type CoverTag } from '../covers';
import { CoverPicker } from './cover-picker';

const meta = {
  title: 'Trips/CoverPicker',
  component: CoverPicker,
  args: { covers, value: null, onSelect: () => {} },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CoverPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSelection: Story = {
  args: { value: 'asia-tokyo' },
};

export const Filtered: Story = {
  args: { covers: coversByTag('asia') },
  render: (args) => <CoverPicker {...args} value="asia-kyoto" onSelect={() => {}} />,
};

export const Empty: Story = {
  args: { covers: [] },
};

/** Ukázka zapojení: hledání + filtr tagem + výběr. */
function CoverPickerDemo() {
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<CoverTag | 'all'>('all');
  const [selected, setSelected] = useState<Cover | null>(null);

  const byTag = coversByTag(tag);
  const filtered = searchCovers(query).filter((cover) => byTag.includes(cover));

  return (
    <div className="space-y-4">
      <Input
        placeholder="Hledat destinaci nebo typ cesty…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        <Chip selected={tag === 'all'} onClick={() => setTag('all')}>
          All ({covers.length})
        </Chip>
        {(['asia', 'europe', 'america', 'beach', 'bike', 'hiking'] as CoverTag[]).map((value) => (
          <Chip key={value} selected={tag === value} onClick={() => setTag(value)}>
            {value}
          </Chip>
        ))}
      </div>

      <CoverPicker covers={filtered} value={selected?.id} onSelect={setSelected} />

      <p className="text-sm text-on-surface-variant">
        Vybráno: <span className="font-semibold text-on-surface">{selected?.label ?? '—'}</span>
        {selected ? ` (${selected.id})` : null}
      </p>
    </div>
  );
}

export const Interactive: Story = {
  args: { onSelect: () => {} },
  render: () => <CoverPickerDemo />,
  parameters: { controls: { disable: true } },
};

export const AllTags: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {coverTags.map((tag) => (
        <Chip key={tag} disabled>
          {tag}
        </Chip>
      ))}
    </div>
  ),
};
