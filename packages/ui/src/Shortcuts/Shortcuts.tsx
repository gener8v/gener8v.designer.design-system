import {
  createContext, forwardRef, useCallback, useContext, useEffect, useId, useMemo, useRef, useState,
} from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';
import { ShortcutList } from '../Keys/Keys.js';
import type { KeyChord, Shortcut } from '../Keys/Keys.js';
import { isTypingTarget, modalAbove, modified } from '../Keys/typing.js';
import { Choice, ChoiceHint, Switch } from '../Choice/Choice.js';

/** Where the single-key switch is kept unless the provider is given another key. */
export const SHORTCUTS_STORAGE_KEY = 'g8v.shortcuts';

/* ------------------------------------------------------------- storage */

/**
 * The stored switch: `true` unless it was turned off. Storage is a convenience — private modes,
 * blocked cookies and full quotas all throw — so a read that fails falls back to `fallback`.
 */
export function readSingleKeys(key: string = SHORTCUTS_STORAGE_KEY, fallback = true): boolean {
  try {
    const v = window.localStorage.getItem(key);
    return v === null ? fallback : v !== 'off';
  } catch {
    return fallback;
  }
}

/** Stores the switch. A write that fails is dropped: the switch still holds for this visit. */
export function writeSingleKeys(on: boolean, key: string = SHORTCUTS_STORAGE_KEY): void {
  try {
    window.localStorage.setItem(key, on ? 'on' : 'off');
  } catch {
    // Storage refused. The setting lives in memory until the page is left.
  }
}

/* ------------------------------------------------------------ bindings */

export interface ShortcutBinding {
  /**
   * The key, as `KeyboardEvent.key` names it: `'j'`, `'?'`, `'/'`, `'Enter'`, `'Escape'`,
   * `'ArrowDown'`. Several keys that do the same thing go in an array. A letter matches either case.
   */
  key: string | string[];
  /** What it does. Return `false` when there was nothing to do, so the key is left to the page. */
  run: (e: KeyboardEvent) => void | boolean;
  /** What it does, as a verb phrase in sentence case — listed in `ShortcutHelp`. Unlisted without it. */
  does?: ReactNode;
  /** How to draw the keys in the list, when the default (the key, upper-cased) is wrong: `[['1–9']]`. */
  keys?: KeyChord[];
  /** Off without removing it from the list's order. Default true. */
  when?: boolean;
}

export interface ShortcutsOptions {
  /** Off while the screen that binds these is not the one in front — a hidden tab, a closed pane. */
  enabled?: boolean;
  /** The heading these are listed under in `ShortcutHelp`: "Inbox", "Editor". */
  title?: ReactNode;
}

/** One screen's shortcuts, as `ShortcutHelp` lists them. */
export interface ShortcutGroup {
  id: string;
  title?: ReactNode;
  items: Shortcut[];
}

/** One thing Escape can close, top-most first: `{ open: menuOpen, close: closeMenu }`. */
export interface EscapeLayer {
  open: boolean;
  close: () => void;
}

/**
 * Closes the first open layer and reports whether it closed one. Escape takes things away one at a
 * time, top-most first — a popover, then a draft, then a search, then a selection — never all at
 * once. Return its result from a binding's `run` so an Escape with nothing to close is left alone.
 */
export function closeTopLayer(layers: EscapeLayer[]): boolean {
  const top = layers.find((l) => l.open);
  if (!top) return false;
  top.close();
  return true;
}

/** A key that types a character. WCAG 2.1.4 says these, used alone, must be possible to turn off. */
export const isSingleCharacter = (key: string) => [...key].length === 1;

const GLYPH: Record<string, string> = {
  ArrowDown: '↓', ArrowUp: '↑', ArrowLeft: '←', ArrowRight: '→', Escape: 'Esc', ' ': 'Space',
};
const drawKey = (k: string) => GLYPH[k] ?? (isSingleCharacter(k) ? k.toLocaleUpperCase() : k);
const keysOf = (b: ShortcutBinding) => (Array.isArray(b.key) ? b.key : [b.key]);
const listed = (bindings: ShortcutBinding[]): Shortcut[] => bindings
  .filter((b) => b.does !== undefined && b.does !== null && b.when !== false)
  .map((b) => ({ keys: b.keys ?? keysOf(b).map(drawKey), does: b.does }));
const matches = (pressed: string, key: string) => pressed === key
  || (isSingleCharacter(key) && pressed.toLocaleLowerCase() === key.toLocaleLowerCase());

/** Enter and Space on a button, a link or a tab are that control's, never the page's. */
const onControl = (target: EventTarget | null) => typeof HTMLElement !== 'undefined'
  && target instanceof HTMLElement
  && Boolean(target.closest('button, a[href], summary, [role="button"], [role="link"], [role="menuitem"], [role="option"], [role="tab"], [role="checkbox"], [role="switch"]'));

/* ------------------------------------------------------------- context */

interface ShortcutsContext {
  singleKeys: boolean;
  setSingleKeys: (on: boolean) => void;
  groups: ShortcutGroup[];
  register: (group: ShortcutGroup) => void;
  unregister: (id: string) => void;
}

const Ctx = createContext<ShortcutsContext | null>(null);

export interface ShortcutsProviderProps {
  children?: ReactNode;
  /**
   * Where the single-key switch is kept. Per person: put the signed-in person's id in it
   * (`g8v.shortcuts.${userId}`) when several people share a browser.
   */
  storageKey?: string;
  /** The switch before anyone has touched it. Default on. */
  defaultSingleKeys?: boolean;
}

/**
 * Owns the single-key switch and the list of what each screen binds, so one help surface can show
 * every shortcut on the page and the one switch that turns the single keys off.
 */
export function ShortcutsProvider({
  children, storageKey = SHORTCUTS_STORAGE_KEY, defaultSingleKeys = true,
}: ShortcutsProviderProps) {
  const [singleKeys, setOn] = useState(() => readSingleKeys(storageKey, defaultSingleKeys));
  const [groups, setGroups] = useState<ShortcutGroup[]>([]);

  const setSingleKeys = useCallback((on: boolean) => {
    setOn(on);
    writeSingleKeys(on, storageKey);
  }, [storageKey]);

  const register = useCallback((group: ShortcutGroup) => setGroups((list) => {
    const at = list.findIndex((g) => g.id === group.id);
    if (at < 0) return [...list, group];
    const next = list.slice();
    next[at] = group;
    return next;
  }), []);
  const unregister = useCallback((id: string) => setGroups((list) => list.filter((g) => g.id !== id)), []);

  const value = useMemo(
    () => ({ singleKeys, setSingleKeys, groups, register, unregister }),
    [singleKeys, setSingleKeys, groups, register, unregister],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/**
 * The single-key switch: `[on, setOn]`. Inside a `ShortcutsProvider` it is shared and stored;
 * outside one it reads the stored value once and holds changes for this mount only.
 */
export function useSingleKeyShortcuts(): [boolean, (on: boolean) => void] {
  const ctx = useContext(Ctx);
  const [local, setLocal] = useState(() => (ctx ? true : readSingleKeys()));
  if (ctx) return [ctx.singleKeys, ctx.setSingleKeys];
  return [local, setLocal];
}

/** Every group registered by `useShortcuts` under the nearest provider, in the order they mounted. */
export function useShortcutGroups(): ShortcutGroup[] {
  return useContext(Ctx)?.groups ?? [];
}

/**
 * Binds page keys for as long as the calling component is mounted, and lists the ones with a
 * `does` in `ShortcutHelp`.
 *
 * SINGLE KEYS STAND DOWN while somebody is typing in a field, while Ctrl, Meta or Alt is held (that
 * is somebody else's shortcut), and while the person has turned single-key shortcuts off. Shift is
 * allowed: `?` is a shifted key.
 *
 * ENTER AND SPACE on a button, a link or a tab belong to that control.
 *
 * ESCAPE is the exception to typing: it still works inside a field, so it can clear a search box.
 * Bind it with `closeTopLayer` and it closes one thing per press. Anything that handles Escape
 * itself — a dialog, an open list — calls `preventDefault` or `stopPropagation`, and this stands
 * down.
 *
 * NEVER UNDER A DIALOG. While a modal surface is open, the page's keys belong to it.
 */
export function useShortcuts(bindings: ShortcutBinding[], { enabled = true, title }: ShortcutsOptions = {}): void {
  const ctx = useContext(Ctx);
  const [singleKeys] = useSingleKeyShortcuts();
  const latest = useRef({ bindings, singleKeys });
  latest.current = { bindings, singleKeys };

  useEffect(() => {
    if (!enabled) return;
    function onKey(e: KeyboardEvent) {
      if (e.defaultPrevented || modalAbove(null)) return;
      const { bindings: list, singleKeys: on } = latest.current;
      const escape = e.key === 'Escape';
      if (!escape && (modified(e) || isTypingTarget(e.target))) return;
      if ((e.key === 'Enter' || e.key === ' ') && onControl(e.target)) return;
      for (const b of list) {
        if (b.when === false) continue;
        const key = keysOf(b).find((k) => matches(e.key, k));
        if (key === undefined) continue;
        if (isSingleCharacter(key) && !on) return;
        if (b.run(e) === false) continue;
        e.preventDefault();
        return;
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled]);

  // Register what is listed. Re-registered only when what it would show changes, so a screen that
  // re-renders on every key does not re-render the help surface with it.
  const id = useId();
  const items = listed(bindings);
  const signature = JSON.stringify([
    enabled, typeof title === 'string' ? title : null,
    items.map((s) => [s.keys, typeof s.does === 'string' ? s.does : null]),
  ]);
  const shown = useRef({ items, title });
  shown.current = { items, title };
  const register = ctx?.register;
  const unregister = ctx?.unregister;
  useEffect(() => {
    if (!register || !enabled) return;
    const { items: now, title: heading } = shown.current;
    register({ id, items: now, ...(heading !== undefined ? { title: heading } : {}) });
  }, [register, id, enabled, signature]);
  useEffect(() => {
    if (!unregister) return;
    return () => unregister(id);
  }, [unregister, id, enabled]);
}

/* ---------------------------------------------------------------- help */

export interface ShortcutHelpLabels {
  /** The switch. Default "Single-key shortcuts". */
  toggle?: ReactNode;
  /** Under the switch. Default says what turning it off does. */
  hint?: ReactNode;
  /** When nothing is bound. Default "This page has no keyboard shortcuts." */
  empty?: ReactNode;
}

export interface ShortcutHelpProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** What to list. Defaults to every group registered under the nearest `ShortcutsProvider`. */
  groups?: ShortcutGroup[];
  /** Show the switch for single-key shortcuts. Default true — WCAG 2.1.4 wants it findable. */
  toggle?: boolean;
  labels?: ShortcutHelpLabels;
}

/**
 * The content of a "?" sheet: every shortcut the page binds, grouped by screen, and the switch
 * that turns single-key shortcuts off. Put it in a `Dialog`, a `Drawer` or a settings panel; it
 * draws no surface of its own.
 */
export const ShortcutHelp = forwardRef<HTMLDivElement, ShortcutHelpProps>(function ShortcutHelp(
  { groups, toggle = true, labels = {}, className, ...rest }, ref,
) {
  const registered = useShortcutGroups();
  const [on, setOn] = useSingleKeyShortcuts();
  const list = (groups ?? registered).filter((g) => g.items.length);
  const base = useId();
  return (
    <div {...rest} ref={ref} className={cx('stack', className)}>
      {list.length === 0 ? <p>{labels.empty ?? 'This page has no keyboard shortcuts.'}</p> : list.map((g, i) => (
        <section key={g.id} className="stack stack-sm" aria-labelledby={g.title ? `${base}-${i}` : undefined}>
          {g.title ? <p id={`${base}-${i}`} className="label">{g.title}</p> : null}
          <ShortcutList items={g.items} />
        </section>
      ))}
      {toggle ? (
        <Choice>
          <Switch checked={on} onChange={(e) => setOn(e.currentTarget.checked)} />
          <span>
            {labels.toggle ?? 'Single-key shortcuts'}
            <ChoiceHint>{labels.hint ?? 'When off, a letter, number or symbol key on its own does nothing. Arrows, Enter and Escape still work.'}</ChoiceHint>
          </span>
        </Choice>
      ) : null}
    </div>
  );
});
