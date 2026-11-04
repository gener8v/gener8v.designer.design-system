/**
 * WHICH COMPONENT, FOR WHICH JOB — THE SHAPE OF THE ANSWER.
 *
 * The class index says what each thing IS. It does not say which one to reach for, or which one
 * to leave alone: a reader who wants "a row of choices" finds `Tabs`, `Segmented`, `Filter` and
 * `RadioCards` all plausible, and only one of them is right for what they are doing.
 *
 * So every component carries a `when.ts` beside its source: the one job it does, when to use it,
 * when not to and what to use instead, and what it is most often confused with. A typed module
 * rather than a Markdown file because the references are checked — a `not` that points at a
 * component the system does not have fails `pnpm check`, as does an exported component with no
 * entry. `scripts/choosing.mjs` reads them all and writes
 * `skills/gener8v-design-system/references/choosing/<family>.md` and the router in `SKILL.md`.
 *
 * None of this ships in `@gener8v/ui` — `tsconfig.build.json` leaves it out.
 */

/** The families a task is routed by. The order is the router's order. */
export const FAMILIES = {
  screens: {
    title: 'Screens',
    question: 'a whole page, a shell, or the structure a page sits in',
  },
  overlays: {
    title: 'Overlays',
    question: 'something that floats above the page — a modal, a side panel, a hint, a preview',
  },
  'status-and-feedback': {
    title: 'Status and feedback',
    question: 'telling someone what happened, what state a thing is in, or that it is loading',
  },
  navigation: {
    title: 'Navigation',
    question: 'moving between places, switching views, or narrowing what a list shows',
  },
  data: {
    title: 'Data',
    question: 'figures, tables, charts, lists of records, or history',
  },
  input: {
    title: 'Input',
    question: 'an action someone presses or a value someone enters or picks',
  },
  reading: {
    title: 'Reading',
    question: 'a document, prose, code, sources or type someone reads',
  },
  'agents-and-live-work': {
    title: 'Agents and live work',
    question: 'a conversation with an agent, or work that is running right now',
  },
} as const;

export type Family = keyof typeof FAMILIES;

/** A situation this component is wrong for, and what to use there instead. */
export interface Instead {
  /** The situation, in task language: "the options swap whole panels of content". */
  when: string;
  /** The entry `name` to use instead. Checked: it must exist. */
  use: string;
  /** Why the other one is right there. One sentence. */
  because: string;
}

export interface When {
  /** The name a reader asks for — the main React export, or the class family for CSS-only parts. */
  name: string;
  family: Family;
  /** The one task it does, in task language: "show that work is happening right now". */
  job: string;
  /** One to three situations it is right for. */
  use: string[];
  /** At least one situation it is wrong for, each pointing at the right component. */
  not: Instead[];
  /** The entries it is most often confused with. Checked: each must exist. */
  neighbours: string[];
  /** Every exported React component that belongs to it. Empty only for a CSS-only part. */
  react: string[];
  /** Exported hooks and helpers that go with it. */
  hooks?: string[];
  /** Class roots, with the dot: `.tabs`. Checked against the stylesheet. */
  css: string[];
  /** Where it is shown, relative to `design/`: `components/navigation.html`. Null when nowhere. */
  page: string | null;
}

/** A kind of screen, the template to start it from, and the components it implies. */
export interface Screen {
  /** The screen in task language: "a multi-step form". */
  screen: string;
  /** Relative to `design/`. Checked: it must exist. */
  template: string;
  /** Entry names, in the order a reader meets them. Checked. */
  implies: string[];
  /** One line on when this template is the right start. */
  note: string;
}

/**
 * One row of the "Which state?" table at the top of the status-and-feedback file. Empty, no
 * results, error, partial and loading all read as "the region is not showing what you expected",
 * and the wrong pick is usually a banner (`Alert`) or a passing notice (`Toast`) where the region
 * itself should change. Every `use` is checked against the component names.
 */
export interface StateRow {
  /** What is true, in task language: "the read failed". */
  situation: string;
  /** The entry name to build it with. Checked: it must exist. */
  use: string;
  /** How to build it: the kind, the placement, the action. */
  how: string;
  /** The tempting wrong pick, and why not. */
  notThis: string;
}

export const STATES: StateRow[] = [
  {
    situation: 'nothing exists yet — a new account, an empty list',
    use: 'State',
    how: '`kind="empty"`, with `art`; name the cause and put the way out (Create…) in `StateActions`, in the list\'s own place.',
    notThis: '`Skeleton` (that means still reading) and `Alert` (absence is a state of the region, not a banner).',
  },
  {
    situation: 'a search or filter matched nothing, but the data exists',
    use: 'State',
    how: '`kind="empty"`, `tight`; say what was searched and offer to clear the filter. Keep the filter controls above it.',
    notThis: 'The first-use empty state: do not tell someone with 4,000 records to create their first one.',
  },
  {
    situation: 'the read failed and there is nothing to show instead',
    use: 'State',
    how: '`kind="error"` in place of the content, with a retry in `StateActions` and the code in `StateDetail`. The retry shows its wait on the button; the page does not go back to a skeleton.',
    notThis: '`Toast` (it leaves, the failure stays), `Skeleton` (it never says it finished) and `Alert` (nothing is left under it).',
  },
  {
    situation: 'only some sources answered; figures from the rest are shown',
    use: 'State',
    how: '`kind="partial"` directly above the figures it qualifies: "3 of 5 sources loaded", the missing ones named, Retry and Continue anyway. Never show a missing figure as zero.',
    notThis: '`Alert` (it reads as a page notice, and the figure can still be quoted as the total) and `Toast`.',
  },
  {
    situation: 'the region is still being read',
    use: 'Skeleton',
    how: 'Layout known: skeleton bars in its shape inside an `aria-busy` region. Shape unknown or a short wait: `State kind="loading"` or `Spinner`. Known amount done: `Progress`.',
    notThis: 'A skeleton that stays after the read fails or finds nothing.',
  },
  {
    situation: 'the content is fine and one thing about it needs saying — a stale source, a pending review',
    use: 'Alert',
    how: 'A banner above the content, with its action in `AlertActions`.',
    notThis: '`State` (it would hide content that is there).',
  },
  {
    situation: 'an action the person just took worked or failed, and the page is otherwise intact',
    use: 'Toast',
    how: 'Brief, with Undo at most. A failure that must be fixed goes in an `Alert` or on the field, not a toast.',
    notThis: '`State` (it replaces a whole region).',
  },
];
