import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Breadcrumbs',
    family: 'navigation',
    job: 'show where this page sits in a hierarchy, with a way back up',
    use: [
      'A page several levels down — a work item inside a project inside a client — where going up a level is common.',
      'The last crumb is the current page, rendered as text with `aria-current="page"`; separators are added for you.',
    ],
    not: [
      {
        when: 'you need the list of places someone can go',
        use: 'Sidebar',
        because: 'breadcrumbs show the path here, not the other places.',
      },
      {
        when: 'the path is a sequence of steps in a process',
        use: 'Stepper',
        because: 'a stepper shows position in a sequence; breadcrumbs show position in a hierarchy.',
      },
      {
        when: 'you are stepping through items of a set in place',
        use: 'PagerChip',
        because: 'the pager chip says "4 of 19" and moves to the next one without leaving.',
      },
    ],
    neighbours: ['Sidebar', 'Stepper', 'PageHead'],
    react: ['Breadcrumbs', 'Breadcrumb'],
    css: ['.breadcrumbs'],
    page: 'components/navigation.html',
  },
] satisfies When[];
