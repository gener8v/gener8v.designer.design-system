import { Fragment, forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

/**
 * A key, drawn as the key: `J`, `Enter`, `?`.
 *
 * The element HTML already has for it, `<kbd>`, so a screen reader and a copy-paste both get the
 * key's name. Arrows and modifiers are written as the reader sees them on the keyboard (`←`, `⇧`);
 * `ShortcutList` gives those glyphs a spoken name ("Left Arrow") for assistive tech.
 */
export const Kbd = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function Kbd(
  { className, ...rest }, ref,
) {
  return <kbd {...rest} ref={ref} className={cx('kbd', className)} />;
});

/** One way to press it: a single key (`'J'`) or a chord pressed together (`['⇧', '?']`). */
export type KeyChord = string | string[];

export interface Shortcut {
  /** Alternatives, any of which does it — `['J', '↓']`. Each may itself be a chord. */
  keys: KeyChord[];
  /** What it does, as a verb phrase in sentence case — "Next item". */
  does: ReactNode;
}

export interface ShortcutListProps extends Omit<HTMLAttributes<HTMLDListElement>, 'children'> {
  items: Shortcut[];
}

/** Names for the glyphs, so a screen reader does not read "rightwards arrow". */
const SPOKEN: Record<string, string> = {
  '←': 'Left Arrow', '→': 'Right Arrow', '↑': 'Up Arrow', '↓': 'Down Arrow',
  '⇧': 'Shift', '⌘': 'Command', '⌥': 'Option', '⌃': 'Control', '↵': 'Enter', '⎋': 'Escape',
};

const KeyCap = ({ k }: { k: string }) => SPOKEN[k]
  ? <Kbd><span aria-hidden="true">{k}</span><span className="sr-only">{SPOKEN[k]}</span></Kbd>
  : <Kbd>{k}</Kbd>;

/**
 * Keys and what each does — the content of a "?" sheet, or the foot of a panel that binds keys.
 *
 * A description list: the keys are the term, what they do is the description, which is the
 * relationship a screen reader announces. Alternatives are separated by "or"; a chord's keys are
 * joined by a "+" that is drawn but not read, so "Shift ?" is heard rather than "Shift plus ?".
 *
 * NOT `.key-list`. That is the integrations family's list of API keys; this is keyboard keys.
 */
export const ShortcutList = forwardRef<HTMLDListElement, ShortcutListProps>(function ShortcutList(
  { items, className, ...rest }, ref,
) {
  return (
    <dl {...rest} ref={ref} className={cx('shortcut-list', className)}>
      {items.map((s, i) => (
        <div key={i} className="shortcut">
          <dt className="shortcut-keys">
            {s.keys.map((chord, ci) => (
              <Fragment key={ci}>
                {ci > 0 && <span className="shortcut-or">or</span>}
                {Array.isArray(chord)
                  ? chord.map((k, ki) => (
                    <Fragment key={ki}>
                      {ki > 0 && <span className="shortcut-plus" aria-hidden="true">+</span>}
                      <KeyCap k={k} />
                    </Fragment>
                  ))
                  : <KeyCap k={chord} />}
              </Fragment>
            ))}
          </dt>
          <dd className="shortcut-does">{s.does}</dd>
        </div>
      ))}
    </dl>
  );
});
