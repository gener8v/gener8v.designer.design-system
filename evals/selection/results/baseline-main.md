# Component-selection eval — baseline-main

- Date: 2026-11-04T16:26:19.583Z
- Model: `sonnet` (reported: `claude-sonnet-5-5`)
- Commit: `87567cf (main, Release 0.61.0) with this harness`
- 38 cases × 3 repeats = 114 runs
- Re-scored from saved runs (baseline-main); cost and time are those of the original runs
- Cost: $19.59 total, $6.53 per full pass, $0.172 per run; mean run 41s, wall clock 16.4 min at concurrency 5

## Overall

Figures are the mean over repeats, with the lowest and highest repeat in brackets.

| Measure | Score |
| --- | --- |
| Pass rate | 82% (79%–84%) |
| Recall of expected components | 89% (84%–93%) |
| Runs with a forbidden pick | 0% (0%–0%) |
| Template match (screen cases) | 47% |
| Skill invoked | 100% |
| Runs importing `@gener8v/ui` React components | 62% |

A component counts whether it is imported from `@gener8v/ui` or written by hand as its classes. "(class)" in the tables marks the second.

## What the runs read

This is a diagnostic and is not part of the score. It shows which parts of the plugin each run opened or searched, and the pass rate with and without that read.

| Docs | Runs that read them | Pass when read | Pass when not |
| --- | --- | --- | --- |
| references | 73% | 81% | 87% |
| choosing | 0% | — | 82% |
| readme | 24% | 81% | 83% |
| componentPages | 13% | 87% | 82% |
| templates | 13% | 73% | 84% |
| specs | 4% | 100% | 82% |
| source | 58% | 95% | 65% |

## By family

| Family | Cases | Pass rate | Recall | Forbidden pick |
| --- | --- | --- | --- | --- |
| agents-and-live-work | 5 | 93% (80%–100%) | 97% (90%–100%) | 0% (0%–0%) |
| data | 7 | 90% (86%–100%) | 93% (86%–100%) | 0% (0%–0%) |
| status-and-feedback | 9 | 81% (67%–89%) | 81% (67%–89%) | 0% (0%–0%) |
| input | 3 | 100% (100%–100%) | 100% (100%–100%) | 0% (0%–0%) |
| navigation | 4 | 100% (100%–100%) | 100% (100%–100%) | 0% (0%–0%) |
| reading | 4 | 100% (100%–100%) | 100% (100%–100%) | 0% (0%–0%) |
| screens | 6 | 33% (33%–33%) | 72% (67%–78%) | 0% (0%–0%) |

## By confusable group

A case can sit in more than one group.

| Group | Cases | Pass rate | Recall | Forbidden pick |
| --- | --- | --- | --- | --- |
| alert-toast-state-callout | 4 | 83% (50%–100%) | 83% (50%–100%) | 0% (0%–0%) |
| dialog-drawer-popover | 7 | 95% (86%–100%) | 100% (100%–100%) | 0% (0%–0%) |
| empty-error | 4 | 42% (25%–50%) | 42% (25%–50%) | 0% (0%–0%) |
| progress-stepper | 6 | 78% (67%–83%) | 95% (92%–100%) | 0% (0%–0%) |
| select-combobox-menu | 4 | 67% (50%–75%) | 88% (75%–100%) | 0% (0%–0%) |
| stat-meter-charts | 6 | 89% (83%–100%) | 94% (89%–100%) | 0% (0%–0%) |
| table-pager | 4 | 100% (100%–100%) | 100% (100%–100%) | 0% (0%–0%) |
| tabs-segmented-filter | 3 | 78% (67%–100%) | 83% (67%–100%) | 0% (0%–0%) |

## Failing cases, worst first

| Case | Pass | Recall | Missing | Forbidden picked | Template | Picked instead (top) |
| --- | --- | --- | --- | --- | --- | --- |
| `feedback-partial-data` | 0% | 0.00 | State×3 | — | — | Alert (class)×2, Button (class)×2, Stat (class)×2, Table (class)×2, Alert, AlertActions, AlertBody, AlertTitle |
| `screens-sign-in` | 0% | 0.00 | Entry×3 | — | — | Alert (class)×2, Button (class)×2, ErrorSummary (class) |
| `screens-intake-multistep` | 0% | 0.89 | ErrorSummary|useStepValidation | — | 0% want `intake`, saw — | Button (class)×3, Flow (class)×3, RadioCards (class)×3, State (class)×3, Stepper (class)×3, Summary (class)×3, ErrorSummary (class)×2, Field (class) |
| `data-narrow-contracts` | 33% | 0.50 | Filter×2, Table | — | — | Button×2, Tag×2, Filter, Filters, PageHead, State, StateActions, StateBody |
| `screens-ops-home` | 33% | 0.67 | Timeline|Feed×2, Sidebar | — | 67% want `app-shell`, saw app-shell×2 | Button×2, PageHead×2, Panel×2, PanelBody×2, PanelHeader×2, PanelTitle×2, Sidebar×2, SidebarCount×2 |
| `screens-checkout` | 33% | 1.00 | — | — | 33% want `purchase`, saw purchase | Quantity (class)×3, RadioCards (class)×3, State (class)×3, Summary (class)×3 |
| `feedback-load-failed` | 67% | 0.67 | State | — | — | State (class)×2, Button (class), Progress (class), Button, Card |
| `feedback-maintenance-warning` | 67% | 0.67 | Alert | — | — | Alert×2, AlertBody×2, AlertTitle×2, PageHead, Button, Card, Tag |
| `screens-settings-page` | 67% | 0.78 | Sidebar, Switch|Checkbox | — | 67% want `app-shell`, saw app-shell×2 | Button×2, Choice×2, ChoiceHint×2, Combobox×2, Field×2, FieldError×2, FieldHint×2, FieldLabel×2 |
| `agents-row-live-state` | 67% | 0.83 | LiveProgress | — | — | Button (class)×2, Progress (class)×2, Table (class)×2, LiveProgress (class), LiveProgress, LiveProgressState, Table, TableWrap |
| `screens-close-task` | 67% | 1.00 | — | — | 67% want `work-item-close`, saw work-item-close×2 | Alert×2, AlertBody×2, AlertTitle×2, Breadcrumb×2, Breadcrumbs×2, Button×2, Checklist×2, ChecklistItem×2 |

## All cases

| Case | Family | Pass | Recall | Skill | Picked |
| --- | --- | --- | --- | --- | --- |
| `agents-approve-plan-change` | agents-and-live-work | 100% | 1.00 | 100% | ConfirmCard×2, ConfirmState×2, Conversation×2, Turn×2, Tag, Button (class), ConfirmCard (class), Conversation (class) |
| `agents-batch-run-lanes` | agents-and-live-work | 100% | 1.00 | 100% | Button×2, LaneItem×2, Lanes×2, Alert (class), Button (class), Lanes (class), Progress (class), PageActions |
| `agents-document-chat` | agents-and-live-work | 100% | 1.00 | 100% | Button×2, Conversation×2, State×2, StateBody×2, StateTitle×2, Textarea×2, ToolChip×2, Turn×2 |
| `agents-import-stages` | agents-and-live-work | 100% | 1.00 | 100% | Step×3, StepState×3, Stepper×3, Button×2, Tag×2, Alert, AlertActions, AlertBody |
| `agents-row-live-state` | agents-and-live-work | 67% | 0.83 | 100% | Button (class)×2, Progress (class)×2, Table (class)×2, LiveProgress (class), LiveProgress, LiveProgressState, Table, TableWrap |
| `data-control-coverage` | data | 100% | 1.00 | 100% | Matrix×3, MatrixCol×3, MatrixRow×3, MatrixCell×2, Tag×2, Stat×2, StatLabel×2, StatRow×2 |
| `data-finance-kpis` | data | 100% | 1.00 | 100% | Stat (class)×3, StatDelta (class)×3 |
| `data-narrow-contracts` | data | 33% | 0.50 | 100% | Button×2, Tag×2, Filter, Filters, PageHead, State, StateActions, StateBody |
| `data-paged-invoices` | data | 100% | 1.00 | 100% | Pagination (class)×3, Table (class)×3, TablePager (class)×3 |
| `data-search-result-pages` | data | 100% | 1.00 | 100% | Pagination×3, PaginationGap×3, PaginationItem×3, Tag×3, CardBody×2, CardMeta×2, CardTitle×2, Card×2 |
| `data-signup-trend` | data | 100% | 1.00 | 100% | LineChart (class)×2, Stat (class)×2, Table (class)×2, LineChart, Series, Stat, StatDelta, StatLabel |
| `data-storage-quota` | data | 100% | 1.00 | 100% | Card×2, Meter (class)×2, CardBody, CardTitle, Meter, Stat (class) |
| `feedback-delete-workspace` | status-and-feedback | 100% | 1.00 | 100% | Alert (class)×2, Button×2, Dialog×2, Field×2, FieldHint×2, FieldLabel×2, Input×2, Button (class) |
| `feedback-empty-projects` | status-and-feedback | 100% | 1.00 | 100% | Button (class)×2, Dialog (class)×2, State (class)×2, Button, Dialog, Field, FieldError, FieldHint |
| `feedback-help-aside` | status-and-feedback | 100% | 1.00 | 100% | Callout×2, CalloutTitle×2, Callout (class) |
| `feedback-icon-hint` | status-and-feedback | 100% | 1.00 | 100% | Button×3, Tooltip×3 |
| `feedback-load-failed` | status-and-feedback | 67% | 0.67 | 100% | State (class)×2, Button (class), Progress (class), Button, Card |
| `feedback-maintenance-warning` | status-and-feedback | 67% | 0.67 | 100% | Alert×2, AlertBody×2, AlertTitle×2, PageHead, Button, Card, Tag |
| `feedback-partial-data` | status-and-feedback | 0% | 0.00 | 100% | Alert (class)×2, Button (class)×2, Stat (class)×2, Table (class)×2, Alert, AlertActions, AlertBody, AlertTitle |
| `feedback-save-confirmation` | status-and-feedback | 100% | 1.00 | 100% | Button×3, Field×3, FieldLabel×3, Input×3, ToastProvider×3, useToast×3, Card×2 |
| `feedback-upload-progress` | status-and-feedback | 100% | 1.00 | 100% | Button (class)×2, Progress (class)×2, Button, Card, Progress, Tag |
| `input-country-picker` | input | 100% | 1.00 | 100% | Button×3, Combobox×3, ComboboxOption×3, Field×3, Input×3, FieldError, FieldLabel |
| `input-due-date` | input | 100% | 1.00 | 100% | Button×3, Calendar×3, ISODate×3, Card×2, CardBody×2, CardTitle×2, Tag×2, Field×2 |
| `input-rename-inline` | input | 100% | 1.00 | 100% | Button×3, Field×3, FieldLabel×3, Input×3, Popover×3, PopoverActions×3, PopoverTitle, FieldError |
| `navigation-detail-sections` | navigation | 100% | 1.00 | 100% | Tab×3, Tabs×3, Stat (class)×3, Table (class)×3, Timeline (class)×3, Tag×2, Button |
| `navigation-folder-trail` | navigation | 100% | 1.00 | 100% | Breadcrumb×3, Breadcrumbs×3 |
| `navigation-narrow-requests` | navigation | 100% | 1.00 | 100% | Segmented×3, SegmentedItem×3, Tag×3, Table (class)×2, Table, Th |
| `navigation-row-actions` | navigation | 100% | 1.00 | 100% | Button (class)×2, Dialog (class)×2, Menu (class)×2, Table (class)×2, Avatar, Button, Dialog, Menu |
| `reading-cited-summary` | reading | 100% | 1.00 | 100% | Citation×3, HoverCard×3, SourceCard×3, Card, Tag |
| `reading-person-preview` | reading | 100% | 1.00 | 100% | HoverCard×3, Avatar, DescriptionList, Item, ItemList, Panel, PanelBody, PanelHeader |
| `reading-policy-document` | reading | 100% | 1.00 | 100% | Contents (class)×3, Paper (class)×3 |
| `reading-step-through-findings` | reading | 100% | 1.00 | 100% | Button×2, Drawer×2, PagerChip×2, Tag×2, Button (class), PagerChip (class), State (class) |
| `screens-checkout` | screens | 33% | 1.00 | 100% | Quantity (class)×3, RadioCards (class)×3, State (class)×3, Summary (class)×3 |
| `screens-close-task` | screens | 67% | 1.00 | 100% | Alert×2, AlertBody×2, AlertTitle×2, Breadcrumb×2, Breadcrumbs×2, Button×2, Checklist×2, ChecklistItem×2 |
| `screens-intake-multistep` | screens | 0% | 0.89 | 100% | Button (class)×3, Flow (class)×3, RadioCards (class)×3, State (class)×3, Stepper (class)×3, Summary (class)×3, ErrorSummary (class)×2, Field (class) |
| `screens-ops-home` | screens | 33% | 0.67 | 100% | Button×2, PageHead×2, Panel×2, PanelBody×2, PanelHeader×2, PanelTitle×2, Sidebar×2, SidebarCount×2 |
| `screens-settings-page` | screens | 67% | 0.78 | 100% | Button×2, Choice×2, ChoiceHint×2, Combobox×2, Field×2, FieldError×2, FieldHint×2, FieldLabel×2 |
| `screens-sign-in` | screens | 0% | 0.00 | 100% | Alert (class)×2, Button (class)×2, ErrorSummary (class) |
