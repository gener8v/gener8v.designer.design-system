/**
 * A compact longest-common-subsequence diff. No dependency: the package's only peers are React,
 * and a diff of two paragraphs or two short documents does not need Myers' O(ND) refinements.
 *
 * Common prefix and suffix are trimmed first, which is what makes the quadratic table affordable
 * on real edits — an edit usually changes a sentence, not the whole text. Past `MAX_CELLS` the
 * middle is reported as one removal and one addition rather than freezing the page.
 */

export type DiffGranularity = 'word' | 'line';
export type DiffOpType = 'equal' | 'added' | 'removed';
export interface DiffOp { type: DiffOpType; text: string }

const MAX_CELLS = 4_000_000;

/** Words and the whitespace between them, so joining the tokens gives back the text exactly. */
export function tokenize(text: string, granularity: DiffGranularity): string[] {
  if (text === '') return [];
  if (granularity === 'line') return text.match(/[^\n]*\n|[^\n]+$/g) ?? [];
  return text.match(/\s+|[\p{L}\p{N}_'’-]+|[^\s\p{L}\p{N}_]/gu) ?? [];
}

function push(out: DiffOp[], type: DiffOpType, text: string) {
  if (text === '') return;
  const last = out[out.length - 1];
  if (last && last.type === type) last.text += text;
  else out.push({ type, text });
}

export function diff(before: string, after: string, granularity: DiffGranularity = 'word'): DiffOp[] {
  // By line, the last line has no newline of its own, so "c" and "c\n" would differ and an
  // append would mark the untouched line above it as changed. So in line mode every line carries
  // its newline, the last included — a caller joining the ops gets the text with one at the end.
  const pad = (t: string) => (granularity === 'line' && t !== '' && !t.endsWith('\n') ? `${t}\n` : t);
  const a = tokenize(pad(before), granularity);
  const b = tokenize(pad(after), granularity);
  const out: DiffOp[] = [];

  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) { endA--; endB--; }

  push(out, 'equal', a.slice(0, start).join(''));

  const n = endA - start;
  const m = endB - start;
  if (n * m > MAX_CELLS) {
    push(out, 'removed', a.slice(start, endA).join(''));
    push(out, 'added', b.slice(start, endB).join(''));
  } else if (n > 0 || m > 0) {
    // lcs[i][j] = length of the LCS of a[start+i..] and b[start+j..], in one flat array.
    const w = m + 1;
    const lcs = new Uint32Array((n + 1) * w);
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        lcs[i * w + j] = a[start + i] === b[start + j]
          ? lcs[(i + 1) * w + j + 1]! + 1
          : Math.max(lcs[(i + 1) * w + j]!, lcs[i * w + j + 1]!);
      }
    }
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (a[start + i] === b[start + j]) { push(out, 'equal', a[start + i]!); i++; j++; }
      // Removals before additions at a tie, so a replacement reads "old, then new".
      else if (lcs[(i + 1) * w + j]! >= lcs[i * w + j + 1]!) { push(out, 'removed', a[start + i]!); i++; }
      else { push(out, 'added', b[start + j]!); j++; }
    }
    while (i < n) { push(out, 'removed', a[start + i]!); i++; }
    while (j < m) { push(out, 'added', b[start + j]!); j++; }
  }

  push(out, 'equal', a.slice(endA).join(''));
  return tidy(out);
}

/**
 * "the quick fox" → "a slow fox" matches the space between the two changed words, and a reader
 * then sees `the`→`a`, an untouched space, `quick`→`slow`: four marks for one edit. A run of
 * changes separated only by whitespace is one change, so it is reported as one removal followed
 * by one addition.
 */
function tidy(ops: DiffOp[]): DiffOp[] {
  const out: DiffOp[] = [];
  let removed = '';
  let added = '';
  const flush = () => { push(out, 'removed', removed); push(out, 'added', added); removed = ''; added = ''; };
  ops.forEach((op, k) => {
    const prev = ops[k - 1];
    const next = ops[k + 1];
    const bridge = op.type === 'equal' && /^\s+$/.test(op.text) && !op.text.includes('\n')
      && prev !== undefined && prev.type !== 'equal' && next !== undefined && next.type !== 'equal';
    if (op.type === 'removed') removed += op.text;
    else if (op.type === 'added') added += op.text;
    else if (bridge) { removed += op.text; added += op.text; }
    else { flush(); push(out, 'equal', op.text); }
  });
  flush();
  return out;
}
