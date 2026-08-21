#!/usr/bin/env node
// Consumer smoke test: import the BUILT package the way a client repo would,
// render it, and assert the markup carries the same classes the static HTML
// uses. This is the last link in the chain tokens → CSS → HTML → React.
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as ui from '../packages/ui/dist/index.js';

const fails = [];
const check = (name, markup, ...expected) => {
  for (const e of expected) {
    if (!markup.includes(e)) fails.push(`${name}: expected ${JSON.stringify(e)} in ${markup.slice(0, 120)}`);
  }
};

check('Button/primary',
  renderToStaticMarkup(h(ui.Button, { variant: 'primary' }, 'Go')),
  'class="btn btn-primary"', '<button', 'type="button"');

check('Button/loading+size',
  renderToStaticMarkup(h(ui.Button, { variant: 'primary', size: 'lg', loading: true }, 'Saving')),
  'btn-lg', 'is-loading', 'aria-busy="true"');

check('Button/iconOnly',
  renderToStaticMarkup(h(ui.Button, { iconOnly: true, 'aria-label': 'Search' })),
  'btn-icon', 'aria-label="Search"');

check('Tag/dot',
  renderToStaticMarkup(h(ui.Tag, { variant: 'success', dot: true }, 'Live')),
  'class="tag tag-success tag-dot"');

check('Input/invalid',
  renderToStaticMarkup(h(ui.Input, { invalid: true, size: 'sm' })),
  'class="input input-sm"', 'aria-invalid="true"');

check('Select/wrapper',
  renderToStaticMarkup(h(ui.Select, null, h('option', null, 'A'))),
  'class="select-wrap"', 'class="select"');

check('NavItem/current',
  renderToStaticMarkup(h(ui.NavItem, { current: true, href: '#' }, 'Home')),
  'class="nav-item"', 'aria-current="page"');

check('Hamburger/expanded',
  renderToStaticMarkup(h(ui.Hamburger, { expanded: true, 'aria-label': 'Close menu' })),
  'class="hamburger"', 'aria-expanded="true"', 'hamburger-bar');

check('Step/current',
  renderToStaticMarkup(h(ui.Step, { state: 'current', index: 3, label: 'Review' })),
  'class="step"', 'aria-current="step"', 'step-marker', 'step-connector');

check('Step/complete',
  renderToStaticMarkup(h(ui.Step, { state: 'complete', index: 1, label: 'Scope' })),
  'data-state="complete"');

check('Progress/determinate',
  renderToStaticMarkup(h(ui.Progress, { value: 62, 'aria-label': 'Upload' })),
  'role="progressbar"', 'aria-valuenow="62"', 'progress-bar');

check('Progress/indeterminate',
  renderToStaticMarkup(h(ui.Progress, { 'aria-label': 'Working' })),
  'progress-indeterminate');

check('ProgressRing',
  renderToStaticMarkup(h(ui.ProgressRing, { value: 91, 'aria-label': 'Coverage' })),
  'progress-ring', '--progress:91', '91%');

check('State/partial',
  renderToStaticMarkup(h(ui.State, { kind: 'partial' })),
  'class="state"', 'data-tone="warning"');

check('State/loading',
  renderToStaticMarkup(h(ui.State, { kind: 'loading' })),
  'aria-busy="true"');

check('Alert/danger',
  renderToStaticMarkup(h(ui.Alert, { tone: 'danger', live: true }, 'x')),
  'class="alert"', 'data-tone="danger"', 'role="alert"');

check('Table/Th sorted',
  renderToStaticMarkup(h('table', null, h('thead', null, h('tr', null,
    h(ui.Th, { sort: 'descending', numeric: true, onSort: () => {} }, 'Value'))))),
  'aria-sort="descending"', 'data-numeric="true"', '<button');

check('Dialog/closed renders nothing',
  renderToStaticMarkup(h(ui.Dialog, { open: false, onClose: () => {}, title: 'T' })) || '(empty)',
  '(empty)');

const dlg = renderToStaticMarkup(h(ui.Dialog, { open: true, onClose: () => {}, title: 'Archive?' }));
check('Dialog/open', dlg, 'class="dialog-backdrop"', 'role="dialog"', 'aria-modal="true"', 'aria-labelledby=');
if (!/aria-labelledby="([^"]+)"[\s\S]*id="\1"/.test(dlg)) {
  fails.push('Dialog: aria-labelledby does not point at the rendered title id');
}

check('Breadcrumbs/separators',
  renderToStaticMarkup(h(ui.Breadcrumbs, null,
    h(ui.Breadcrumb, { href: '#' }, 'A'), h(ui.Breadcrumb, { href: '#' }, 'B'), h(ui.Breadcrumb, { current: true }, 'C'))),
  'class="breadcrumbs"', 'breadcrumb-sep', 'aria-current="page"', 'aria-label="Breadcrumb"');

check('ToastClose/name',
  renderToStaticMarkup(h(ui.ToastClose, null)),
  'toast-close', 'aria-label="Dismiss"');

// role="meter" is anonymous unless its visible label is referenced explicitly.
const meter = renderToStaticMarkup(h(ui.Meter, { value: 91, label: 'Auditability' }));
check('Meter', meter, 'role="meter"', 'aria-valuenow="91"', 'meter-fill');
if (!/aria-labelledby="([^"]+)"[\s\S]*id="\1"/.test(meter)) {
  fails.push('Meter: aria-labelledby does not point at the rendered label id');
}

check('Quantity',
  renderToStaticMarkup(h(ui.Quantity, { value: 3, onChange: () => {}, label: 'Licences' })),
  'class="qty"', 'aria-label="Decrease Licences"', 'aria-label="Increase Licences"', 'type="number"');

check('RadioCard',
  renderToStaticMarkup(h(ui.RadioCard, { title: 'Air-gapped media', note: 'Courier', meta: '$250.00', name: 'ship' })),
  'class="radio-card"', 'type="radio"', 'radio-card-meta');

check('Summary total',
  renderToStaticMarkup(h(ui.Summary, null, h(ui.SummaryRow, { label: 'Total', value: '$17,374.50', total: true }))),
  'class="summary"', 'summary-row summary-total', '<dt>', '<dd>');

check('TokenInput',
  renderToStaticMarkup(h(ui.TokenInput, {
    tokens: [{ id: 'a', label: 'AU-6', variant: 'accent' }], onRemove: () => {}, label: 'Labels' })),
  'class="token-input"', 'tag tag-accent', 'aria-label="Remove AU-6"', 'token-input-field');

check('ChecklistItem',
  renderToStaticMarkup(h(ui.Checklist, null, h(ui.ChecklistItem, { defaultChecked: true, note: 'Verified' }, 'Criterion'))),
  'class="checklist"', 'checklist-item', 'type="checkbox"', 'checklist-note');

check('Comment',
  renderToStaticMarkup(h(ui.Comment, { author: 'Delivery lead', time: '14:02' }, 'Confirmed.')),
  'class="comment"', 'comment-author', 'comment-time');

check('Avatar initials',
  renderToStaticMarkup(h(ui.Avatar, { name: 'Thomas Eaves', size: 'sm' })),
  'class="avatar avatar-sm"', 'TE', 'aria-hidden="true"');

check('CardMedia', renderToStaticMarkup(h(ui.CardMedia, null)), 'class="card-media"');

// The graph's layout maths must survive the build, not just the source tree.
const L = ui.createLayout(
  [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }],
  [{ source: 'a', target: 'b' }, { source: 'a', target: 'c' }], 400, 400);
ui.settle(L, { width: 400, height: 400 });
if (![...L.x, ...L.y].every(Number.isFinite)) fails.push('KnowledgeGraph: layout produced non-finite positions');
if (L.degree[L.index.get('a')] !== 2) fails.push('KnowledgeGraph: degree not counted from edges');
if (ui.radiusFor(100000) !== 34) fails.push('KnowledgeGraph: radius is not capped');

check('CommandPalette closed',
  renderToStaticMarkup(h(ui.CommandPalette, { open: false, onClose: () => {}, commands: [] })) || '(empty)',
  '(empty)');

const palette = renderToStaticMarkup(h(ui.CommandPalette, {
  open: true, onClose: () => {},
  commands: [{ id: 'x', label: 'Close work item', group: 'Work items', onRun: () => {} }],
}));
check('CommandPalette open', palette,
  'class="command"', 'role="dialog"', 'aria-modal="true"', 'role="listbox"', 'command-group');
if (!/aria-activedescendant="([^"]+)"[\s\S]*id="\1"/.test(palette)) {
  fails.push('CommandPalette: aria-activedescendant does not point at a rendered option');
}

const tree = renderToStaticMarkup(h(ui.Tree, {
  nodes: [{ id: 'a', label: 'AC', children: [{ id: 'b', label: 'AC-2' }] }],
  'aria-label': 'Controls',
}));
check('Tree', tree, 'role="tree"', 'role="treeitem"', 'aria-expanded="false"', 'tree-twisty');

check('CodeBlock',
  renderToStaticMarkup(h(ui.CodeBlock, { code: 'npm i', title: 'sh', copyable: true })),
  'class="code"', 'code-head', 'code-copy', 'npm i');

const exported = Object.keys(ui).length;
if (fails.length) { console.error(`✗ smoke\n${fails.map((f) => '  · ' + f).join('\n')}`); process.exit(1); }
console.log(`✓ smoke — ${exported} exports import from dist; 36 render assertions pass`);
