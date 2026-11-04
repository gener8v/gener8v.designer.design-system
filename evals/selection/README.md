# Component-selection eval

This eval measures one thing. You give Claude a design task, and Claude has this repository's
Claude Code plugin (`.claude-plugin/`, `skills/gener8v-design-system/`). Does Claude pick the
correct components and the correct starting template?

Use the score as a regression signal and an improvement signal for the skill's guidance. Run the
eval before and after you change `SKILL.md`, the references or the component docs. Then compare
the two reports.

The eval is not part of `pnpm check`. It calls the model, it costs money, and it gives a
different result on each run.

## Run it

It runs locally only, on your own Claude Code login (`claude` on your `PATH`). There is
deliberately no CI workflow for it and no API key: it is a tool for whoever is changing the
skill's guidance, run on their machine before and after the change.

```sh
pnpm eval:selection                         # every case, once, on Sonnet
pnpm eval:selection --repeat 3              # three runs per case: the report gives the mean and the spread
pnpm eval:selection --cases 'data-*'        # a glob over case ids; use commas for more than one
pnpm eval:selection --model opus --label opus-try
pnpm eval:selection:dry                     # no model: score the recorded outputs in recorded/
pnpm eval:selection:test                    # unit tests for the scorer and the case files
```

| Option | Default | Effect |
| --- | --- | --- |
| `--cases <glob>` | `*` | Selects the cases by id |
| `--repeat N` | 1 | Runs each case N times |
| `--model <id>` | `sonnet` | Sets the model alias or the full model id that is passed to `claude --model` |
| `--label <name>` | the model | Sets the name of the result files |
| `--concurrency N` | 4 | Sets the number of runs at the same time |
| `--max-turns N` | 40 | Sets the turn limit for each run |
| `--record <dir>` | — | Saves each run (the files it wrote, the paths it read, its final message and its cost) as `<case>.<rep>.json`, plus `_meta.json` |
| `--from <dir>` | — | Scores the saved runs in a `--record` directory again with the current scorer and cases, and does not call the model. Cost and time come from the original runs |
| `--keep` | — | Keeps each run's temporary project |
| `--dry-run` | — | Is the same as `--from recorded/`: it scores the fixtures and does not call the model |

When you change the scorer, use `--record` together with `--from`. Then you can measure the
change on the same model outputs, and you do not pay for the runs again. The runner replaces
local paths with `<project>`, `<plugin>` and `~` in everything that it saves.

## What one run does

1. The runner copies `fixture/consumer/` to a temporary directory. This is a minimal React app
   whose `package.json` depends on `@gener8v/ui`, so the skill triggers on the task.
2. The runner starts headless Claude Code in that directory:
   `claude -p … --plugin-dir <repo> --add-dir <repo> --setting-sources project
   --strict-mcp-config --tools Read,Glob,Grep,Write,Edit,Skill --permission-mode acceptEdits`.
   - Only this plugin loads. No user settings, other plugins, hooks or MCP servers load.
   - Claude can read the design-system docs, because an installed copy of the plugin contains
     them.
   - Claude cannot run commands.
3. The prompt is the case's task, after a fixed preamble (`PREAMBLE` in `lib/claude.mjs`). The
   preamble tells Claude to write the code under `src/` and to name the template that it started
   from, if any.
4. The scorer reads each file that the run created or changed, the final message, and the paths
   that Claude read or searched.

The runner records the model that the CLI reports for each run (for example
`claude-sonnet-5-5`) in the result.

### Why not `claude plugin eval`

The built-in `claude plugin eval` can load this plugin and run a prompt. But its deterministic
graders are `regex`, `tool_used`, `tool_order` and `file_exists`, and it has no script grader.
Thus it cannot do these things:

- parse imports and JSX,
- calculate recall over groups,
- separate a system `Tabs` from a hand-written `Tabs`,
- aggregate the results by family.

Its `llm` grader is a model judge, and this eval does not use one for the core score. This
runner uses the same headless CLI and keeps the scoring in plain code.

## Cases

Each case is one file at `cases/<id>.json`:

```json
{
  "id": "navigation-detail-sections",
  "family": "navigation",
  "groups": ["tabs-segmented-filter"],
  "prompt": "A customer detail page has Overview, Invoices, Contacts and Activity sections. …",
  "expect": ["Tabs"],
  "expect_any": [],
  "forbid": [{ "component": "Segmented", "reason": "A radiogroup that narrows content; it does not swap panels" }],
  "template": null
}
```

| Field | Meaning |
| --- | --- |
| `family` | One of `screens`, `status-and-feedback`, `navigation`, `data`, `input`, `reading`, `agents-and-live-work` |
| `groups` | The confusable groups that the case tests (for example `tabs-segmented-filter`, `alert-toast-state-callout`, `dialog-drawer-popover`, `table-pager`, `select-combobox-menu`, `progress-stepper`, `stat-meter-charts`, `empty-error`). These are for reporting only |
| `prompt` | The task, in the words of the task. **Do not name a component.** The unit test fails if a prompt contains an expected component name |
| `expect` | A good answer must use every item in this list |
| `expect_any` | A list of groups. Each group passes when the answer uses one member |
| `forbid` | Tempting wrong picks. Each one has a `reason` |
| `template` | The `design/templates/<name>` that a screen should start from, or `null` |

### The tokens in `expect`, `expect_any` and `forbid`

| Token | Matches |
| --- | --- |
| `Tabs` | A name that is imported from `@gener8v/ui` and is used in the file. A component that you write with the same name does not match. The component's root class (`CLASS_ALIASES` in `lib/score.mjs`) also matches, so markup that is written by hand counts |
| `.tabs` | That class token in `className`, `class` or `cx(…)` |
| `pkg:recharts` | An import from that package |
| `<select>` | That native element |
| `attr:title` | A `title` attribute on a native element (rule 19) |

### Add a case

1. Write the task as a person would ask for it, in a general product domain. Do not use client
   names.
2. Read the component before you write an expectation:
   - `packages/ui/src/<Component>/` (the doc comment says when to use it and when not to),
   - `design/readme.md`,
   - `docs/specs/`,
   - `design/components/*.html`.
3. Make `expect` contain only what every correct answer needs. If two answers are correct, use
   `expect_any`. Use `forbid` only for a pick that the docs reject, and copy the docs' reason.
4. Run `pnpm eval:selection:test`. This test checks each name against the exports of
   `@gener8v/ui`, each template against `design/templates/`, and each prompt for leaked names.
5. Run the new case a few times:
   `pnpm eval:selection --cases <id> --repeat 3`.

## Scoring

The score is deterministic. No model judges the output.

- **Recall** = (the `expect` items that the answer used + the `expect_any` groups that the answer
  satisfied) / (the number of `expect` items + the number of `expect_any` groups).
- **Forbidden pick**: one or more `forbid` items occur anywhere in the produced code.
- **Template match** (only for cases that set `template`): the run read a file under
  `design/templates/<name>/`, or named that path in its code or its final message.
- **Pass**: recall is 1, there is no forbidden pick, and the template matches (when a template is
  set).

The report also gives these diagnostics. They are not part of the score:

- **Skill invoked**: the rate at which the runs invoked the skill.
- **Runs importing `@gener8v/ui`**: an answer that writes the system's classes by hand still
  passes. This rate shows how often the answer used the React components instead.
- **What the runs read**: for each documentation area (`references/`, `references/choosing/`, `design/readme.md`,
  `design/components/`, `design/templates/`, `docs/specs/`, `packages/ui/src/`), the share of
  runs that opened or searched it, and the pass rate with and without that read. Use it to find
  the cause of a miss. Either the guidance did not reach the model, or the model read the
  guidance and chose wrong.

The results are aggregated for each family, for each confusable group and overall. For each
repetition, the runner calculates the pass rate and the mean recall. The report gives the mean
over the repetitions, with the lowest and the highest repetition in brackets.

### What the score means, and what it does not mean

- A high pass rate means that, for these tasks, the guidance points Claude to the component that
  the docs say is correct.
- The score does not measure:
  - visual quality,
  - accessibility,
  - token use,
  - whether the code compiles.
- A forbidden component that the answer uses for a different purpose on the same screen still
  counts as a forbidden pick. For this reason, the cases forbid only a small number of picks.
- With 38 cases, one case is about 2.6 points of pass rate. Treat a difference smaller than the
  spread between repetitions as noise.

## Read the report

Each run writes these files:

- `results/<date>-<label>.json`: the meta, the overall and per-family and per-group figures, each
  case, and each run (what the run used, what was missing, the forbidden picks, the templates it
  saw, the cost, the turns and the start of the final message).
- `results/<date>-<label>.md`:
  - the overall table,
  - the per-family table,
  - the per-group table,
  - **Failing cases, worst first**, which shows what was missing and what Claude picked
    instead,
  - all cases, with the rate at which the skill was invoked.

The result files are ignored by git. The exception is a baseline that you save deliberately as
`results/baseline-<name>.{json,md}`. `baseline-main` is the measurement on `main` before the
choosing guide. It is 38 cases × 3 repeats on Sonnet (`claude-sonnet-5-5`), and it was scored
again with `--from` after the class aliases for `Button` and the chart marks were added.

To save a new baseline, follow these steps:

1. Run `pnpm eval:selection --repeat 3 --record <dir> --label baseline-<name>`.
2. Rename the two result files to `results/baseline-<name>.{json,md}`.
3. Commit the two files.

## Files

- `run.mjs`: the command-line interface, the case loading and the run pool.
- `lib/claude.mjs`: one headless run, and the parsing of the transcript.
- `lib/score.mjs`: the extraction and the per-run score.
- `lib/report.mjs`: the aggregation and the markdown report.
- `cases/`: one JSON file for each case.
- `fixture/consumer/`: the minimal consumer app that each run starts from.
- `recorded/`: the recorded run outputs for `--dry-run` and the unit test.
- `test/score.test.mjs`: the unit tests for the scorer and the cases. These tests do not call a
  model.
