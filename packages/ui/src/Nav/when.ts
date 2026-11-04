import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Nav',
    family: 'navigation',
    job: 'put the product\'s name and its top-level places across the top of every page',
    use: [
      'The header bar of an app or a site: the brand on the left, a few top-level places, account controls at the end.',
      'The current place is marked with `aria-current="page"` (`NavItem current`), never a class.',
    ],
    not: [
      {
        when: 'there are more places than fit across the top, or they fall into groups',
        use: 'Sidebar',
        because: 'a rail holds a long, grouped list of places down the side.',
      },
      {
        when: 'the options swap panels inside one page',
        use: 'Tabs',
        because: 'tabs are panels in one place; nav items are places with their own URLs.',
      },
      {
        when: 'the reader needs to see where this page sits in a hierarchy',
        use: 'Breadcrumbs',
        because: 'breadcrumbs show the path to here; the nav shows where you can go.',
      },
      {
        when: 'the header has to collapse on a phone',
        use: 'Hamburger',
        because: 'the hamburger is the button that opens the links in a drawer on a narrow screen.',
      },
    ],
    neighbours: ['Sidebar', 'Tabs', 'Breadcrumbs', 'Hamburger'],
    react: ['Nav', 'NavBrand', 'NavLinks', 'NavItem'],
    css: ['.nav'],
    page: 'components/navigation.html',
  },
] satisfies When[];
