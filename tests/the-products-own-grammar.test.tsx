import { describe, it, expect } from 'vitest';
import { problems, reads, type Surface } from '../packages/ui/src/language.js';

/**
 * The product language rules, as a check rather than a document.
 *
 * The cases are the rules' OWN examples, in both domains they were written in — finance and
 * education — because the rules are about form and not subject matter, and a test using only one
 * domain would quietly become a test about accounting vocabulary.
 */

const breaks = (text: string, surface: Surface, rule: number) =>
  problems(text, surface).some((p) => p.rule === rule);

describe('rule 2 — no gerunds on actionable surfaces', () => {
  it('refuses a gerund on a button', () => {
    expect(breaks('Confirming Trial Balance', 'action', 2)).toBe(true);
    expect(breaks('Publishing Grades', 'action', 2)).toBe(true);
  });

  it('accepts the base form', () => {
    expect(breaks('Confirm Trial Balance', 'action', 2)).toBe(false);
    expect(breaks('Publish Grades', 'action', 2)).toBe(false);
  });

  it('leaves the one surface a gerund belongs on alone', () => {
    // "Gerunds are reserved for transient states."
    expect(reads('Reconciling…', 'progress')).toBe(true);
    expect(reads('Grading…', 'progress')).toBe(true);
    // And an in-progress state that is NOT a gerund is the same fault from the other side.
    expect(breaks('Reconcile in progress', 'progress', 1)).toBe(true);
  });
});

describe('rule 3 — no nominalized verbs', () => {
  it('names the actor', () => {
    expect(breaks('Deletion of Records', 'action', 3)).toBe(true);
    expect(breaks('Enrollment of Students', 'action', 3)).toBe(true);
    expect(breaks('Delete Records', 'action', 3)).toBe(false);
    expect(breaks('Enroll Students', 'action', 3)).toBe(false);
  });
});

describe('rules 4 and 5 — clauses and stranded prepositions', () => {
  it('refuses a relative clause', () => {
    expect(breaks('The File That It Came As', 'column', 4)).toBe(true);
    expect(breaks('Lessons That the Class Has Completed', 'column', 4)).toBe(true);
    expect(reads('Source Format', 'column')).toBe(true);
    expect(reads('Completed Lessons', 'column')).toBe(true);
  });

  it('refuses a preposition left at the end', () => {
    expect(breaks('The Period This Applies To', 'column', 5)).toBe(true);
    expect(breaks('The Unit This Belongs To', 'column', 5)).toBe(true);
    expect(reads('Applicable Period', 'column')).toBe(true);
    expect(reads('Parent Unit', 'column')).toBe(true);
  });
});

describe('rule 8 — no articles in labels', () => {
  it('drops the article', () => {
    expect(breaks('Confirm the Trial Balance', 'action', 8)).toBe(true);
    expect(breaks('Open the Gradebook', 'action', 8)).toBe(true);
    expect(breaks('The Roster', 'title', 8)).toBe(true);
    // The one that hides: an article in the middle of an otherwise clean action.
    expect(breaks('Confirm Trial Balance', 'action', 8)).toBe(false);
  });

  it('leaves body text alone, where articles are how English works', () => {
    expect(breaks('The entries post to the current period.', 'help', 8)).toBe(false);
  });
});

describe('rule 9 — verb and object, nothing more', () => {
  it('sends conditions to helper text', () => {
    expect(breaks('Post Entries for the Current Period', 'action', 9)).toBe(true);
    expect(breaks('Send Reminder to Students With Missing Work', 'action', 9)).toBe(true);
    expect(breaks('Post Entries', 'action', 9)).toBe(false);
    expect(breaks('Send Reminder', 'action', 9)).toBe(false);
  });

  it('does not count words on a surface nobody acts on', () => {
    expect(breaks('Entries post to the current period.', 'help', 9)).toBe(false);
  });
});

describe('rule 11 — Title Case on buttons and columns, sentence case elsewhere', () => {
  it('holds Title Case where it belongs', () => {
    expect(reads('Confirm Trial Balance', 'action')).toBe(true);
    expect(reads('Source File', 'column')).toBe(true);
    expect(breaks('Confirm trial balance', 'action', 11)).toBe(true);
  });

  it('keeps small words small inside a title, except at either end', () => {
    // Rule 11's own exception: articles, coordinating conjunctions and short prepositions.
    expect(reads('Export Ledger and Journal', 'column')).toBe(true);
    expect(breaks('Export Ledger And Journal', 'column', 11)).toBe(true);
  });

  it('holds sentence case everywhere else', () => {
    expect(reads('Trial balance', 'title')).toBe(true);
    expect(reads('Course roster', 'title')).toBe(true);
    expect(reads('Report sent', 'done')).toBe(true);
    expect(breaks('Trial Balance', 'title', 11)).toBe(true);
  });

  it('leaves a word carrying its own capitals alone', () => {
    // An id, an acronym or a product name is not this rule's business.
    expect(reads('Sync JIRA board', 'title')).toBe(true);
    expect(reads('Open D4 list', 'title')).toBe(true);
  });
});

describe('what a single label cannot be judged on', () => {
  it('says nothing about voice or scan order', () => {
    // Rules 6 and 7 are about a SCREEN — one voice across it, and the distinguishing word landing
    // first among siblings. Neither is visible in one string, and a checker reporting "passed"
    // while silently skipping them would be worse than one that says what it looked at.
    expect(reads('Export Ledger', 'action')).toBe(true);
    expect(reads('Export Journal', 'action')).toBe(true);
  });

  it('returns findings rather than throwing, so an exception can be logged', () => {
    // Rule 10: when a rule and clarity conflict, clarity wins — and the exception gets logged.
    const found = problems('Deletion of the Records That Apply To', 'action');
    expect(found.map((p) => p.rule).sort()).toEqual([3, 4, 5, 8, 9]);
    expect(found.every((p) => p.says.length > 0)).toBe(true);
  });
});

describe('what the checker must not flag', () => {
  it('leaves a phrasal verb and a value-heading column alone', () => {
    // Pointed at a real product it flagged "Sign in", where `in` is part of the verb, and
    // "Invited by" / "Decided by" / "Approved by", where `by` heads the value the column holds.
    // The rule's own examples are clauses — "The Period This Applies To" — and renaming idiomatic
    // two-word labels to satisfy it would make a product worse, which is the failure a checker
    // exists to prevent.
    expect(breaks('Sign in', 'action', 5)).toBe(false);
    for (const header of ['Invited by', 'Decided by', 'Approved by']) {
      expect(breaks(header, 'column', 5)).toBe(false);
    }
  });

  it('still catches the clause that ran out', () => {
    expect(breaks('The Period This Applies To', 'column', 5)).toBe(true);
    expect(breaks('The Unit This Belongs To', 'column', 5)).toBe(true);
  });
});
