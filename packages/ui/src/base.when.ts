import type { When } from './choosing.js';

/**
 * The CSS-only parts: classes in the base layer with no React component, used as they are from
 * any markup. They sit here, beside the package's source, because there is no component directory
 * for them to sit in.
 */
export const when = [
  {
    name: 'Layout',
    family: 'screens',
    job: 'set page width, section rhythm and the spacing between things',
    use: [
      'A page needs a centred width (`.container`) and the section rhythm (`.section`, with `-tight` and `-loose`).',
      'Children stack with a gap (`.stack`) or sit in a wrapping row (`.row`).',
      'A divider is truly needed (`.hr`) — reach for a bigger space step first.',
    ],
    not: [
      {
        when: 'the region needs a border and a title',
        use: 'Panel',
        because: 'a panel frames a region; layout classes only space it.',
      },
      {
        when: 'a pane beside the main area should be resizable',
        use: 'Split',
        because: 'a split carries the separator, its keyboard and its collapse.',
      },
      {
        when: 'the page is the one place that needs a saturated full-bleed field',
        use: 'SectionBand',
        because: 'the band is the one deep-ink section a page may have.',
      },
    ],
    neighbours: ['Panel', 'Split', 'SectionBand'],
    react: [],
    css: ['.container', '.section', '.stack', '.row', '.hr'],
    page: 'foundations/layout.html',
  },
  {
    name: 'SectionBand',
    family: 'screens',
    job: 'give one section of a page presence with a full-bleed field, or atmosphere on empty ground',
    use: [
      'A landing page\'s one moment of weight — a figure, a statement — in a flat deep-ink band, at most once a page.',
      'Empty ground behind a hero or a slide: `.bg-dot-grid` or `.bg-noise`.',
    ],
    not: [
      {
        when: 'you want a second band, a gradient, or a coloured box to make something stand out',
        use: 'Callout',
        because: 'the band is once a page and never a gradient; an aside in prose is a callout.',
      },
      {
        when: 'the section is an ordinary part of the page',
        use: 'Layout',
        because: '`.section` gives the rhythm; presence comes from space, not fills.',
      },
    ],
    neighbours: ['Layout', 'Slide'],
    react: [],
    css: ['.section-band', '.bg-dot-grid', '.bg-noise'],
    page: 'foundations/image.html',
  },
  {
    name: 'Slide',
    family: 'screens',
    job: 'build a 16:9 presentation slide whose type scales with the slide',
    use: [
      'A deck: title, list and divider slides sized in container units, so it reads the same in a grid or projected.',
      'Start from `templates/deck/` and keep its slide types.',
    ],
    not: [
      {
        when: 'the page is a marketing page someone scrolls',
        use: 'SectionBand',
        because: 'a landing page uses sections and its one band; slides are fixed frames.',
      },
      {
        when: 'the content is a document someone reads at length',
        use: 'Paper',
        because: 'a document belongs on a sheet at reading measure, not split across frames.',
      },
    ],
    neighbours: ['SectionBand', 'Paper'],
    react: [],
    css: ['.slide'],
    page: 'templates/deck/',
  },
  {
    name: 'Type',
    family: 'reading',
    job: 'set the voice of text — mono labels, an intro paragraph, secondary copy, figures',
    use: [
      '`.label` — the mono voice for section markers, figures and data labels. Never above a heading as an eyebrow.',
      '`.lede` for an intro paragraph, `.muted` for secondary copy (neutral-600, never neutral-500).',
      '`.num` for tabular figures that line up; `.mono` for technical identifiers.',
    ],
    not: [
      {
        when: 'you are naming a section',
        use: 'SectionHead',
        because: 'a section name is the loud part; `.label` is 11px mono and inverts the hierarchy.',
      },
      {
        when: 'you are naming the page',
        use: 'PageHead',
        because: 'the page title belongs in the page head band.',
      },
      {
        when: 'the small words report a status',
        use: 'Tag',
        because: 'a status is a tag with a tone that means something; a label is only a voice.',
      },
    ],
    neighbours: ['SectionHead', 'PageHead', 'Tag'],
    react: [],
    css: ['.label', '.lede', '.muted', '.num', '.mono'],
    page: 'foundations/type.html',
  },
] satisfies When[];
