# @gener8v/icons

The icons the GENER8V design system uses, taken from [Phosphor](https://phosphoricons.com) at
regular weight and shipped as tree-shakeable React components.

## Install

```bash
npm i @gener8v/icons
```

The package is public on npm under the MIT licence. It needs React 18 or later and nothing else.

## Use

```tsx
import { ArrowRight, Warning } from '@gener8v/icons';

<button className="btn btn-primary">Continue<ArrowRight /></button>
```

Every icon takes the normal SVG props and follows three rules:

- **Size comes from the text.** Icons are `1em` square, so they match the type around them.
  Inside `.btn` the CSS sets `1.15em`, so one icon works at every button size. To set a size
  directly, pass `width` and `height`.
- **Colour comes from the text.** The fill is `currentColor`. An icon never gets its own colour
  token, so the same glyph works on a light card and inside a filled button.
- **Hidden from screen readers by default.** An icon beside a label is decoration and is
  `aria-hidden`. Pass `aria-label` when the icon has to stand on its own. For an icon-only button,
  use `<Button iconOnly aria-label="…">` from `@gener8v/ui`, which makes the label required.

## The icons

Each icon has one meaning in GENER8V products. Use it for that meaning, so it reads the same on
every screen. The demo page at `design/foundations/icons.html` shows the same set; hover an icon
there to see what it is for.

<!-- icons:start -->
68 icons in 9 groups.

### Actions

Things a person does to what is on the screen.

| Icon | Phosphor source | Use it for |
|---|---|---|
| `ArrowsDownUp` | `arrows-down-up` | Changing the order of a list. A column's current direction is `CaretUp` or `CaretDown`. |
| `ArrowSquareOut` | `arrow-square-out` | Leaves the product: opens somewhere else, usually in a new tab. Never a link that stays inside the record. |
| `Copy` | `copy` | Copying a value to the clipboard — an ID, a link, a snippet — without leaving the surface. |
| `DotsThree` | `dots-three` | More, where the more is a menu rather than a page. |
| `DownloadSimple` | `download-simple` | Taking something out of the record, as a file somebody keeps. |
| `Funnel` | `funnel` | Narrowing what a list shows. The records stay; only the view changes. |
| `Link` | `link-simple` | One thing joined to another — built against, derived from. |
| `MagnifyingGlass` | `magnifying-glass` | Finding something already here, as against asking a question of it. |
| `Minus` | `minus` | Taking one away, or stepping a value down. The counterpart to `Plus`. |
| `PencilSimple` | `pencil-simple` | Editing something that already exists. `Note` is a note somebody wrote; this is the act of changing one. |
| `Plus` | `plus` | Adding one more of something the surface already lists. |
| `Trash` | `trash` | Deleting something for good. A product that keeps history archives or supersedes instead, and does not offer this. |
| `UploadSimple` | `upload-simple` | Putting material on the record. |
| `X` | `x` | Close or dismiss. Never delete — that is `Trash`. |

### Navigation

Moving between surfaces, and opening what is folded away.

| Icon | Phosphor source | Use it for |
|---|---|---|
| `ArrowLeft` | `arrow-left` | Back out of a surface to the one that opened it — the navigation `CaretLeft` is never used for. |
| `ArrowRight` | `arrow-right` | Forward, on a control that continues something rather than confirming it. |
| `CaretDown` | `caret-down` | A group that opens. The same chevron everywhere one does, so the state reads the same. |
| `CaretLeft` | `caret-left` | Back, within a set — a page, a step. Never navigation out of a surface. |
| `CaretRight` | `caret-right` | A group that is closed, and a rail item that leads somewhere. |
| `CaretUp` | `caret-up` | A group that is open and closes on click, and the ascending end of a sort. |
| `House` | `house` | The start of a product: the one place every surface can return to. |
| `List` | `list` | Navigation folded away on a narrow screen. Not a list of records — that is content, not a control. |
| `Settings` | `sliders-horizontal` | Settings: how the product is configured, as against the content it holds. |

### Status

The state of something, readable at a glance.

| Icon | Phosphor source | Use it for |
|---|---|---|
| `Bell` | `bell` | Something new the person has not seen yet. Notifications, not a message on the page. |
| `Check` | `check` | Done, or chosen. Never 'good' — a covered requirement is not a compliment. |
| `CheckCircle` | `check-circle` | Finished successfully, as a status. `Check` marks done or chosen; the circle makes it an outcome. |
| `CircleNotch` | `circle-notch` | Running, as a status label. A control that is loading uses the spinner, which animates; this glyph does not. |
| `Flag` | `flag-pennant` | Flagged rather than resolved — a contradiction, a held-open decision touched. |
| `Info` | `info` | Something worth knowing that changes nothing. Never a warning wearing a quieter colour. |
| `Question` | `question` | Help, or something not yet answered. Never an `Info` in disguise. |
| `Warning` | `warning` | Something is wrong and somebody has to act. Never used for absence. |
| `XCircle` | `x-circle` | Failed, as a status. `X` closes or dismisses; the circle makes it an outcome. |

### Records

The things a record holds.

| Icon | Phosphor source | Use it for |
|---|---|---|
| `Books` | `books` | A module: a governance library this project is measured against. |
| `CalendarBlank` | `calendar-blank` | A date — due, scheduled, held — as against a length of time. |
| `ChartBar` | `chart-bar` | Numbers drawn as a chart: a report, a metric. `Graph` is how things join; this is how much. |
| `Clock` | `clock` | How long something takes, or when in the day. `History` is the past of the record; this is time itself. |
| `Coverage` | `list-checks` | What a standard requires, and how much of it is covered. |
| `File` | `file` | A document on the record — uploaded, rendered, or cited. |
| `Folder` | `folder` | A place documents are kept, as against one document. |
| `Graph` | `graph` | The record as a shape: what is joined to what. |
| `History` | `clock-counter-clockwise` | How this project got that way, as against what is true now. |
| `Image` | `image` | Evidence that is a picture — a screenshot, a diagram somebody sent. |
| `Note` | `note-pencil` | Something a person wrote down, beside what was uploaded. |
| `Paperclip` | `paperclip` | Something attached to an item, as against a document on the record in its own right. |
| `Path` | `path` | A route through — a flow, a sequence of steps. |
| `Tag` | `tag` | A label a person applied to sort things. Not a status the system decided. |

### Communication

What people said, and the channel it came through.

| Icon | Phosphor source | Use it for |
|---|---|---|
| `ChatCircle` | `chat-circle` | A comment thread on the work. `Transcript` is what was said in a session; this is what people said about the work afterwards. |
| `EnvelopeSimple` | `envelope-simple` | Email: a message that arrives in, or goes out to, an inbox outside the product. |
| `Microphone` | `microphone-stage` | A voice: an interview, a session, somebody speaking. |
| `Transcript` | `chat-teardrop-text` | What was said, written down — a coded session. |

### People and agents

Who did the work. An agent is never drawn as a person.

| Icon | Phosphor source | Use it for |
|---|---|---|
| `Buildings` | `buildings` | An organisation — a client, a vendor, a party to the work — as against the people in it. |
| `Robot` | `robot` | An agent. Distinct from a person, deliberately and everywhere. |
| `Sparkle` | `sparkle` | Drafted by a model and waiting for a person. It labels the output; `Robot` is the agent that made it. |
| `UserCircle` | `user-circle` | One person, where a name alone would not read as a person. |
| `Users` | `users` | A group of people — a team, a directory. One person is `UserCircle`. |

### Access

Signing in, and what is private.

| Icon | Phosphor source | Use it for |
|---|---|---|
| `Key` | `key` | A credential a script uses, where no person is signed in. |
| `Lock` | `lock` | Private to the project it belongs to. |
| `SignIn` | `sign-in` | Signing in, on the sign-in screen and its button. |
| `SignOut` | `sign-out` | Signing out on purpose. Not for a session that expired. |

### Grounds

The three grounds an observation can rest on: said, observed, inferred.

| Icon | Phosphor source | Use it for |
|---|---|---|
| `Eye` | `eye` | Observed: seen happening, or a document shows it. One of the three grounds. |
| `Inferred` | `lightbulb-filament` | Inferred: concluded from what was said. This label must stay attached wherever the observation goes. |
| `Quotes` | `quotes` | Said: somebody stated it. One of the three grounds. |

### Governance

Whether a rule is in force, and what has moved underneath it.

| Icon | Phosphor source | Use it for |
|---|---|---|
| `ArrowsClockwise` | `arrows-clockwise` | Stale: work waiting on a rebuild because something it depends on changed. Other icon sets call this `RefreshCw`. |
| `GitDiff` | `git-diff` | A standard changed underneath a decision made against it. Other icon sets call this `GitCompareArrows`. |
| `Governed` | `shield-check` | In force. A module routed to, a rule being applied. |
| `Scales` | `scales` | A judgement made by weighing the evidence — an assessment, a ruling. |
| `Shelved` | `bookmark-simple` | Prepared, not in force — on the shelf. |
| `Stamp` | `stamp` | An approval: a named person signed off. |
<!-- icons:end -->

## Adding an icon

1. Look in the tables above first. If an icon already covers the meaning, use it.
2. Find the glyph in Phosphor at **regular** weight. Use no other weight: two weights in one
   interface look like two icon sets.
3. Copy an existing file in `src/` to `src/<Name>.tsx` and paste in the glyph's `path`.
4. In the doc comment, give the Phosphor name, one sentence on what the icon means here, and an
   `@group` from the tables above.
5. Export it from `src/index.ts`.
6. Run `pnpm build` from the repository root. This updates the tables in this file and the demo
   page.
7. Run `pnpm test`. The tests fail if an icon is not exported, has no stated meaning or group, or
   is missing from this file or the demo page.

**Names.** Use Phosphor's name (`MagnifyingGlass`, `ArrowsClockwise`) unless the icon stands for
a product concept. Then name it for the concept: `Governed` is Phosphor's `shield-check`, and
`Inferred` is `lightbulb-filament`.

## Why a subset

Phosphor has about 1,500 icons. A design system that ships all of them makes every product carry
1,500 glyphs to draw a few dozen. This set holds the icons GENER8V products need, and it grows
when a product needs a new one.

## Relationship to the other packages

This package does not depend on `@gener8v/ui` or `@gener8v/tokens`. The design system's static
HTML pages have no bundler, so they inline the same SVG paths instead of importing this package.
