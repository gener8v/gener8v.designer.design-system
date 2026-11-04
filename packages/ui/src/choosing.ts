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
