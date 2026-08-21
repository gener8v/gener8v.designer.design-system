// Exactly what an engagement would write: one stylesheet, then components.
import '@gener8v/ui/styles.css';
import { useState } from 'react';
import {
  Nav, NavBrand, NavLinks, NavItem, Button, Card, CardKicker, CardTitle, CardBody,
  Stat, StatLabel, StatValue, StatDelta, Meter, BarChart, Tag,
  Field, FieldLabel, Input, Combobox, ToastProvider, useToast,
  Dialog, Panel, PanelHeader, PanelTitle, PanelBody,
  TableWrap, Table, Th, Td, KnowledgeGraph, Sparkline,
} from '@gener8v/ui';
import type { ComboboxOption } from '@gener8v/ui';
import { ArrowRight, Warning } from '@gener8v/icons';
import tokens from '@gener8v/tokens';

const CLIENTS: ComboboxOption[] = [
  { value: 'va', label: 'Commonwealth of Virginia', note: 'Government' },
  { value: 'nh', label: 'Northlake Health', note: 'Healthcare' },
];

const GRAPH_NODES = [
  { id: 'e1', label: 'G8V-2026-014', kind: 'engagement' },
  { id: 'c1', label: 'AC-2', kind: 'control' },
  { id: 'c2', label: 'AU-6', kind: 'control' },
  { id: 'f1', label: 'Finding 12', kind: 'finding' },
  { id: 'v1', label: 'Access log', kind: 'evidence' },
  { id: 'p1', label: 'Platform', kind: 'person' },
];
const GRAPH_LINKS = [
  { source: 'e1', target: 'c1' }, { source: 'e1', target: 'c2' },
  { source: 'c2', target: 'f1' }, { source: 'c1', target: 'v1' },
  { source: 'c2', target: 'v1' }, { source: 'p1', target: 'e1' },
];

function Body() {
  const { toast } = useToast();
  const [client, setClient] = useState<string | null>('va');
  const [open, setOpen] = useState(false);

  return (
    <>
      <Nav aria-label="Main">
        <NavBrand href="#">ENGAGEMENT APP</NavBrand>
        <NavLinks>
          <NavItem href="#" current>Delivery</NavItem>
          <NavItem href="#">Governance</NavItem>
        </NavLinks>
        <Button variant="primary" size="sm" onClick={() => toast({
          title: 'Scope saved', body: 'Version 4 · just now', tone: 'success',
        })}>Save scope</Button>
      </Nav>

      <main className="container section">
        <p className="label">Consumer smoke test</p>
        <h1 style={{ marginBlockStart: 'var(--space-3)' }}>Built from the published packages</h1>
        <p className="lede" style={{ marginBlockStart: 'var(--space-4)', maxInlineSize: '58ch' }}>
          Nothing on this page is styled locally. Every value comes from{' '}
          <code>@gener8v/tokens</code> — <code>--color-action</code> resolves to{' '}
          <code>{tokens['--color-action']}</code>.
        </p>

        <div className="row" style={{ gap: 'var(--space-3)', marginBlockStart: 'var(--space-6)' }}>
          <Button variant="primary">Continue<ArrowRight /></Button>
          <Button variant="secondary">Preview</Button>
          <Button variant="ghost" onClick={() => setOpen(true)}>Open dialog</Button>
          <Tag variant="success" dot>Live</Tag>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)', marginBlockStart: 'var(--space-10)' }}>
          <Card padding="sm"><Stat>
            <StatLabel>Engagements</StatLabel><StatValue>14</StatValue>
            <StatDelta direction="up">Up 3 this quarter</StatDelta>
          </Stat>
          <Sparkline values={[8, 9, 11, 10, 12, 13, 14]} label="Engagements trend, up 3" />
          </Card>
          <Card padding="sm">
            <CardKicker>Coverage</CardKicker>
            <div style={{ marginBlockStart: 'var(--space-3)' }}>
              <Meter value={91} label="Auditability" />
            </div>
          </Card>
          <Card padding="sm">
            <CardKicker>01 / Capability</CardKicker>
            <CardTitle style={{ fontSize: 'var(--text-lg)' }}>Regulated AI</CardTitle>
            <CardBody>Traceable decision paths.</CardBody>
          </Card>
        </div>

        <div style={{ marginBlockStart: 'var(--space-10)', maxInlineSize: 'var(--container-sm)' }}>
          <Field>
            <FieldLabel htmlFor="code">Engagement code</FieldLabel>
            <Input id="code" defaultValue="G8V-2026-014" />
          </Field>
          <div style={{ marginBlockStart: 'var(--space-5)' }}>
            <Combobox label="Client" options={CLIENTS} value={client} onChange={setClient} />
          </div>
        </div>

        <div style={{ marginBlockStart: 'var(--space-10)' }}>
          <BarChart title="Findings by control family"
            categories={['AC', 'AU', 'IA', 'SC']}
            series={[{ label: 'Open', values: [4, 7, 2, 5] }, { label: 'Resolved', values: [9, 12, 6, 8] }]} />
        </div>

        <Panel style={{ marginBlockStart: 'var(--space-10)' }}>
          <PanelHeader><PanelTitle>Work items</PanelTitle><Warning /></PanelHeader>
          <PanelBody>
            <TableWrap>
              <Table compact>
                <thead><tr><Th>Ref</Th><Th>Title</Th><Th numeric>Age</Th></tr></thead>
                <tbody>
                  <tr><Td mono nowrap>WI-118</Td><Td>Access review evidence</Td><Td numeric>5d</Td></tr>
                  <tr><Td mono nowrap>WI-121</Td><Td>Key rotation cadence</Td><Td numeric>2d</Td></tr>
                </tbody>
              </Table>
            </TableWrap>
          </PanelBody>
        </Panel>

        <div style={{ marginBlockStart: 'var(--space-10)' }}>
          <p className="label" style={{ marginBlockEnd: 'var(--space-3)' }}>Knowledge graph</p>
          <KnowledgeGraph nodes={GRAPH_NODES} links={GRAPH_LINKS}
            caption="Engagement G8V-2026-014 and its controls"
            kinds={[{ kind: 'engagement', label: 'Engagement' }, { kind: 'control', label: 'Control' },
                    { kind: 'finding', label: 'Finding' }, { kind: 'evidence', label: 'Evidence' },
                    { kind: 'person', label: 'Team' }]} />
        </div>
      </main>

      <Dialog open={open} onClose={() => setOpen(false)} title="Archive this engagement?"
        actions={<>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setOpen(false)}>Archive</Button>
        </>}>
        The audit trail is retained and stays readable. Nothing is deleted.
      </Dialog>
    </>
  );
}

export function App() {
  return <ToastProvider><Body /></ToastProvider>;
}
