import { describe, it } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from './a11y.js';
import {
  Combobox, Slider, FileUpload, FileList, FileItem, Calendar, Popover, PopoverTitle,
  PopoverActions, Tooltip, Button, Field, FieldLabel,
} from '../packages/ui/src/index.js';
import type { ComboboxOption } from '../packages/ui/src/index.js';

const OPTIONS: ComboboxOption[] = [
  { value: 'va', label: 'Ridgeway Transit Authority', note: 'Government' },
  { value: 'nh', label: 'Northlake Health', note: 'Healthcare' },
];

function ComboHarness() {
  const [v, setV] = useState<string | null>(null);
  return <Combobox label="Client" options={OPTIONS} value={v} onChange={setV} />;
}
function SliderHarness() {
  const [v, setV] = useState(62);
  return <Slider id="risk" label="Risk tolerance" display={`${v}%`} value={v}
    onChange={(e) => setV(Number(e.target.value))} />;
}
function CalHarness() {
  const [v, setV] = useState<string | null>('2026-08-14');
  return <Calendar today="2026-08-21" value={v} onChange={setV} />;
}

describe('axe — advanced inputs', () => {
  it('combobox, closed and open', async () => {
    const u = userEvent.setup();
    const { container } = render(<main><h1>Intake</h1><ComboHarness /></main>);
    await expectNoA11yViolations(container);
    await u.click(screen.getByRole('combobox'));
    await u.keyboard('{ArrowDown}');
    await expectNoA11yViolations(container);
  });

  it('slider, file upload and calendar', async () => {
    const { container } = render(
      <main>
        <h1>Evidence</h1>
        <Field><SliderHarness /></Field>
        <FileUpload onFiles={() => {}} multiple
          title="Drop evidence here, or browse" hint="PDF, PNG or CSV" />
        <FileList>
          <FileItem name="AU-6-evidence.pdf" size={1_468_006} />
          <FileItem name="controls-export.xlsx" size={3_355_443} error />
        </FileList>
        <CalHarness />
      </main>);
    await expectNoA11yViolations(container);
  });

  it('popover and tooltip, open', async () => {
    const u = userEvent.setup();
    const { container } = render(
      <main>
        <h1>Overview</h1>
        <Popover label="Coverage detail" trigger={<Button>Details</Button>}>
          <PopoverTitle>Coverage</PopoverTitle>
          18 of 29 controls answered.
          <PopoverActions><Button size="sm" variant="primary">Review</Button></PopoverActions>
        </Popover>
        <Tooltip content="Recorded as an unknown, not as compliant.">
          <Button variant="ghost">Unknowns</Button>
        </Tooltip>
      </main>);
    await u.click(screen.getByText('Details'));
    await expectNoA11yViolations(container);
    await u.hover(screen.getByText('Unknowns'));
    await expectNoA11yViolations(container);
  });
});
