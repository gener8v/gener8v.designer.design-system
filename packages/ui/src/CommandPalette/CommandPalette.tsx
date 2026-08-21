import { Fragment, useCallback, useEffect, useId, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useModalBehavior, mergeRefs } from '../useModalBehavior.js';

export interface Command {
  id: string;
  label: string;
  group?: string;
  /** Shown right-aligned — a shortcut or a location. */
  note?: ReactNode;
  icon?: ReactNode;
  /** Extra text matched against the query but never displayed. */
  keywords?: string;
  onRun: () => void;
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands: Command[];
  placeholder?: string;
  emptyMessage?: ReactNode;
}

/**
 * A command palette is a modal dialog, not a dropdown — it takes the page over
 * and must be dismissed, so it uses the same `useModalBehavior` as Dialog.
 *
 * Focus stays in the search field and the highlighted row is tracked with
 * `aria-activedescendant`, the same as Combobox: moving DOM focus into the list
 * would break typing, which is the only reason a palette exists.
 */
export function CommandPalette({
  open, onClose, commands, placeholder = 'Search commands…', emptyMessage = 'No matching command',
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const panelRef = useModalBehavior(open, onClose);
  const listId = useId();

  useEffect(() => { if (open) { setQuery(''); setActive(0); } }, [open]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      c.label.toLowerCase().includes(q) || (c.keywords ?? '').toLowerCase().includes(q));
  }, [commands, query]);

  const groups = useMemo(() => {
    const map = new Map<string, Command[]>();
    for (const c of matches) {
      const g = c.group ?? '';
      (map.get(g) ?? map.set(g, []).get(g)!).push(c);
    }
    return [...map.entries()];
  }, [matches]);

  const run = useCallback((c: Command) => { onClose(); c.onRun(); }, [onClose]);

  if (!open) return null;

  const activeCmd = matches[active];

  return (
    <div className="command-backdrop"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={mergeRefs(panelRef, null)} className="command"
        role="dialog" aria-modal="true" aria-label="Command palette" tabIndex={-1}>
        <div className="command-search">
          <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/></svg>
          <input
            className="command-input"
            autoFocus
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeCmd ? `${listId}-${activeCmd.id}` : undefined}
            aria-label="Search commands"
            placeholder={placeholder}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % Math.max(1, matches.length)); }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => (i - 1 + matches.length) % Math.max(1, matches.length)); }
              else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
              else if (e.key === 'End') { e.preventDefault(); setActive(matches.length - 1); }
              else if (e.key === 'Enter' && activeCmd) { e.preventDefault(); run(activeCmd); }
            }}
          />
          <span className="command-hint">esc</span>
        </div>

        <ul className="command-list" id={listId} role="listbox" aria-label="Commands">
          {matches.length === 0 && <li className="command-empty">{emptyMessage}</li>}
          {groups.map(([group, list]) => (
            <Fragment key={group || '_'}>
              {group ? <li className="command-group" role="presentation">{group}</li> : null}
              {list.map((c) => {
                const i = matches.indexOf(c);
                return (
                  <li key={c.id} id={`${listId}-${c.id}`} role="option"
                    aria-selected={i === active}
                    data-active={i === active ? '' : undefined}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => run(c)}
                    className="command-item">
                    {c.icon}
                    {c.label}
                    {c.note ? <span className="command-item-note">{c.note}</span> : null}
                  </li>
                );
              })}
            </Fragment>
          ))}
        </ul>

        <div className="command-footer">
          <span><span className="command-key">↑</span> <span className="command-key">↓</span> navigate</span>
          <span><span className="command-key">↵</span> run</span>
          <span><span className="command-key">esc</span> dismiss</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Binds ⌘K / Ctrl+K. Ignores the shortcut while the user is typing in a field,
 * so it cannot steal a keystroke from a form.
 */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'k' || !(e.metaKey || e.ctrlKey)) return;
      const el = document.activeElement;
      const typing = el instanceof HTMLElement
        && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));
      if (typing && !open) return;
      e.preventDefault();
      setOpen((v) => !v);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  return { open, setOpen, close: () => setOpen(false) };
}
