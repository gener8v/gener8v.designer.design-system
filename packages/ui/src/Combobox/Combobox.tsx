import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cx } from '../cx.js';
import { useAnchoredPosition } from '../useAnchoredPosition.js';

export interface ComboboxOption {
  value: string;
  label: string;
  note?: ReactNode;
  disabled?: boolean;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  label: ReactNode;
  placeholder?: string;
  /** Case-insensitive substring by default. */
  filter?: (option: ComboboxOption, query: string) => boolean;
  /** Shown when the query matches none of the options. */
  emptyMessage?: ReactNode;
  /**
   * Shown when there are NO options at all, which is a different fact and used
   * to be reported as the first one.
   *
   * A field offering an empty list told the reader "no match for what you
   * typed" before they had typed anything — an answer to a question nobody
   * asked, about a search that never ran. Absence has to name its cause here
   * too: nothing to choose from is a state of the record, not a state of the
   * query.
   */
  noOptionsMessage?: ReactNode;
  /**
   * Accept a value the list does not hold. The typed text commits on Enter or
   * on leaving the field, and arrives through `onChange` like any option.
   *
   * For the field that offers what is known but must not REFUSE what is not —
   * a subject, a tag, an owner who has yet to be invited. Without it such a
   * field needs a combobox AND a text input beside it, and a reader then has
   * to work out which of the two the form is actually listening to.
   */
  allowCustom?: boolean;
  /**
   * Hide the label visually, keeping it for assistive technology. For a field
   * whose purpose is already stated beside it — a filter in a table toolbar,
   * a search box under its own heading.
   *
   * It is NOT the default, though it was: the component rendered every label
   * `sr-only` while `components/inputs.html` showed a visible one, so a form
   * built from the gallery and a form built from the component did not agree,
   * and the only field on a page with no label a sighted reader could see was
   * always this one.
   */
  labelHidden?: boolean;
  invalid?: boolean;
  id?: string;
  disabled?: boolean;
}

const defaultFilter = (o: ComboboxOption, q: string) =>
  o.label.toLowerCase().includes(q.trim().toLowerCase());

/**
 * The ARIA 1.2 combobox pattern. Focus stays in the input the whole time; the
 * highlighted option is tracked with `aria-activedescendant` rather than by
 * moving DOM focus. Moving focus into the list would break typing, which is
 * the entire point of a combobox.
 */
export function Combobox({
  options, value, onChange, label, placeholder,
  filter = defaultFilter, emptyMessage = 'No matches',
  noOptionsMessage, allowCustom = false,
  labelHidden = false, invalid = false, id, disabled = false,
}: ComboboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const listId = `${inputId}-listbox`;

  /**
   * WHAT THE COMMITTED VALUE IS CALLED — A STRING, NOT THE OPTION IT CAME FROM.
   *
   * This was the matched option, and every reader of it below wanted only its
   * label. The effect that syncs the input's text depended on that object, so a
   * caller writing `options={xs.map(...)}` — a fresh array holding the same
   * things — got a fresh match on every render, the effect firing on every
   * render, and a render scheduled by every fire. React ends that with "Maximum
   * update depth exceeded", and the field is dead from the moment somebody
   * picks something.
   *
   * **It made every consumer responsible for holding a list still**, and it did
   * not say so: the fault appears only in a real browser, because under jsdom
   * the width measured on opening never changes and the render that feeds the
   * cycle never happens. Ten pickers in one consuming application had it.
   *
   * A label is a string. Two renders that mean the same thing compare equal,
   * and no caller has to arrange that.
   *
   * Not memoised, deliberately: a value that compares by equality needs no
   * cached identity, and a `useMemo` here would only suggest it has one.
   */
  const selectedLabel = ((): string => {
    const match = options.find((o) => o.value === value) ?? null;
    if (match) return match.label;
    // A custom value is its own label. Without this the effect below resets the
    // query to '' on every render and the text disappears as it is typed.
    return allowCustom && value ? value : '';
  })();
  const [query, setQuery] = useState(selectedLabel);
  const [open, setOpen] = useState(false);
  // -1 means "open, but nothing highlighted yet". Opening the list must not
  // pre-select, or the first ArrowDown silently skips the first option.
  const [active, setActive] = useState(-1);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const { style } = useAnchoredPosition({
    open, anchorRef: wrapRef, floatingRef: listRef, placement: 'bottom', align: 'start',
  });

  /** The field's width, handed to the list so it is the field's list rather than a popup that
   *  happens to be near it. Measured on open: the field can be resized by its container between
   *  one opening and the next. */
  const [anchorWidth, setAnchorWidth] = useState<number | null>(null);
  useEffect(() => {
    if (!open) return;
    const measure = () => setAnchorWidth(wrapRef.current?.getBoundingClientRect().width ?? null);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [open]);

  // The query is a draft; the committed value stays authoritative until the
  // user picks something, so an abandoned edit reverts rather than clearing.
  useEffect(() => { setQuery(selectedLabel); }, [selectedLabel]);

  /**
   * WHAT THE FIELD WILL TAKE, AS A THING YOU CAN PICK.
   *
   * `allowCustom` used to be invisible: a list holding nothing said "Nothing to choose from yet",
   * which is the one message that is never true of a field that accepts anything. Somebody who
   * needed a subject the record did not have yet read that as a dead end and asked how to create
   * one — and the answer, "type it and leave the field", was written nowhere on the screen.
   *
   * So the offer is an OPTION rather than a sentence: it carries what you typed, it is clickable,
   * arrow keys reach it, and it commits through the same `commit` every other row uses. A hint
   * saying you may type would have been words doing a control's job.
   */
  const custom = useMemo(() => {
    if (!allowCustom) return null;
    const typed = query.trim();
    if (!typed || typed === selectedLabel) return null;
    if (options.some((o) => o.label.toLowerCase() === typed.toLowerCase())) return null;
    return { value: typed, label: typed, note: 'use as typed' } as ComboboxOption;
  }, [allowCustom, query, options, selectedLabel]);

  const matches = useMemo(() => {
    const found = query && query !== selectedLabel ? options.filter((o) => filter(o, query)) : options;
    // LAST. What the list already holds is the better answer when it holds one — the whole reason
    // the picker exists is that a second name for a thing the record already names is a thing
    // nobody finds later.
    return custom ? [...found, custom] : found;
  }, [options, query, filter, selectedLabel, custom]);
  const enabled = useMemo(() => matches.filter((o) => !o.disabled), [matches]);

  const commit = useCallback((option: ComboboxOption) => {
    onChange(option.value);
    setQuery(option.label);
    setOpen(false);
  }, [onChange]);

  /** Text that matched nothing, taken at its word. Empty clears rather than
   *  committing '' — a field left blank is unset, not set to nothing. */
  const commitText = useCallback((text: string) => {
    const trimmed = text.trim();
    onChange(trimmed || null);
    setQuery(trimmed);
    setOpen(false);
  }, [onChange]);

  /** Leaving the field with text the list does not hold. With `allowCustom`
   *  that text IS the answer, so reverting it would discard what was typed. */
  const leaving = useCallback(() => {
    if (allowCustom && query !== selectedLabel) { commitText(query); return true; }
    return false;
  }, [allowCustom, query, selectedLabel, commitText]);

  const close = useCallback((revert: boolean) => {
    setOpen(false);
    if (revert) setQuery(selectedLabel);
  }, [selectedLabel]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t) || listRef.current?.contains(t)) return;
      // Dismissing by clicking away is still leaving the field, so a custom
      // value commits here exactly as it does on Tab. This ran before the
      // input's own blur and reverted the query out from under it.
      if (leaving()) return;
      close(true);
    };
    document.addEventListener('mousedown', onDown, true);
    return () => document.removeEventListener('mousedown', onDown, true);
  }, [open, close, leaving]);

  // Keep the highlighted option scrolled into view as the arrows move.
  useEffect(() => {
    if (!open || !listRef.current) return;
    // Optional call: scrollIntoView is absent in jsdom and in some embedded
    // renderers. Scrolling is an enhancement; it must not throw.
    const el = listRef.current.querySelector('[data-active]');
    (el as HTMLElement | null)?.scrollIntoView?.({ block: 'nearest' });
  }, [open, active]);

  const move = (delta: number) => {
    if (enabled.length === 0) return;
    setActive((i) => {
      if (i < 0) return delta > 0 ? 0 : enabled.length - 1;
      return (((i + delta) % enabled.length) + enabled.length) % enabled.length;
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) { setOpen(true); setActive(0); } else move(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!open) { setOpen(true); setActive(enabled.length - 1); } else move(-1);
        break;
      case 'Home': if (open) { e.preventDefault(); setActive(0); } break;
      case 'End': if (open) { e.preventDefault(); setActive(enabled.length - 1); } break;
      case 'Enter': {
        if (!open) return;
        const option = active >= 0 ? enabled[active] : undefined;
        if (option) { e.preventDefault(); commit(option); }
        else if (allowCustom && query.trim()) { e.preventDefault(); commitText(query); }
        break;
      }
      case 'Escape':
        e.preventDefault();
        if (open) close(true);
        else { setQuery(''); onChange(null); }
        break;
      case 'Tab':
        // Ordered: a custom value commits, and only an unchanged field reverts.
        if (leaving()) break;
        if (open) close(true);
        break;
    }
  };

  const activeId = open && active >= 0 && enabled[active] ? `${listId}-${enabled[active]!.value}` : undefined;

  return (
    <div className="combobox" ref={wrapRef}>
      <label className={cx('field-label', labelHidden && 'sr-only')} htmlFor={inputId}>{label}</label>
      <input
        ref={inputRef}
        id={inputId}
        className="input"
        type="text"
        role="combobox"
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        value={query}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        aria-invalid={invalid || undefined}
        onChange={(e) => { setQuery(e.target.value); setActive(-1); setOpen(true); }}
        onClick={() => { if (!disabled) setOpen(true); }}
        onKeyDown={onKeyDown}
        onBlur={(e) => {
          if (listRef.current?.contains(e.relatedTarget as Node)) return;
          if (leaving()) return;
          close(true);
        }}
      />
      <button type="button" className="combobox-trigger" tabIndex={-1} disabled={disabled}
        aria-label={open ? 'Close suggestions' : 'Show suggestions'}
        onClick={() => { setOpen((v) => !v); inputRef.current?.focus(); }}>
        <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/></svg>
      </button>

      {open && (
        <ul ref={listRef} id={listId} role="listbox" aria-label={typeof label === 'string' ? label : undefined}
          style={anchorWidth ? { ...style, ['--anchor-w' as string]: `${anchorWidth}px` } : style}
          className="listbox">
          {matches.length === 0 && (
            <li className="listbox-empty">
              {options.length === 0
                ? (noOptionsMessage ??
                    (allowCustom ? 'Type to add your own' : 'Nothing to choose from yet'))
                : emptyMessage}
            </li>
          )}
          {matches.map((o) => {
            const idx = enabled.indexOf(o);
            return (
              <li key={o.value}
                id={`${listId}-${o.value}`}
                role="option"
                aria-selected={o.value === value}
                aria-disabled={o.disabled || undefined}
                data-active={idx !== -1 && idx === active ? '' : undefined}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => !o.disabled && commit(o)}
                className={cx('listbox-option')}>
                {o.label}
                {o.note ? <span className="listbox-option-note">{o.note}</span> : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
