# Adoption prompts

Three, by how much access the other side has. Use the smallest one that fits —
a prompt that repeats what the system can already read is noise.

---

## 1 · claude.ai, design system connected

The picker already says GENER8V. Nothing to paste — just ask for the screen.
Only worth saying anything if output drifts:

> Follow the connected GENER8V design system exactly: its class names, its tokens,
> its rules. Do not invent parallel classes or hard-code any colour, font or px value.

---

## 2 · A repository (Claude Code, Cursor, a developer)

> This project uses the GENER8V design system.
>
> Install it: `npm i @gener8v/ui @gener8v/tokens @gener8v/icons` — public on npm,
> no auth needed. Then `import
> '@gener8v/ui/styles.css'` once, at the app root.
>
> Build with the components and class names it ships. The React components render the
> same classes as the system's static HTML, so either form ports to the other. Take
> every colour, font, space, radius and shadow from its CSS variables — never hard-code
> a hex, a font name, or a px value the tokens already carry.
>
> The full guide is `design/readme.md` in github.com/gener8v/gener8v.designer.design-system,
> and `design/templates/` holds designed screens to start from. In Claude Code, run
> `/plugin marketplace add gener8v/gener8v.designer.design-system` and the rules load
> automatically.
>
> Before calling UI work done, check it against the ten rules in that readme.

---

## 3 · Standalone — no repo, no registry, no plugin

Self-contained. Paste where the system can read nothing of ours.

> Build this using the GENER8V design system. It is a light, airy, professional
> interface for a firm delivering AI into regulated, governed and auditable
> environments. Follow it exactly.
>
> **Colour.** Ground `#FFFFFF`, raised surface `#F7F9FC`, body text `#111827`.
> The action colour — what fills a primary button — is `#1547B7`; hover `#0C307E`,
> pressed `#071C4A`. The accent `#2563EB` is for focus rings, links and atmosphere,
> never a button fill. Neutrals run near-white `#F2F4F7` to cool ink `#182030` with
> chroma *rising* toward the dark end, so shadows read cool and highlights stay
> near-white. Status is reserved: success `#059669`, warning `#D97706`, danger
> `#DC2626` — never reuse them as decoration. Keep chroma low everywhere else.
>
> **Type.** Inter for headings and body; IBM Plex Mono for section markers, technical
> labels and all figures. **Headings are weight 500 and never heavier** — hierarchy
> comes from size and space, and this single restraint is most of what "airy" means
> here. Body 16px on 1.65 line height. Figures are tabular.
>
> **Space and shape.** A 4px scale — 4, 8, 12, 16, 24, 32, 48, 64, 96 — with no
> fractional pixels anywhere. Radius 6px on controls, 10px on cards. Section rhythm is
> large: 80px block padding is the default. Buttons, inputs and selects share one
> height scale, 44px at default, so a field and the button beside it line up.
> Elevation is a 1px hairline plus a wide faint shadow — never a heavy drop shadow.
>
> **Rules that are not preferences:**
> 1. One primary button per view.
> 2. State lives in ARIA — `aria-current`, `aria-selected`, `aria-expanded`,
>    `aria-invalid`, `aria-sort` — and the styling reads that attribute. There is no
>    `.is-active` class.
> 3. No gradients. One flat saturated band per page at most; everywhere else is quiet.
> 4. Every interactive control clears 44px, and keyboard focus is a 2px accent ring at
>    2px offset. Never remove the focus ring.
> 5. Grey `#8991A0` must not carry text — it is 3.17:1 on white. Secondary copy uses
>    `#697181`.
> 6. Charts: one y-axis, always. Bars sit on zero. Never reuse a status colour as a
>    data series.
> 7. Ship all six states — loading, empty, **partial**, error, denied, success. Partial
>    is the one that matters: a figure computed from three of five sources must say so.
> 8. An irreversible action enumerates what it will write. "This cannot be undone" is
>    not the same artifact as a list the user can check.
> 9. A masked secret is never in the DOM until revealed, and copying one never requires
>    revealing it.
> 10. Reach for whitespace before a divider.
>
> Left-aligned and asymmetric: flush-left headings, content hugging the left edge with
> whitespace carried on the right.
