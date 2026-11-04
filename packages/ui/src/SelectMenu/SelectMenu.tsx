import { useId, useLayoutEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { cx } from '../cx.js';
import { useListbox } from '../Combobox/useListbox.js';
import { useAnchoredPosition } from '../useAnchoredPosition.js';

export interface SelectMenuOption<V extends string = string> {
  value: V;
  label: string;
  /** A line under the label that helps someone choose: what the option means, not a second name. */
  note?: ReactNode;
  disabled?: boolean;
}

export interface SelectMenuGroup<V extends string = string> {
  /** The group's heading. It names the group for assistive technology too. */
  group: string;
  options: SelectMenuOption<V>[];
}

export type SelectMenuItem<V extends string = string> = SelectMenuOption<V> | SelectMenuGroup<V>;

export type SelectMenuSize = 'sm' | 'md' | 'lg';

const SIZE: Record<SelectMenuSize, string | undefined> = { sm: 'select-sm', md: undefined, lg: 'select-lg' };

export interface SelectMenuProps<V extends string = string> {
  /** Options, or groups of options, in display order. */
  options: SelectMenuItem<V>[];
  /** The chosen value, or null for none. */
  value: V | null;
  /** Called with the newly chosen value. Choosing the option already chosen does not call it. */
  onChange: (value: V) => void;
  label: ReactNode;
  /** Hide the label visually, keeping it for assistive technology. */
  labelHidden?: boolean;
  /** Shown on the button while nothing is chosen. */
  placeholder?: string;
  /** What the button shows for the chosen option. The option's label by default. */
  display?: (option: SelectMenuOption<V>) => ReactNode;
  size?: SelectMenuSize;
  invalid?: boolean;
  disabled?: boolean;
  /** The button's id. */
  id?: string;
  /** Submits the value with a native form, through a hidden input. */
  name?: string;
  /** Which edge of the button the list lines up with. */
  align?: 'start' | 'end';
  className?: string;
}

const isGroup = <V extends string>(item: SelectMenuItem<V>): item is SelectMenuGroup<V> => 'group' in item;

const CHECK = 'M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z';

/**
 * A button that shows the chosen value and opens a list to pick another: the collapsible listbox
 * from the WAI-ARIA Authoring Practices, drawn in the system's own field and list.
 *
 * WHY NOT THE NATIVE SELECT. `Select` is the platform's control, and its open list is drawn by the
 * operating system: no token reaches it, it cannot carry a note under an option, and it looks
 * different on every machine. This one is ours from the button to the last row.
 *
 * WHY NOT THE COMBOBOX. A combobox is a field you type into, and the list narrows to what you
 * typed. Here there is nothing to type into: the list is short enough to scan, and a letter jumps
 * to the option that starts with it (type-ahead) instead of filtering.
 *
 * The keys are `useListbox`'s: Enter, Space or ↓ open on the chosen option and ↑ on the last; ↓ ↑
 * Home End move without wrapping and skip what is disabled; a letter jumps; Enter, Space or a
 * click choose; Escape closes with no change. Focus goes back to the button every time.
 */
export function SelectMenu<V extends string = string>({
  options, value, onChange, label, labelHidden = false, placeholder = 'Choose…', display,
  size = 'md', invalid = false, disabled = false, id, name, align = 'start', className,
}: SelectMenuProps<V>) {
  const base = `select-menu-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const labelId = `${base}-label`;
  const buttonId = id ?? `${base}-button`;
  const [open, setOpen] = useState(false);

  const flat = options.flatMap((item) => (isGroup(item) ? item.options : [item]));
  const selectedIndex = flat.findIndex((o) => o.value === value);
  const chosen = selectedIndex >= 0 ? flat[selectedIndex]! : null;

  const lb = useListbox({
    count: flat.length,
    open,
    onOpenChange: setOpen,
    selectedIndex,
    textOf: (i) => flat[i]!.label,
    isDisabled: (i) => Boolean(flat[i]!.disabled),
    onChoose: (i) => { if (flat[i]!.value !== value) onChange(flat[i]!.value); },
    idBase: base,
  });

  /** The list is at least as wide as its button, so it reads as the button's own list. Measured
   *  on opening, before the list is placed, because a container can resize the button between one
   *  opening and the next. */
  const [anchorWidth, setAnchorWidth] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (open) setAnchorWidth(lb.buttonRef.current?.getBoundingClientRect().width ?? null);
  }, [open, lb.buttonRef]);

  const { style, available } = useAnchoredPosition({
    open, anchorRef: lb.buttonRef, floatingRef: lb.listRef, placement: 'bottom', align, anchorKey: anchorWidth,
  });

  const button = lb.buttonProps();
  let index = -1;
  const option = (o: SelectMenuOption<V>) => {
    index += 1;
    return (
      <div key={o.value} {...lb.optionProps(index)} className="listbox-option select-menu-option">
        <span className="select-menu-option-text">
          <span className="select-menu-option-label">{o.label}</span>
          {o.note ? <span className="listbox-option-note">{o.note}</span> : null}
        </span>
        <svg className="select-menu-check" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
          <path d={CHECK} />
        </svg>
      </div>
    );
  };

  return (
    <div className={cx('select-menu', className)} {...lb.rootProps()}>
      <span id={labelId} className={cx('field-label', labelHidden && 'sr-only')}>{label}</span>
      <span className="select-wrap">
        <button
          {...button}
          id={buttonId}
          type="button"
          className={cx('select', 'select-menu-trigger', SIZE[size])}
          aria-labelledby={`${labelId} ${buttonId}`}
          aria-invalid={invalid || undefined}
          disabled={disabled}
        >
          <span className="select-menu-value" data-placeholder={chosen ? undefined : ''}>
            {chosen ? (display ? display(chosen) : chosen.label) : placeholder}
          </span>
        </button>
      </span>
      {name !== undefined ? <input type="hidden" name={name} value={value ?? ''} /> : null}
      {open && (
        <div
          {...lb.listProps()}
          aria-labelledby={labelId}
          className="listbox select-menu-list"
          // The room the chosen side has goes to the stylesheet, which caps the list at the smaller
          // of that and its own height: the last rows are never past the edge of the screen.
          style={{
            ...style,
            ...(Number.isFinite(available) ? { ['--select-menu-room' as string]: `${available}px` } : {}),
            ...(anchorWidth ? { ['--anchor-w' as string]: `${anchorWidth}px` } : {}),
          }}
        >
          {options.map((item, g) => {
            if (!isGroup(item)) return option(item);
            const groupId = `${base}-group-${g}`;
            return (
              <div key={groupId} role="group" aria-labelledby={groupId} className="select-menu-group">
                <div id={groupId} role="presentation" className="select-menu-group-label">{item.group}</div>
                {item.options.map(option)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
