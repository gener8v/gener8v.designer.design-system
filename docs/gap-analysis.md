# Gap analysis — three example workflows

Method: walk each workflow screen by screen, name the component each element needs,
and mark it present or missing. A gap is only real if a screen cannot be built
honestly without it — "would be nice" is not a gap, it is a wish, and a design system
that absorbs wishes stops being a system.

Status: **resolved**. Every gap below is built, previewed, typed and gated.

---

## Workflow A — Purchasing a product

`templates/purchase/` · Basket → Delivery → Payment → Review

| Screen element | Resolved by | Was it a gap? |
| --- | --- | --- |
| Product line, thumbnail | `Card` + **`CardMedia`** | **Gap.** Card was padded with no way to bleed media to its edges. |
| Change quantity | **`Quantity`** | **Gap.** Nothing existed. A `<select>` of 1–10 is the usual bad answer. |
| Delivery options | **`RadioCards`** | **Gap.** A bare `Radio` cannot carry a description and a price. |
| Payment terms notice | `Alert` | Present. |
| Order totals | **`Summary`** | **Gap.** `DescriptionList` has no emphasised total, and the total is the one row the eye must land on. |
| Terms acceptance | `Choice` + `Checkbox` | Present. |
| Step position | `Flow`, `Stepper` | Present. |
| Place order | `Button` | Present. |

**Note on payment.** The template shows purchase-order billing, not card entry. That is
a deliberate design decision, not an omission: GENER8V sells to procurement, and a
card form would be modelling the wrong buyer.

## Workflow B — Creating a work item

`templates/work-item-create/` · Describe → Link evidence → Assign

| Screen element | Resolved by | Was it a gap? |
| --- | --- | --- |
| Title, detail | `Field`, `Input`, `Textarea` | Present. |
| Item type | `Segmented` | Present. |
| Priority | `Select` | Present. |
| Owner | `Combobox` | Present. |
| Labels | **`TokenInput`** + **removable `Tag`** | **Gap.** `Combobox` is single-select and `Tag` had no remove affordance. |
| Attachments | `FileUpload`, `FileList` | Present. |
| Linked control | `Card` (quiet) | Present. |
| Save draft / continue | `Flow`, `Button` | Present. |

## Workflow C — Closing a work item

`templates/work-item-close/` · Review criteria → Record outcome → Confirm

| Screen element | Resolved by | Was it a gap? |
| --- | --- | --- |
| Breadcrumb, status | `Breadcrumbs`, `Tag` | Present. |
| Acceptance criteria | **`Checklist`** + `Meter` | **Gap.** A bare checkbox list loses the completion signal, which is the whole reason to show criteria at close. |
| Outcome | `RadioCards` | Resolved in A. |
| Resolution note | `Textarea` | Present. |
| Evidence | `FileList` | Present. |
| Activity thread | **`Comment`** + `Avatar` | **Gap.** `Timeline` records events; it cannot carry an author and a composer. |
| Item metadata | `DescriptionList` | Present. |
| Unmet-criterion warning | `Alert` | Present. |
| Irreversible confirm | `Dialog` | Present. |

## Separately requested

| Need | Resolved by | Notes |
| --- | --- | --- |
| Obsidian-style knowledge graph | **`KnowledgeGraph`** | Canvas-rendered, Barnes–Hut layout, radius by `sqrt(degree)`. 1,000 nodes at 0.81 ms/tick — 20× inside a 60fps frame. Benchmarked in `scripts/bench-graph.mjs`, gated in `pnpm check`. |

---

## Eight components built to close the gaps

`CardMedia` · `Quantity` · `RadioCards`/`RadioCard` · `Summary` · `TokenInput` ·
removable `Tag` · `Checklist` · `Comment` — plus `KnowledgeGraph`.

## What the workflows taught the system

Three things surfaced only because a whole flow was built, not a component in isolation:

1. **A flow needs a status line, not just buttons.** All three footers say when the draft
   last saved. Without it, "Back" reads as "lose my work". `FlowFooterStatus` existed but
   was under-specified; it is now documented as save state, never an action.
2. **Irreversible steps need their consequences enumerated, not described.** The close
   dialog lists what will be written, including the criterion that will record as an
   unknown. Prose saying "this cannot be undone" is not the same artifact.
3. **The unmet case is the design.** Every one of these flows has a state where the user
   proceeds with something outstanding. That is why `partial` is one of the six states,
   and why the close flow shows the gap rather than blocking on it.

## Still open

- **Validation-on-advance** in the flow shell — needs a form-state decision (native
  constraint validation vs a schema library). Tracked in `specs/flow.md`.
- **Graphs beyond ~5,000 nodes** would want WebGL and level-of-detail culling. The
  current renderer is honest to 5,000; past that it degrades rather than failing, and
  the benchmark will say so.
