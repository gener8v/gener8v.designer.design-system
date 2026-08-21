# Example: engagement app

The starting point for a client application, and the design system's **consumer
test**. It imports the packages the way an engagement would — nothing on the page
is styled locally.

```bash
pnpm --filter @gener8v/example-engagement-app dev      # localhost:4400
```

It exists for two reasons:

1. **To start an engagement from.** Copy the directory, swap the content, keep the
   imports. The layout, the control scale and the tokens are already correct.
2. **To prove the packaging.** `pnpm verify:consumer` typechecks and builds it
   against the built packages. That is the only check that exercises the real
   `exports` maps, the `files` allowlists and the shipped `.d.ts` — a unit test
   inside the monorepo would pass even if none of those were right.
