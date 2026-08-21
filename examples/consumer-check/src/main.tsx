/**
 * Packaging fixture. Not a design reference — see design/templates/ for those.
 *
 * The bundle half of the check: proves the `exports` map resolves under a
 * bundler and that `styles.css` is reachable through the package entry. The
 * assertions live in ../check.mjs, because a bundler does not execute what it
 * bundles.
 */
import '@gener8v/ui/styles.css';
import { Button } from '@gener8v/ui';
import { ArrowRight } from '@gener8v/icons';
import tokens from '@gener8v/tokens';

export const probe = { Button, ArrowRight, action: tokens['--color-action'] };
