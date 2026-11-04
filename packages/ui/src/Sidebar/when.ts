import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Sidebar',
    family: 'navigation',
    job: 'list every place in an app down the side, grouped, with the current one marked',
    use: [
      'An app with more places than fit in a header, in groups under mono headings (`SidebarGroup`).',
      'Groups that come from data use `SidebarSection`, which can fold its items away when the rail is long.',
      'A place that cannot hold anything yet stays a link, quieter, with why in its `title` — not disabled, not hidden.',
    ],
    not: [
      {
        when: 'the options are panels of one page',
        use: 'Tabs',
        because: 'tabs swap panels in place; a sidebar moves between pages.',
      },
      {
        when: 'the items are a nested hierarchy the reader opens and closes — folders, a taxonomy',
        use: 'Tree',
        because: 'a tree has the keyboard contract for expand and collapse at any depth; the rail is one level of places.',
      },
      {
        when: 'the column is a long list of records or documents, not places',
        use: 'Dock',
        because: 'a dock lets every name be read at the focus point in a narrow column; a sidebar truncates them.',
      },
      {
        when: 'the column is a document\'s own headings',
        use: 'Contents',
        because: 'contents tracks where you are in the document as you scroll.',
      },
    ],
    neighbours: ['Nav', 'Tabs', 'Tree', 'Dock', 'Contents'],
    react: ['Sidebar', 'SidebarGroup', 'SidebarSection', 'SidebarItem', 'SidebarCount'],
    css: ['.sidebar'],
    page: 'components/navigation.html',
  },
] satisfies When[];
