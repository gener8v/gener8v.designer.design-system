import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Spinner',
    family: 'status-and-feedback',
    job: 'show that a short wait is under way, where its result will appear',
    use: [
      'A brief wait inside a control or a small region — a button submitting, a panel refreshing.',
      'Decorative by default: the surrounding region carries `aria-busy`; pass `label` only when it stands alone.',
      'It is the indeterminate ring of the progress family at 16, 24 and 32px — the same track, arc colour and stroke as `ProgressRing`.',
    ],
    not: [
      {
        when: 'the shape of the content that is loading is known',
        use: 'Skeleton',
        because: 'a skeleton holds the layout so nothing jumps when the content lands.',
      },
      {
        when: 'the work has a known amount done and to do',
        use: 'Progress',
        because: 'a progress bar says how far along it is; a spinner only says "busy".',
      },
      {
        when: 'an agent or a run is working on something the reader is watching',
        use: 'Live',
        because: 'live work is drawn where the work is, with a word beside the pulse.',
      },
      {
        when: 'a circular indicator with a known amount done',
        use: 'Progress',
        because: '`ProgressRing` is the same ring with a value; the spinner is that ring when nothing can be measured.',
      },
      {
        when: 'a button is submitting',
        use: 'Button',
        because: 'the button has its own loading state (`.is-loading`) and keeps its label and width.',
      },
    ],
    neighbours: ['Skeleton', 'Progress', 'Live', 'Button'],
    react: ['Spinner'],
    css: ['.spinner'],
    page: 'components/flow.html',
  },
] satisfies When[];
