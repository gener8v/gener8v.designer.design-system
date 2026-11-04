// Deterministic scoring for one run of one case. No model is involved here: the
// score is a function of the files the run wrote, its final message and the
// files it read.

/**
 * Root classes a component renders. Lets a static-HTML answer, or a React answer
 * that writes the class by hand, count for the component. A component whose
 * classes are shared with another (HoverCard and Popover, BarChart and
 * LineChart) has no entry: only the React name can tell those apart.
 */
export const CLASS_ALIASES = {
  Tabs: ['tabs'], Segmented: ['segmented'], Filter: ['filter'],
  Alert: ['alert'], Toast: ['toast', 'toast-region'], ToastProvider: ['toast-region'],
  State: ['state'], Callout: ['callout'],
  Dialog: ['dialog'], Drawer: ['drawer-panel'], Tooltip: ['tooltip'],
  Table: ['table'], TablePager: ['table-pager'], Pagination: ['pagination'], PagerChip: ['pager-chip'],
  Select: ['select-wrap'], Combobox: ['combobox'], Menu: ['menu'],
  Progress: ['progress'], LiveProgress: ['live-progress'], Lanes: ['lanes'], Stepper: ['stepper', 'stepper-vertical', 'stepper-rail'],
  Stat: ['stat'], StatRow: ['stat-row'], StatDelta: ['stat-delta'], Meter: ['meter'], Matrix: ['matrix'], Tally: ['tally'],
  Skeleton: ['skeleton'], Spinner: ['spinner'],
  Flow: ['flow'], ErrorSummary: ['error-summary'], RadioCards: ['radio-cards'], Quantity: ['qty'], Summary: ['summary'],
  Checklist: ['checklist'], FileUpload: ['dropzone'], Sidebar: ['sidebar'], Breadcrumbs: ['breadcrumbs'],
  Accordion: ['accordion'], Contents: ['contents'], Paper: ['paper'], Citation: ['citation'], SourceCard: ['source-card'],
  Conversation: ['conversation'], ToolChip: ['tool-chip'], ConfirmCard: ['confirm-card'],
  Timeline: ['timeline'], Feed: ['feed'], Entry: ['entry'], Calendar: ['calendar'], Field: ['field'],
  Switch: ['switch'], Checkbox: ['checkbox'], Button: ['btn'],
  // The mark tells the chart forms apart even though their frame classes are shared.
  LineChart: ['chart-line'], BarChart: ['chart-bar', 'chart-hbars'], Sparkline: ['sparkline'],
};

const TEMPLATE_RE = /design\/templates\/([a-z0-9-]+)/g;

/** Comments removed so a comment naming a component does not count as using it. */
function stripComments(src) {
  return src
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
}

/**
 * What a set of produced files uses.
 * @param {{path: string, content: string}[]} files
 */
export function extract(files) {
  const ds = new Set();          // names imported from @gener8v/ui and referenced
  const jsx = new Set();         // every capitalised JSX element name
  const classes = new Set();     // class tokens in className= / class= / cx('…')
  const packages = new Set();    // every module specifier imported
  const elements = new Set();    // lowercase elements: select, button …
  let titleAttr = false;         // a title attribute on a plain element

  for (const { content } of files) {
    const src = stripComments(content);
    const imported = [];
    for (const m of src.matchAll(/import\s+(?:type\s+)?([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g)) {
      packages.add(m[2]);
      if (m[2] === '@gener8v/ui') {
        const named = /\{([\s\S]*?)\}/.exec(m[1]);
        if (named) for (const part of named[1].split(',')) {
          const p = part.trim().replace(/^type\s+/, '');
          if (!p) continue;
          const [orig, alias] = p.split(/\s+as\s+/);
          imported.push([orig.trim(), (alias ?? orig).trim()]);
        }
      }
    }
    for (const m of src.matchAll(/(?:require\(|import\()\s*['"]([^'"]+)['"]/g)) packages.add(m[1]);
    const body = src.replace(/import\s+[\s\S]*?\s+from\s+['"][^'"]+['"];?/g, '');
    for (const [orig, local] of imported) {
      if (new RegExp(`\\b${local}\\b`).test(body)) ds.add(orig);
    }
    for (const m of src.matchAll(/<([A-Z][A-Za-z0-9]*)(?:\.([A-Z][A-Za-z0-9]*))?[\s/>]/g)) jsx.add(m[2] ? `${m[1]}.${m[2]}` : m[1]);
    for (const m of src.matchAll(/<([a-z][a-z0-9]*)[\s/>]/g)) elements.add(m[1]);
    if (/<[a-z][a-z0-9-]*\b[^<>]*?\stitle=/.test(src)) titleAttr = true;
    const addTokens = (s) => { for (const t of s.split(/\s+/)) if (/^[a-z][a-z0-9-]*$/.test(t)) classes.add(t); };
    for (const m of src.matchAll(/\bclass(?:Name)?\s*=\s*(?:\{\s*)?(["'`])([^"'`]*)\1/g)) addTokens(m[2]);
    for (const m of src.matchAll(/\bcx\(([^)]*)\)/g)) for (const s of m[1].matchAll(/['"`]([^'"`]+)['"`]/g)) addTokens(s[1]);
  }
  return { ds, jsx, classes, packages, elements, titleAttr };
}

/** Does the extracted usage satisfy one token? */
export function uses(u, token) {
  if (token.startsWith('.')) return u.classes.has(token.slice(1));
  if (token.startsWith('pkg:')) {
    const name = token.slice(4);
    return [...u.packages].some((p) => p === name || p.startsWith(`${name}/`));
  }
  if (token === 'attr:title') return u.titleAttr;
  const el = /^<([a-z][a-z0-9]*)>$/.exec(token);
  if (el) return u.elements.has(el[1]);
  if (u.ds.has(token)) return true;
  return (CLASS_ALIASES[token] ?? []).some((c) => u.classes.has(c));
}

/**
 * Which parts of the plugin's documentation a run opened or searched. A diagnostic, not part of
 * the score: it says whether a miss came from reading the guidance and choosing wrong, or from
 * never reaching it.
 */
export const DOC_AREAS = {
  references: /skills\/gener8v-design-system\/references\//,
  // The per-family choosing guides, once they exist. Zero until then.
  choosing: /references\/choosing\//,
  readme: /design\/readme\.md/,
  componentPages: /design\/components\//,
  templates: /design\/templates\//,
  specs: /docs\/specs\//,
  source: /packages\/ui\/src\//,
};
export function docsRead(paths) {
  return Object.fromEntries(Object.entries(DOC_AREAS).map(([k, re]) => [k, paths.some((p) => re.test(p))]));
}

/**
 * Score one run.
 * @param {object} kase   the case definition
 * @param {{files: {path:string, content:string}[], finalText: string, readPaths: string[], skillFired: boolean}} run
 */
export function scoreRun(kase, run) {
  const u = extract(run.files);
  const expect = kase.expect ?? [];
  const groups = kase.expect_any ?? [];
  const hitExpect = expect.filter((t) => uses(u, t));
  const hitGroups = groups.map((g) => g.find((t) => uses(u, t)) ?? null);
  const denom = expect.length + groups.length;
  const recall = denom === 0 ? 1 : (hitExpect.length + hitGroups.filter(Boolean).length) / denom;
  const forbidHits = (kase.forbid ?? []).filter((f) => uses(u, f.component)).map((f) => f.component);

  // Template: the expected template counts when the run read a file under it or
  // named it in its code or its final message.
  const seen = new Set();
  for (const p of run.readPaths ?? []) for (const m of p.matchAll(TEMPLATE_RE)) seen.add(m[1]);
  for (const f of run.files) for (const m of f.content.matchAll(TEMPLATE_RE)) seen.add(m[1]);
  for (const m of (run.finalText ?? '').matchAll(TEMPLATE_RE)) seen.add(m[1]);
  const templateMatch = kase.template ? seen.has(kase.template) : null;

  const pass = recall === 1 && forbidHits.length === 0 && templateMatch !== false;
  return {
    pass,
    recall,
    missing: [...expect.filter((t) => !hitExpect.includes(t)), ...groups.filter((_, i) => !hitGroups[i]).map((g) => g.join('|'))],
    forbidHits,
    templateMatch,
    templatesSeen: [...seen].sort(),
    used: [...u.ds].sort(),
    // Components matched only by writing their classes by hand, not by importing them.
    usedViaClass: Object.keys(CLASS_ALIASES).filter((k) => !u.ds.has(k) && uses(u, k)).sort(),
    importsReact: u.ds.size > 0,
    docsRead: docsRead(run.readPaths ?? []),
    otherJsx: [...u.jsx].filter((n) => !u.ds.has(n)).sort(),
    packages: [...u.packages].filter((p) => !p.startsWith('.')).sort(),
    nativeSelect: u.elements.has('select'),
    filesWritten: run.files.length,
    skillFired: !!run.skillFired,
  };
}
