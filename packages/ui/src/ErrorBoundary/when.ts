import type { When } from '../choosing.js';

export const when = [
  {
    name: 'ErrorBoundary',
    family: 'status-and-feedback',
    job: 'keep one broken region from blanking the app, and say plainly that it could not be shown',
    use: [
      'Around a routed page, inside the frame, so the header and navigation stay when the page throws: `<ErrorBoundary resetKey={path}>`, and leaving the page recovers it.',
      'Around a panel that renders data it does not control — a detail pane, a chart, an embedded preview — with the record id as `resetKey`.',
      'Hand the error to `onError` for the log. The person sees `State kind="error"`, never the error text.',
    ],
    not: [
      {
        when: 'a fetch failed or a source did not answer',
        use: 'State',
        because: 'a failed fetch is a state the screen expected and renders itself, with a retry; a boundary is for a render that threw.',
      },
      {
        when: 'the content is there and something about it is wrong or stale',
        use: 'Alert',
        because: 'an alert sits above content that still shows; a boundary replaces content that could not be drawn.',
      },
    ],
    neighbours: ['State', 'Alert'],
    react: ['ErrorBoundary'],
    css: [],
    page: 'components/states.html',
  },
] satisfies When[];
