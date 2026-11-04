import type { When } from '../choosing.js';

export const when = [
  {
    name: 'Calendar',
    family: 'input',
    job: 'pick a date from a month grid',
    use: [
      'Choosing a date where the day of the week or nearness to other dates matters — a deadline, a review date.',
      'Dates go in and out as `YYYY-MM-DD` strings (`toISO`), never as `Date` objects, so a deadline cannot move a day across a time zone.',
    ],
    not: [
      {
        when: 'the person knows the date and only needs to type it, such as a date of birth',
        use: 'Input',
        because: 'a typed date is faster than paging a grid back through decades.',
      },
      {
        when: 'the dates are events to read in order, not a value to pick',
        use: 'Timeline',
        because: 'a timeline shows what happened when; a calendar asks for one date.',
      },
    ],
    neighbours: ['Input', 'Popover', 'Timeline'],
    react: ['Calendar'],
    hooks: ['toISO'],
    css: ['.calendar'],
    page: 'components/inputs.html',
  },
] satisfies When[];
