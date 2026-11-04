import type { Screen } from './choosing.js';

/**
 * Kinds of screen, the template under `design/templates/` to start each from, and the components
 * each one implies. A screen started from a blank file reinvents the shell, the funnel and the
 * states; a template already has them.
 */
export const screens = [
  {
    screen: 'an application page — a list, a dashboard, a record',
    template: 'templates/app-shell/',
    implies: ['Nav', 'Sidebar', 'Breadcrumbs', 'PageHead', 'Stat', 'Table', 'Timeline', 'State'],
    note: 'Every client application starts here: header, rail, page head with figures, a data panel.',
  },
  {
    screen: 'a multi-step form or wizard',
    template: 'templates/intake/',
    implies: ['Flow', 'Stepper', 'Field', 'Input', 'Choice', 'ErrorSummary', 'State'],
    note: 'Back on the left, forward on the right, one step at a time, and all six states.',
  },
  {
    screen: 'a checkout or anything with a price',
    template: 'templates/purchase/',
    implies: ['Flow', 'Quantity', 'RadioCards', 'Summary', 'Panel'],
    note: 'Quantities, a delivery choice with a figure on each option, and one emphasised total.',
  },
  {
    screen: 'a create form — describe, label, attach',
    template: 'templates/work-item-create/',
    implies: ['Flow', 'Field', 'Input', 'Segmented', 'TokenInput', 'Combobox', 'FileUpload'],
    note: 'A new record with a type, labels, an owner and evidence.',
  },
  {
    screen: 'closing or approving a record, with an irreversible confirm',
    template: 'templates/work-item-close/',
    implies: ['Checklist', 'RadioCards', 'FileUpload', 'Comment', 'Dialog', 'Panel'],
    note: 'Criteria that stay visible once checked, an outcome, evidence, the thread, and a confirm that lists what it writes.',
  },
  {
    screen: 'a marketing or landing page',
    template: 'templates/landing/',
    implies: ['Nav', 'Layout', 'SectionBand', 'Card', 'Type'],
    note: 'The one saturated band, feature cards and a close.',
  },
  {
    screen: 'a presentation deck',
    template: 'templates/deck/',
    implies: ['Slide', 'Table', 'Meter', 'Tag'],
    note: 'Slides sized in container units, so a deck reads the same in a grid or projected.',
  },
] satisfies Screen[];
