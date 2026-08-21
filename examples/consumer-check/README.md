# Consumer check

**This is not a design reference.** It renders nothing anyone should look at and
copies nothing anyone should start from. For a starting point, use
`design/templates/` — those are designed screens.

Its only job is to be a package *consumer*: it resolves the `exports` maps,
typechecks against the shipped `.d.ts`, pulls `styles.css` through the package
entry, and bundles. That is the one thing a test inside the monorepo cannot
check — those tests import from `src/` and pass even when the `exports` map,
the `files` allowlist, or the emitted types are wrong.

It asserts **every** named export is defined, so a broken entry point fails the
build rather than surfacing in an engagement.

```
pnpm verify:consumer
```
