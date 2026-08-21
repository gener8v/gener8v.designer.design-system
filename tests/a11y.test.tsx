import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { expectNoA11yViolations } from './a11y.js';
import {
  Button, ButtonGroup, Tag, Card, CardKicker, CardTitle, CardBody, CardMeta,
  Panel, PanelHeader, PanelTitle, PanelBody,
  Field, FieldLabel, FieldHint, FieldError, Input, Textarea, Select,
  Choice, ChoiceHint, Checkbox, Radio, Switch,
  Nav, NavBrand, NavLinks, NavItem, Hamburger, Sidebar, SidebarGroup, SidebarItem, SidebarCount,
  Breadcrumbs, Breadcrumb, Tabs, Tab,
  TableWrap, Table, Th, Td, TableEmpty, TableEmptyTitle,
  Stepper, Step, Progress, ProgressRing, Spinner, Skeleton,
  Pagination, PaginationItem, PaginationGap, Timeline, TimelineItem,
  State, StateIcon, StateTitle, StateBody, StateActions, StateDetail,
  Dialog, Alert, AlertTitle, AlertBody, ToastRegion, Toast, ToastTitle, ToastBody, ToastClose,
  Callout, CalloutTitle,
  Flow, FlowRail, FlowRailTitle, FlowMain, FlowHeader, FlowStepOf, FlowTitle, FlowLede,
  FlowContent, FlowFields, FlowFooter, FlowFooterStatus,
  Menu, MenuItem, MenuLabel, MenuSeparator, MenuShortcut,
  Accordion, AccordionItem, Segmented, SegmentedItem,
  Stat, StatLabel, StatValue, StatNote, StatDelta, Meter, DescriptionList, Avatar, AvatarGroup,
} from '../packages/ui/src/index.js';

const Icon = () => <svg viewBox="0 0 256 256" aria-hidden="true"><path d="M0 0h256v256H0z" /></svg>;

describe('axe — every component family', () => {
  it('actions and surfaces', async () => {
    const { container } = render(
      <main>
        <h1>Engagements</h1>
        <Button variant="primary">Start</Button>
        <Button variant="destructive">Delete</Button>
        <Button iconOnly aria-label="Search"><Icon /></Button>
        <Button variant="primary" loading>Saving</Button>
        <ButtonGroup aria-label="View">
          <Button>Day</Button><Button>Week</Button>
        </ButtonGroup>
        <Card>
          <CardKicker>01 / Capability</CardKicker>
          <CardTitle>Regulated AI delivery</CardTitle>
          <CardBody>Traceable decision paths.</CardBody>
          <CardMeta><Tag variant="success" dot>Live</Tag><span>Richmond, VA</span></CardMeta>
        </Card>
        <Panel>
          <PanelHeader><PanelTitle>Engagements</PanelTitle><Button size="sm">Export</Button></PanelHeader>
          <PanelBody>Body</PanelBody>
        </Panel>
      </main>);
    await expectNoA11yViolations(container);
  });

  it('forms', async () => {
    const { container } = render(
      <main>
        <h1>Intake</h1>
        <Field>
          <FieldLabel htmlFor="org">Client organisation</FieldLabel>
          <Input id="org" aria-describedby="org-hint" />
          <FieldHint id="org-hint">As it appears on the SOW.</FieldHint>
        </Field>
        <Field>
          <FieldLabel htmlFor="mail">Email</FieldLabel>
          <Input id="mail" invalid aria-describedby="mail-err" />
          <FieldError id="mail-err">Enter a valid email address.</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="sector" optional>Sector</FieldLabel>
          <Select id="sector"><option>Federal</option></Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="scope">Scope</FieldLabel>
          <Textarea id="scope" />
        </Field>
        <fieldset>
          <legend>Tier</legend>
          <Choice><Radio name="tier" defaultChecked /><span>Advisory</span></Choice>
          <Choice><Radio name="tier" /><span>Build</span></Choice>
        </fieldset>
        <Choice><Checkbox defaultChecked /><span>Audit trail<ChoiceHint>Required for AU-6.</ChoiceHint></span></Choice>
        <Choice><Switch defaultChecked /><span>Weekly status</span></Choice>
      </main>);
    await expectNoA11yViolations(container);
  });

  it('navigation', async () => {
    const { container } = render(
      <div>
        <Nav aria-label="Main">
          <NavBrand href="#">GENER8V</NavBrand>
          <NavLinks><NavItem href="#" current>What we do</NavItem><NavItem href="#">Who we are</NavItem></NavLinks>
          <Hamburger expanded={false} aria-label="Open menu" />
        </Nav>
        <Sidebar aria-label="Delivery">
          <SidebarGroup>Delivery</SidebarGroup>
          <SidebarItem href="#" current>Engagements<SidebarCount>14</SidebarCount></SidebarItem>
          <SidebarItem href="#">Deliverables</SidebarItem>
        </Sidebar>
        <main>
          <h1>G8V-2026-014</h1>
          <Breadcrumbs>
            <Breadcrumb href="#">Delivery</Breadcrumb>
            <Breadcrumb href="#">Engagements</Breadcrumb>
            <Breadcrumb current>G8V-2026-014</Breadcrumb>
          </Breadcrumbs>
          <Tabs aria-label="Sections">
            <Tab selected>Overview</Tab><Tab selected={false}>Scope</Tab>
          </Tabs>
        </main>
      </div>);
    await expectNoA11yViolations(container);
  });

  it('table', async () => {
    const { container } = render(
      <main>
        <h1>Engagements</h1>
        <TableWrap>
          <Table>
            <caption>Active engagements</caption>
            <thead><tr>
              <Th sort="descending" onSort={() => {}}>Code</Th>
              <Th>Client</Th>
              <Th numeric>Value</Th>
            </tr></thead>
            <tbody><tr>
              <Td mono nowrap>G8V-2026-014</Td>
              <Td>Commonwealth of Virginia</Td>
              <Td numeric>1,240,000</Td>
            </tr></tbody>
          </Table>
        </TableWrap>
        <TableEmpty><TableEmptyTitle>No engagements yet</TableEmptyTitle></TableEmpty>
      </main>);
    await expectNoA11yViolations(container);
  });

  it('flow controls', async () => {
    const { container } = render(
      <main>
        <h1>Intake</h1>
        <Stepper aria-label="Progress">
          <Step state="complete" index={1} label="Scope" />
          <Step state="current" index={2} label="Controls" />
          <Step state="upcoming" index={3} label="Sign" connector={false} />
        </Stepper>
        <Progress value={62} aria-label="Upload" />
        <Progress aria-label="Working" />
        <ProgressRing value={91} aria-label="Coverage" />
        <Spinner label="Loading" />
        <Skeleton variant="title" />
        <Pagination>
          <PaginationItem>Prev</PaginationItem>
          <PaginationItem current>1</PaginationItem>
          <PaginationGap />
          <PaginationItem>24</PaginationItem>
        </Pagination>
        <Timeline>
          <TimelineItem current time="14:02" title="Review opened" body="Assigned." />
          <TimelineItem time="09:40" title="Scope signed" />
        </Timeline>
      </main>);
    await expectNoA11yViolations(container);
  });

  it('states and feedback', async () => {
    const { container } = render(
      <main>
        <h1>States</h1>
        <State kind="partial" tight>
          <StateIcon><Icon /></StateIcon>
          <StateTitle>3 of 5 sources loaded</StateTitle>
          <StateBody>Figures exclude the rest.</StateBody>
          <StateActions><Button size="sm">Retry</Button></StateActions>
        </State>
        <State kind="error" tight>
          <StateIcon><Icon /></StateIcon>
          <StateTitle>Could not load</StateTitle>
          <StateDetail>AUDIT_TIMEOUT · req 4f2a91c</StateDetail>
        </State>
        <Alert tone="danger" live><Icon /><div><AlertTitle>Unreachable</AlertTitle><AlertBody>Not logging.</AlertBody></div></Alert>
        <Alert tone="success"><Icon /><div><AlertTitle>Evidenced</AlertTitle></div></Alert>
        <Callout accent><CalloutTitle>On unknowns</CalloutTitle>Not evidence of compliance.</Callout>
        <ToastRegion>
          <Toast tone="success"><Icon /><div><ToastTitle>Saved</ToastTitle><ToastBody>v4</ToastBody></div><ToastClose /></Toast>
        </ToastRegion>
        <Dialog open onClose={() => {}} title="Archive?" actions={<Button variant="primary">Archive</Button>}>
          Nothing is deleted.
        </Dialog>
      </main>);
    await expectNoA11yViolations(container);
  });

  it('the flow shell', async () => {
    const { container } = render(
      <Flow>
        <FlowRail>
          <FlowRailTitle>Engagement intake</FlowRailTitle>
          <Stepper vertical aria-label="Steps">
            <Step state="complete" index={1} label="Scope" connector={false} />
            <Step state="current" index={2} label="Controls" connector={false} />
          </Stepper>
        </FlowRail>
        <FlowMain>
          <FlowHeader>
            <FlowStepOf>Step 2 of 4</FlowStepOf>
            <FlowTitle>Review the control set</FlowTitle>
            <FlowLede>Confirm the controls.</FlowLede>
          </FlowHeader>
          <FlowContent>
            <FlowFields>
              <Field><FlowLede>—</FlowLede></Field>
            </FlowFields>
          </FlowContent>
          <FlowFooter>
            <Button>Back</Button>
            <FlowFooterStatus>Saved just now</FlowFooterStatus>
            <Button variant="primary">Continue</Button>
          </FlowFooter>
        </FlowMain>
      </Flow>);
    await expectNoA11yViolations(container);
  });

  it('menu and disclosure', async () => {
    const { container } = render(
      <main>
        <h1>Actions</h1>
        <Menu label="Actions" trigger={<Button>Actions</Button>}>
          <MenuLabel>Engagement</MenuLabel>
          <MenuItem><Icon />Open<MenuShortcut>↵</MenuShortcut></MenuItem>
          <MenuItem disabled>Duplicate</MenuItem>
          <MenuSeparator />
          <MenuItem danger>Archive</MenuItem>
        </Menu>
        <Segmented aria-label="Range">
          <SegmentedItem checked>Quarter</SegmentedItem>
          <SegmentedItem checked={false}>Year</SegmentedItem>
        </Segmented>
        <Accordion type="single" defaultOpen={['a']}>
          <AccordionItem value="a" title="What counts as an unknown?">No evidence attached.</AccordionItem>
          <AccordionItem value="b" title="Who can change it?">The engagement lead.</AccordionItem>
        </Accordion>
      </main>);
    await expectNoA11yViolations(container);
  });

  it('data display', async () => {
    const { container } = render(
      <main>
        <h1>Overview</h1>
        <Stat>
          <StatLabel>Engagements</StatLabel>
          <StatValue>14</StatValue>
          <StatDelta direction="up">Up 3 this quarter</StatDelta>
        </Stat>
        <Stat>
          <StatLabel>Cost avoided</StatLabel>
          <StatValue>$3.0M</StatValue>
          <StatNote>Trailing twelve months</StatNote>
        </Stat>
        <Meter value={91} label="Auditability" />
        <Meter value={24} label="Evidence attached" tone="danger" />
        <DescriptionList>
          <dt>Code</dt><dd>G8V-2026-014</dd>
          <dt>Client</dt><dd>Commonwealth of Virginia</dd>
        </DescriptionList>
        <AvatarGroup>
          <Avatar size="sm" name="Thomas E" />
          <Avatar size="sm" name="J R" />
        </AvatarGroup>
      </main>);
    await expectNoA11yViolations(container);
  });
});
