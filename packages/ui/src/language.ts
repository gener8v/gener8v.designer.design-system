/**
 * The product's own grammar, as a check rather than a document.
 *
 * A page of rules about labels is a page somebody reads once. These are the same rules a test can
 * fail on, which is the difference between a convention and a constraint — and it is the reason
 * this system holds contrast ratios and token usage in linters rather than in prose.
 *
 * WHAT THIS CANNOT DO. Rules 6 and 7 are about a SCREEN, not a label: one voice across a surface,
 * and the distinguishing word landing first in a set of siblings. Neither can be judged from a
 * single string, so neither is here — a checker that silently skipped them while reporting
 * "passed" would be worse than one that says what it looked at.
 *
 * Rule 10 is a rule about rules: clarity wins, and the exception gets logged. `problems` returns
 * findings rather than throwing so a caller can do exactly that.
 */

/** Where the text appears. The form a label must take follows from this and nothing else. */
export type Surface =
  | 'action'   // buttons, menu actions
  | 'task'     // checklist and task items
  | 'title'    // page and section titles
  | 'column'   // table column headers
  | 'progress' // in-progress status
  | 'done'     // completed status
  | 'help';    // helper and body text

/** One rule, broken, in words somebody can act on. */
export interface Problem {
  rule: number;
  says: string;
}

/** Surfaces the reader is meant to ACT on. Rule 2 and Rule 9 apply only here. */
const ACTIONABLE = new Set<Surface>(['action', 'task']);

/** Title Case, per Rule 11. Everything else is sentence case. */
const TITLE_CASED = new Set<Surface>(['action', 'column']);

/** Rule 11's own exception list: short prepositions, articles and coordinating conjunctions stay
 *  lowercase inside a title unless they lead or close it. */
const STAY_LOWER = new Set([
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'into', 'nor',
  'of', 'off', 'on', 'onto', 'or', 'over', 'per', 'so', 'the', 'to', 'up', 'via', 'with', 'yet',
]);

//: ANYWHERE, NOT ONLY IN FRONT. The first version anchored this to the start, which passes
//: "Confirm the Trial Balance" — the rule's own example of what it forbids. Rule 8 says no
//: articles in labels, and the article that hides is the one in the middle.
const ARTICLE = /\b(the|a|an)\b/i;
const RELATIVE = /\b(that|which|who|whom|whose)\b/i;
const STRANDED = /\b(to|for|with|on|in|at|from|by|of|about|into|onto|under|over)\s*$/i;
const NOMINALIZED = /\b\w+(tion|ment|ance|ence|sion)\s+of\b/i;
const GERUND = /^\w+ing\b/i;

const words = (text: string): string[] => text.trim().split(/\s+/).filter(Boolean);

/**
 * Every rule this text breaks on this surface.
 *
 * Empty means it broke none of the ones a single label can be judged against — not that it is
 * good. See the note above about Rules 6 and 7.
 */
export function problems(text: string, surface: Surface): Problem[] {
  const said = text.trim();
  if (!said) return [];
  const found: Problem[] = [];
  const parts = words(said);

  // Rule 2 — no gerunds where the reader is meant to do something. `progress` is where a gerund
  // belongs, and it is the only place.
  if (ACTIONABLE.has(surface) && GERUND.test(said)) {
    found.push({ rule: 2, says: 'starts with a gerund; an action starts with a verb in base form' });
  }
  if (surface === 'progress' && !GERUND.test(said)) {
    found.push({ rule: 1, says: 'an in-progress state reads as a gerund' });
  }

  // Rule 3 — a nominalized verb hides who acts.
  if (NOMINALIZED.test(said)) {
    found.push({ rule: 3, says: 'nominalizes a verb, which suppresses the actor' });
  }

  // Rule 4 — a label needing a clause needs rewriting, not a clause.
  if (RELATIVE.test(said)) {
    found.push({ rule: 4, says: 'contains a relative clause' });
  }

  // Rule 5 — a preposition at the end is a sentence that ran out.
  if (STRANDED.test(said)) {
    found.push({ rule: 5, says: 'strands a preposition at the end' });
  }

  // Rule 8 — articles carry nothing in a label.
  if (surface !== 'help' && ARTICLE.test(said)) {
    found.push({ rule: 8, says: 'contains an article' });
  }

  // Rule 9 — verb and object. Conditions belong in helper text.
  if (ACTIONABLE.has(surface) && parts.length > 3) {
    found.push({ rule: 9, says: `is ${parts.length} words; an action takes three or fewer` });
  }

  // Rule 11 — Title Case on buttons and columns, sentence case everywhere else.
  found.push(...capitalization(parts, surface));
  return found;
}

function capitalization(parts: string[], surface: Surface): Problem[] {
  if (parts.length === 0) return [];
  const leads = (word: string) => /^[A-Z]/.test(word);
  // A word carrying its own capitals — an id, an acronym, a product — is not this rule's business.
  const shouty = (word: string) => /[A-Z]/.test(word.slice(1)) || /\d/.test(word);

  if (TITLE_CASED.has(surface)) {
    const wrong = parts.filter((word, at) => {
      if (shouty(word)) return false;
      const small = STAY_LOWER.has(word.toLowerCase());
      const edge = at === 0 || at === parts.length - 1;
      return small && !edge ? leads(word) : !leads(word);
    });
    return wrong.length
      ? [{ rule: 11, says: `is not Title Case: ${wrong.join(', ')}` }]
      : [];
  }

  // Sentence case: the first word leads, the rest do not unless they carry their own capitals.
  const strays = parts.slice(1).filter((word) => leads(word) && !shouty(word));
  const problems: Problem[] = [];
  if (!leads(parts[0] ?? '') && !shouty(parts[0] ?? '')) {
    problems.push({ rule: 11, says: 'sentence case still capitalises the first word' });
  }
  if (strays.length) {
    problems.push({ rule: 11, says: `is not sentence case: ${strays.join(', ')}` });
  }
  return problems;
}

/** Whether this text breaks nothing a single label can be judged against. */
export const reads = (text: string, surface: Surface): boolean =>
  problems(text, surface).length === 0;
