import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from './a11y.js';
import {
  DocList, DocRow, DocType, kindOf, formatBytes,
  Connection, ConnectionMark, ConnectionBody, ConnectionName, ConnectionNote,
  ConnectionActions, ConnectionStatus, Credential, KeyList, KeyRow, Scopes, Scope, Rule, Endpoint,
  Button,
} from '../packages/ui/src/index.js';

describe('document library', () => {
  it('maps extensions to kinds and falls back rather than guessing', () => {
    expect(kindOf('assessment.md')).toBe('md');
    expect(kindOf('EVIDENCE.XLSX')).toBe('xlsx');
    expect(kindOf('export.csv')).toBe('csv');
    expect(kindOf('sow.pdf')).toBe('pdf');
    expect(kindOf('diagram.PNG')).toBe('img');
    expect(kindOf('archive.tar.gz')).toBe('other');
    expect(kindOf('LICENSE')).toBe('other');
  });

  it('formats sizes at the right magnitude', () => {
    expect(formatBytes(412)).toBe('412 B');
    expect(formatBytes(412_000)).toBe('402 KB');
    expect(formatBytes(1_468_006)).toBe('1.4 MB');
  });

  it('keeps the type badge out of the accessible name — the filename carries it', () => {
    render(<DocList><DocRow name="Current-state assessment.md" size={48210} modified="21 Aug" /></DocList>);
    const row = screen.getByRole('button');
    expect(row).toHaveAccessibleName(/Current-state assessment\.md/);
    expect(row).not.toHaveAccessibleName(/MD/);
  });

  it('marks folders distinctly from content', () => {
    const { container } = render(<DocType kind="folder" />);
    expect(container.querySelector('.doc-type')).toHaveAttribute('data-kind', 'folder');
  });
});

describe('Credential', () => {
  const SECRET = 'AKIAEXAMPLEKEY01234567';

  // This is the security claim, so it is the test that matters most.
  it('does not put the secret in the DOM while masked', () => {
    const { container } = render(<Credential label="S3 access key" value={SECRET} />);
    expect(container.innerHTML).not.toContain(SECRET);
    expect(container.textContent).toContain('AKIA');   // the identifying hint only
  });

  it('mounts the real value only once revealed, and unmounts it again', async () => {
    const u = userEvent.setup();
    const { container } = render(<Credential label="S3 access key" value={SECRET} />);
    await u.click(screen.getByText('Reveal'));
    expect(container.innerHTML).toContain(SECRET);
    await u.click(screen.getByText('Hide'));
    expect(container.innerHTML).not.toContain(SECRET);
  });

  it('offers copy without requiring reveal', () => {
    render(<Credential label="S3 access key" value={SECRET} />);
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Reveal')).toBeInTheDocument();
  });

  it('drops the reveal control entirely for write-once secrets', () => {
    render(<Credential label="Signing secret" value={SECRET} neverReveal />);
    expect(screen.queryByText('Reveal')).toBeNull();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('names the field for assistive tech', () => {
    render(<Credential label="S3 access key" value={SECRET} />);
    expect(screen.getByText(/S3 access key/)).toBeInTheDocument();
  });
});

describe('connections and rules', () => {
  it('states status in words, never colour alone', () => {
    render(<ConnectionStatus state="degraded" />);
    expect(screen.getByText('Degraded')).toBeInTheDocument();
  });

  it('distinguishes expiring from expired', () => {
    const { container } = render(
      <KeyList>
        <KeyRow name="Audit exporter" fingerprint="g8v_…91c7" lastUsed="expires in 6 days" expiring />
        <KeyRow name="Legacy importer" fingerprint="g8v_…0d13" lastUsed="expired 2 Aug" expired />
      </KeyList>);
    const rows = container.querySelectorAll('.key-row');
    expect(rows[0]).toHaveAttribute('data-expiring');
    expect(rows[0]).not.toHaveAttribute('data-expired');
    expect(rows[1]).toHaveAttribute('data-expired');
  });

  it('marks write scopes so they stand out in a long list', () => {
    const { container } = render(
      <Scopes><Scope>read:evidence</Scope><Scope write>write:findings</Scope></Scopes>);
    const chips = container.querySelectorAll('.scope');
    expect(chips[0]).not.toHaveAttribute('data-write');
    expect(chips[1]).toHaveAttribute('data-write');
  });

  it('reads a rule as a sentence and dims a disabled one', () => {
    const { container, rerender } = render(
      <Rule from="GitHub" event="pull_request.merged" to="Jira" action="transition to Done" />);
    expect(container.textContent).toContain('GitHub');
    expect(container.textContent).toContain('pull_request.merged');
    expect(container.querySelector('.rule')).not.toHaveAttribute('data-off');
    rerender(<Rule from="RDS" event="backup.failed" to="Slack" action="page on-call" enabled={false} />);
    expect(container.querySelector('.rule')).toHaveAttribute('data-off');
  });
});

describe('axe — library and integrations', () => {
  it('has no violations', async () => {
    const { container } = render(
      <main>
        <h1>Integrations</h1>
        <DocList>
          <DocRow name="Evidence" kind="folder" sub="24 files" modified="21 Aug" />
          <DocRow name="assessment.md" size={48210} modified="21 Aug" />
        </DocList>
        <Connection>
          <ConnectionMark>GH</ConnectionMark>
          <ConnectionBody>
            <ConnectionName>GitHub<ConnectionStatus state="degraded" /></ConnectionName>
            <ConnectionNote>Webhook delivery failing</ConnectionNote>
          </ConnectionBody>
          <ConnectionActions><Button size="sm">Retry</Button></ConnectionActions>
        </Connection>
        <Credential label="S3 access key" value="AKIAEXAMPLEKEY01234567" onRotate={() => {}} />
        <KeyList>
          <KeyRow name="CI pipeline" fingerprint="g8v_…4f2a" lastUsed="3 min ago"
            scopes={<Scopes><Scope write>write:findings</Scope></Scopes>} />
        </KeyList>
        <Rule from="S3" event="object.created" to="Postgres" action="index evidence row" />
        <Endpoint url="https://events.example.com/hooks/x" />
      </main>);
    await expectNoA11yViolations(container);
  });
});
