import type { HTMLAttributes } from 'react';
import { cx } from '../cx.js';

/**
 * A sheet a document sits on, and the page behind it.
 *
 * Use it for anything READ as a document. Anything SCANNED as data — a table, a tree, a split pane
 * — takes the full width instead, because the reader is looking across it rather than down it.
 *
 * The ground is not decoration. Without it the sheet is the same colour as everything else and the
 * shadow is an effect nobody can explain; with it, the page is what makes the sheet read as a
 * document rather than as text that ran out of room.
 */
export const PaperGround = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div {...rest} className={cx('paper-ground', className)} />
);

/** The sheet itself. Wider than the prose measure on purpose — a document carries tables and
 *  figures the paragraphs must not be narrowed to fit, and `.reader` still holds prose to 72ch
 *  inside it. */
export const Paper = ({ className, ...rest }: HTMLAttributes<HTMLElement>) => (
  <article {...rest} className={cx('paper', className)} />
);

/**
 * Something beside the sheet, on the ground — a table of contents, a provenance rail.
 *
 * NOT on the paper. Navigation is how you move around a document; it is not part of what the
 * document says, and giving it its own sheet makes two documents where there is one. A reader then
 * has to work out which of the two they are reading.
 *
 * It does not print, for the same reason: a contents list on paper is a list of places that are
 * not links to anything.
 *
 * It is held to the window and scrolls inside itself, so a contents list taller than the screen
 * still reaches its last entry. An app with a fixed top bar sets `--paper-aside-top` to the bar's
 * height plus a gap; the rail's sticky offset and its height both follow.
 */
export const PaperAside = ({ className, ...rest }: HTMLAttributes<HTMLElement>) => (
  <aside {...rest} className={cx('paper-aside', className)} />
);
