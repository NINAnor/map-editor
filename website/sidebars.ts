import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: 'Setup',
      link: { type: 'doc', id: 'setup/setup' },
      items: ['setup/development', 'setup/docker', 'setup/configuration-files'],
    },
    {
      type: 'category',
      label: 'Features',
      link: { type: 'doc', id: 'features/features' },
      items: [
        'features/map-viewer',
        'features/layer-management',
        'features/legends',
        'features/geocoding',
        'features/basemaps',
        'features/internationalization',
      ],
    },
    {
      type: 'category',
      label: 'Configuration Reference',
      link: { type: 'doc', id: 'configuration/configuration' },
      items: [
        'configuration/map-config',
        'configuration/layer-types',
        'configuration/legend-types',
        'configuration/schema-validation',
      ],
    },
    {
      type: 'category',
      label: 'Editor Guide',
      link: { type: 'doc', id: 'editor/editor' },
      items: ['editor/managing-layers', 'editor/managing-folders', 'editor/styling-layers', 'editor/map-settings'],
    },
  ],
};

export default sidebars;
