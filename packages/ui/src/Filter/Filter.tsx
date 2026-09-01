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
}

export interface FilterProps {
  /**
   * The dimension being narrowed: "Type", "Status", "Owner".
   *
   * It names the menu for assistive tech, heads the list of choices, and is
   * what the control reads as while nothing is chosen — so a row of these says
   * what can be narrowed before anybody opens one.
   */
  name: string;
  /** The value now. Null is *not narrowed*, and the control shows `name`. */
  value: string | null;
  options: FilterOption[];
  onChange: (value: string | null) => void;
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
export function Filter({
  name, value, options, onChange, anyLabel, disabled = false, align = 'start', className,
}: FilterProps) {
  const chosen = options.find((o) => o.value === value) ?? null;
  const narrowed = chosen !== null;

  return (
    <Menu
      label={name}
      align={align}
      trigger={
        <button
          type="button"
          disabled={disabled}
          className={cx('filter', narrowed && 'filter-on', className)}
        >
          {/* The dimension stays on the control once a value is chosen. Three
              pills reading *Daily lesson*, *Scholars*, *Standard* are three
              answers with the questions thrown away — and the reader has to
              remember which column each one narrows. */}
          <span className="filter-name">{name}</span>
          {narrowed && <span className="filter-value">{chosen.label}</span>}
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
        <MenuItem selected={value === null} onSelect={() => onChange(null)}>
          {anyLabel}
        </MenuItem>
      )}
      {options.map((o) => (
        <MenuItem key={o.value} selected={value === o.value} onSelect={() => onChange(o.value)}>
          <span className="filter-option">
            <span>{o.label}</span>
            {o.note !== undefined && <span className="filter-option-note">{o.note}</span>}
          </span>
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
