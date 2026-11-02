import type { ReactNode } from 'react';
import { Menu, MenuItem, MenuLabel } from '../Menu/Menu.js';
import { cx } from '../cx.js';

export interface FilterOption {
  /** What is stored. */
  value: string;
  /** What is read. */
  label: ReactNode;
  /** A line under the label, where the label alone does not settle the choice. */
  note?: ReactNode;
  /**
   * How many rows carry this value. Shown at the end of the row in the menu, so a reader can see
   * which answers are worth combining before choosing — and which would empty the list.
   */
  count?: number;
}

interface FilterBase {
  /**
   * The dimension being narrowed: "Type", "Status", "Owner".
   *
   * It names the menu for assistive tech, heads the list of choices, and is
   * what the control reads as while nothing is chosen — so a row of these says
   * what can be narrowed before anybody opens one.
   */
  name: string;
  options: FilterOption[];
  /**
   * The wording of the choice that clears this filter. Omit and no such choice
   * is offered — right where a dimension must always have a value.
   */
  anyLabel?: ReactNode;
  disabled?: boolean;
  /** Align the popup's end edge to the trigger's. For one at the end of a row. */
  align?: 'start' | 'end';
  className?: string;
}

/** One value at a time — the original shape, unchanged. */
export interface FilterSingleProps extends FilterBase {
  multiple?: false;
  /** The value now. Null is *not narrowed*, and the control shows `name`. */
  value: string | null;
  onChange: (value: string | null) => void;
}

/**
 * Several values at once: "show me the gaps AND the conflicts". The values are OR-ed within the
 * dimension, which is what ticking two answer kinds means to the person ticking them.
 */
export interface FilterMultipleProps extends FilterBase {
  multiple: true;
  /** The values now, in any order. Empty is *not narrowed*. */
  values: string[];
  /** Called with the new set, in `options` order so the caller's state does not churn. */
  onChange: (values: string[]) => void;
}

export type FilterProps = FilterSingleProps | FilterMultipleProps;

/**
 * Narrowing a list by one dimension.
 *
 * **A segmented control is not a filter, and using one as a filter breaks what
 * it means.** `Segmented` is a set of mutually exclusive VIEWS of the same
 * thing, all of them present, all of them equal, laid out because seeing the
 * alternatives is the point — two or three, and the width of the strip is the
 * width of the choices. A filter is a dimension with a value: the dimensions
 * sit beside each other, the values live inside them, and a list can be
 * narrowed by several dimensions at once. Spelling a filter out as a segmented
 * strip says *these are the views* about something that is not a view, grows
 * unbounded across the page as values are added, and gives the reader no way to
 * see which dimensions exist without reading every value in all of them.
 *
 * So: a trigger that reads as the dimension until it holds a value, a menu of
 * the values with the current one ticked, and `anyLabel` to let it go. It is
 * `Menu` underneath, which means the keyboard contract, the tick column and the
 * dismiss behaviour are the ones this system already has rather than a second
 * set written here.
 *
 * ```tsx
 * <Filters>
 *   <Filter name="Type" value={type} onChange={setType} anyLabel="Any type"
 *           options={[{ value: 'lesson', label: 'Daily lesson' }]} />
 * </Filters>
 * ```
 */
export function Filter(props: FilterProps) {
  const { name, options, anyLabel, disabled = false, align = 'start', className } = props;
  const picked = props.multiple
    ? options.filter((o) => props.values.includes(o.value))
    : options.filter((o) => o.value === props.value).slice(0, 1);
  const narrowed = picked.length > 0;
  const many = picked.length > 1;
  const isOn = (v: string) => picked.some((o) => o.value === v);

  /* The tick column is the same one either way; only the role differs. Several ticked is a
     `menuitemcheckbox` and leaves the menu open for the next tick; one ticked is a
     `menuitemradio` and closes it, as it always did. */
  const mark = (on: boolean) => (props.multiple ? { checked: on } : { selected: on });
  const choose = (v: string) => {
    if (!props.multiple) { props.onChange(v); return; }
    const next = new Set(props.values);
    if (next.has(v)) next.delete(v); else next.add(v);
    props.onChange(options.map((o) => o.value).filter((x) => next.has(x)));
  };
  const clear = () => (props.multiple ? props.onChange([]) : props.onChange(null));

  return (
    <Menu
      label={name}
      align={align}
      trigger={
        <button
          type="button"
          disabled={disabled}
          data-many={many || undefined}
          className={cx('filter', narrowed && 'filter-on', className)}
        >
          {/* The dimension stays on the control once a value is chosen. Three
              pills reading *Daily lesson*, *Scholars*, *Standard* are three
              answers with the questions thrown away — and the reader has to
              remember which column each one narrows. */}
          <span className="filter-name">{name}</span>
          {/* One value reads as the value. Several read as how many, beside the dimension —
              "Kind · 2" — because two labels side by side in a pill is a pill that grows with
              every tick and still cannot hold the third. The menu says which two. */}
          {narrowed && !many && <span className="filter-value">{picked[0]!.label}</span>}
          {many && (
            <span className="filter-value">
              <span aria-hidden="true">· </span>{picked.length}<span className="sr-only"> chosen</span>
            </span>
          )}
          <svg className="filter-caret" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
          </svg>
        </button>
      }
    >
      {/* The dimension heads its own values, so an open menu says what is being
          narrowed without the reader looking back at the trigger under it. */}
      <MenuLabel>{name}</MenuLabel>
      {anyLabel !== undefined && (
        <MenuItem {...mark(!narrowed)} onSelect={clear}>
          {anyLabel}
        </MenuItem>
      )}
      {options.map((o) => (
        <MenuItem key={o.value} {...mark(isOn(o.value))} onSelect={() => choose(o.value)}>
          <span className="filter-option">
            <span>{o.label}</span>
            {o.note !== undefined && <span className="filter-option-note">{o.note}</span>}
          </span>
          {o.count !== undefined && <span className="filter-option-count">{o.count}</span>}
        </MenuItem>
      ))}
    </Menu>
  );
}

/**
 * A row of them.
 *
 * Wrapping rather than scrolling: a dimension pushed off the end of a strip is
 * a dimension nobody knows exists, and the whole claim of this pattern is that
 * the dimensions are visible before the values are.
 */
export function Filters({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={cx('filters', className)} />;
}
