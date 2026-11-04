# Component-selection eval — after-choosing

- Date: 2026-11-04T16:56:47.963Z
- Model: `sonnet` (reported: `claude-sonnet-5-5`)
- Commit: `09ea6ebf0c8841130355bf131b3aaa6beaee8e29`
- 38 cases × 3 repeats = 114 runs
- Cost: $21.84 total, $7.28 per full pass, $0.192 per run; mean run 42s, wall clock 20.7 min at concurrency 4

## Overall

Figures are the mean over repeats, with the lowest and highest repeat in brackets.

| Measure | Score |
| --- | --- |
| Pass rate | 91% (89%–95%) |
| Recall of expected components | 96% (96%–96%) |
| Runs with a forbidden pick | 2% (0%–3%) |
| Template match (screen cases) | 100% |
| Skill invoked | 100% |
| Runs importing `@gener8v/ui` React components | 99% |

A component counts whether it is imported from `@gener8v/ui` or written by hand as its classes. "(class)" in the tables marks the second.

## What the runs read

This is a diagnostic and is not part of the score. It shows which parts of the plugin each run opened or searched, and the pass rate with and without that read.

| Docs | Runs that read them | Pass when read | Pass when not |
| --- | --- | --- | --- |
| references | 100% | 91% | — |
| choosing | 94% | 93% | 57% |
| readme | 4% | 80% | 92% |
| componentPages | 53% | 90% | 93% |
| templates | 50% | 84% | 98% |
| specs | 2% | 100% | 91% |
| source | 77% | 93% | 85% |

## By family

| Family | Cases | Pass rate | Recall | Forbidden pick |
| --- | --- | --- | --- | --- |
| agents-and-live-work | 5 | 100% (100%–100%) | 100% (100%–100%) | 0% (0%–0%) |
| data | 7 | 100% (100%–100%) | 100% (100%–100%) | 0% (0%–0%) |
| status-and-feedback | 9 | 81% (78%–89%) | 89% (89%–89%) | 7% (0%–11%) |
| input | 3 | 100% (100%–100%) | 100% (100%–100%) | 0% (0%–0%) |
| navigation | 4 | 100% (100%–100%) | 100% (100%–100%) | 0% (0%–0%) |
| reading | 4 | 100% (100%–100%) | 100% (100%–100%) | 0% (0%–0%) |
| screens | 6 | 72% (67%–83%) | 91% (89%–94%) | 0% (0%–0%) |

## By confusable group

A case can sit in more than one group.

| Group | Cases | Pass rate | Recall | Forbidden pick |
| --- | --- | --- | --- | --- |
| alert-toast-state-callout | 4 | 83% (75%–100%) | 100% (100%–100%) | 17% (0%–25%) |
| dialog-drawer-popover | 7 | 95% (86%–100%) | 99% (96%–100%) | 0% (0%–0%) |
| empty-error | 4 | 58% (50%–75%) | 75% (75%–75%) | 17% (0%–25%) |
| progress-stepper | 6 | 89% (83%–100%) | 96% (94%–100%) | 0% (0%–0%) |
| select-combobox-menu | 4 | 100% (100%–100%) | 100% (100%–100%) | 0% (0%–0%) |
| stat-meter-charts | 6 | 89% (83%–100%) | 96% (94%–100%) | 0% (0%–0%) |
| table-pager | 4 | 100% (100%–100%) | 100% (100%–100%) | 0% (0%–0%) |
| tabs-segmented-filter | 3 | 100% (100%–100%) | 100% (100%–100%) | 0% (0%–0%) |

## Failing cases, worst first

| Case | Pass | Recall | Missing | Forbidden picked | Template | Picked instead (top) |
| --- | --- | --- | --- | --- | --- | --- |
| `feedback-partial-data` | 0% | 0.00 | State×3 | — | — | Alert×3, AlertActions×3, AlertBody×3, AlertTitle×3, Button×3, Card×3, Stat×3, StatLabel×3 |
| `screens-intake-multistep` | 33% | 0.78 | ErrorSummary|useStepValidation×2 | — | 100% want `intake`, saw intake×3, purchase | Button×3, Field×3, FieldHint×3, FieldLabel×3, Flow×3, FlowContent×3, FlowFields×3, FlowFooter×3 |
| `screens-ops-home` | 33% | 0.78 | Timeline|Feed×2 | — | 100% want `app-shell`, saw app-shell×3 | Panel×3, PanelHeader×3, PanelTitle×3, Stat×3, StatDelta×3, StatLabel×3, StatNote×3, StatValue×3 |
| `feedback-load-failed` | 33% | 1.00 | — | Skeleton×2 | — | Button×3, State×3, StateActions×3, StateBody×3, StateDetail×3, StateTitle×3, Skeleton×2, StateIcon×2 |
| `screens-close-task` | 67% | 0.92 | FileUpload | — | 100% want `work-item-close`, saw work-item-close×3 | Alert×2, AlertBody×2, AlertTitle×2, Button×2, Checklist×2, ChecklistItem×2, Dialog×2, Field×2 |

## All cases

| Case | Family | Pass | Recall | Skill | Picked |
| --- | --- | --- | --- | --- | --- |
| `agents-approve-plan-change` | agents-and-live-work | 100% | 1.00 | 100% | ConfirmCard×3, ConfirmState×3, Conversation×3, ToolChip×3, Turn×3, Tag |
| `agents-batch-run-lanes` | agents-and-live-work | 100% | 1.00 | 100% | LaneItem×3, Lanes×3, LiveIndicator×3, Button×2 |
| `agents-document-chat` | agents-and-live-work | 100% | 1.00 | 100% | Button×3, Conversation×3, Textarea×3, ToolChip×3, Turn×3, TurnPending×3, Field×2, FieldLabel×2 |
| `agents-import-stages` | agents-and-live-work | 100% | 1.00 | 100% | Step×3, StepState×3, Stepper×3, Tag |
| `agents-row-live-state` | agents-and-live-work | 100% | 1.00 | 100% | LiveProgress×3, Table×3, TableWrap×3, Td×3, Th×3, liveWhere×2, Button, LiveProgressState |
| `data-control-coverage` | data | 100% | 1.00 | 100% | Matrix×3, MatrixCell×3, MatrixCol×3, MatrixRow×3, Stat×3, StatLabel×3, StatNote×3, StatRow×3 |
| `data-finance-kpis` | data | 100% | 1.00 | 100% | Stat×3, StatDelta×3, StatLabel×3, StatRow×3, StatValue×3, StatNote |
| `data-narrow-contracts` | data | 100% | 1.00 | 100% | Button×3, Filter×3, Filters×3, Table×3, TableEmpty×3, TableEmptyTitle×3, TablePager×3, TableToolbar×3 |
| `data-paged-invoices` | data | 100% | 1.00 | 100% | Table×3, TablePager×3, TableWrap×3, Td×3, Th×3, usePagedTable×3, Tag×2, Panel |
| `data-search-result-pages` | data | 100% | 1.00 | 100% | Item×3, ItemList×3, Pagination×3, PaginationGap×3, PaginationItem×3, Button×2, Input×2, Tag |
| `data-signup-trend` | data | 100% | 1.00 | 100% | LineChart×3, Stat (class), StatDelta (class), Series, Stat, StatDelta, StatLabel, StatNote |
| `data-storage-quota` | data | 100% | 1.00 | 100% | Meter×3, Card×2, CardKicker, CardTitle, Tag |
| `feedback-delete-workspace` | status-and-feedback | 100% | 1.00 | 100% | Button×3, Checklist×3, ChecklistItem×3, Dialog×3, Field×3, FieldHint×3, FieldLabel×3, Input×3 |
| `feedback-empty-projects` | status-and-feedback | 100% | 1.00 | 100% | Button×3, State×3, StateActions×3, StateBody×3, StateTitle×3, PageHead, StateIcon |
| `feedback-help-aside` | status-and-feedback | 100% | 1.00 | 100% | Callout×3, CalloutTitle, Paper, PaperGround, Reader |
| `feedback-icon-hint` | status-and-feedback | 100% | 1.00 | 100% | Button×3, Tooltip×3 |
| `feedback-load-failed` | status-and-feedback | 33% | 1.00 | 100% | Button×3, State×3, StateActions×3, StateBody×3, StateDetail×3, StateTitle×3, Skeleton×2, StateIcon×2 |
| `feedback-maintenance-warning` | status-and-feedback | 100% | 1.00 | 100% | Alert×3, AlertBody×3, AlertTitle×3, Button, Table (class) |
| `feedback-partial-data` | status-and-feedback | 0% | 0.00 | 100% | Alert×3, AlertActions×3, AlertBody×3, AlertTitle×3, Button×3, Card×3, Stat×3, StatLabel×3 |
| `feedback-save-confirmation` | status-and-feedback | 100% | 1.00 | 100% | Button×3, Field×3, FieldLabel×3, Input×3, ToastProvider×3, useToast×3, FieldHint |
| `feedback-upload-progress` | status-and-feedback | 100% | 1.00 | 100% | Button×3, Progress×3, Tag×3, Card×2, Alert, AlertActions, AlertBody, AlertTitle |
| `input-country-picker` | input | 100% | 1.00 | 100% | Button×3, Combobox×3, ComboboxOption×3, Field×3, FieldError×3, FieldLabel×3, Input×3, FieldHint×2 |
| `input-due-date` | input | 100% | 1.00 | 100% | Button×3, Calendar×3, Card×3, CardTitle×3, ISODate×3, Tag, Field, FieldHint |
| `input-rename-inline` | input | 100% | 1.00 | 100% | Button×3, Field×3, FieldError×3, FieldLabel×3, Input×3, Popover×3, PopoverActions×3, PopoverTitle×2 |
| `navigation-detail-sections` | navigation | 100% | 1.00 | 100% | Tab×3, Tabs×3, Table×2, Tag×2, PageHead, TableWrap, Td, Th |
| `navigation-folder-trail` | navigation | 100% | 1.00 | 100% | Breadcrumb×3, Breadcrumbs×3 |
| `navigation-narrow-requests` | navigation | 100% | 1.00 | 100% | Filter×3, Filters×3, Tag×2, Table (class), Item |
| `navigation-row-actions` | navigation | 100% | 1.00 | 100% | Button×3, Dialog×3, Menu×3, MenuItem×3, MenuLabel×3, MenuSeparator×3, Table×3, Tag×3 |
| `reading-cited-summary` | reading | 100% | 1.00 | 100% | Citation×3, SourceCard×3, HoverCard×2, Paper, PaperGround, Tag, useDelegatedHoverCard |
| `reading-person-preview` | reading | 100% | 1.00 | 100% | HoverCard×3, Avatar×2, DescriptionList×2, Item×2, ItemList×2, PopoverTitle |
| `reading-policy-document` | reading | 100% | 1.00 | 100% | Contents×3, Paper×3, PaperAside×3, PaperGround×3, Reader, ContentsItem |
| `reading-step-through-findings` | reading | 100% | 1.00 | 100% | Button×3, Drawer×3, PagerChip×3, Tag×3, TagVariant |
| `screens-checkout` | screens | 100% | 1.00 | 100% | Button×3, Card×3, CardKicker×3, Checkbox×3, Choice×3, ChoiceHint×3, Field×3, FieldHint×3 |
| `screens-close-task` | screens | 67% | 0.92 | 100% | Alert×2, AlertBody×2, AlertTitle×2, Button×2, Checklist×2, ChecklistItem×2, Dialog×2, Field×2 |
| `screens-intake-multistep` | screens | 33% | 0.78 | 100% | Button×3, Field×3, FieldHint×3, FieldLabel×3, Flow×3, FlowContent×3, FlowFields×3, FlowFooter×3 |
| `screens-ops-home` | screens | 33% | 0.78 | 100% | Panel×3, PanelHeader×3, PanelTitle×3, Stat×3, StatDelta×3, StatLabel×3, StatNote×3, StatValue×3 |
| `screens-settings-page` | screens | 100% | 1.00 | 100% | Button×3, Choice×3, ChoiceHint×3, Field×3, FieldHint×3, FieldLabel×3, Input×3, Nav×3 |
| `screens-sign-in` | screens | 100% | 1.00 | 100% | Button×3, Entry×3, Field×3, FieldError×3, FieldLabel×3, Input×3, ButtonLink, FieldHint |
