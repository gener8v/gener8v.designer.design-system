import { createContext, useCallback, useContext, useId, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

interface Ctx { open: Set<string>; toggle: (id: string) => void }
const AccordionCtx = createContext<Ctx | null>(null);

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  /** `single` closes the open item when another opens. */
  type?: 'single' | 'multiple';
  defaultOpen?: string[];
}

export function Accordion({ type = 'multiple', defaultOpen = [], className, children, ...rest }: AccordionProps) {
  const [open, setOpen] = useState(() => new Set(defaultOpen));
  const toggle = useCallback((id: string) => {
    setOpen((prev) => {
      const next = type === 'single' ? new Set<string>() : new Set(prev);
      if (prev.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, [type]);
  return (
    <AccordionCtx.Provider value={{ open, toggle }}>
      <div {...rest} className={cx('accordion', className)}>{children}</div>
    </AccordionCtx.Provider>
  );
}

export interface AccordionItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  children?: ReactNode;
  /** Stable id. Generated if omitted, which is fine for uncontrolled use. */
  value?: string;
  /**
   * Keep the panel's children out of the DOM until it is opened, and take them
   * out again when it closes.
   *
   * The panel is `hidden` rather than unmounted by default, which is right for
   * ordinary content: it stays in the document, keeps its scroll position, and
   * is findable by the browser's own find-in-page. But `hidden` still MOUNTS,
   * so a panel whose content fetches on mount fetches whether or not anybody
   * opened it — and a list of twenty disclosures then makes twenty requests for
   * a question most readers never ask.
   *
   * Set this when opening the panel is what should cause the work.
   */
  unmountClosed?: boolean;
}

/**
 * Wires `aria-expanded`, `aria-controls` and `hidden` from one piece of state,
 * so the chevron, the panel and the announcement cannot disagree. The panel is
 * `hidden` rather than height-0 — collapsed content must leave the
 * accessibility tree, not just the viewport.
 */
export function AccordionItem({ title, children, value, unmountClosed = false, className, ...rest }: AccordionItemProps) {
  const auto = useId();
  const id = value ?? auto;
  const panelId = `${id}-panel`;
  const ctx = useContext(AccordionCtx);
  const [localOpen, setLocalOpen] = useState(false);

  const isOpen = ctx ? ctx.open.has(id) : localOpen;
  const onToggle = () => (ctx ? ctx.toggle(id) : setLocalOpen((v) => !v));

  return (
    <div {...rest} className={cx('accordion-item', className)}>
      <button type="button" className="accordion-trigger"
        aria-expanded={isOpen} aria-controls={panelId} onClick={onToggle}>
        {title}
      </button>
      {/* The panel element itself always exists, so `aria-controls` always resolves
          to something — an id pointing at nothing is worse than an empty region. */}
      <div id={panelId} className="accordion-panel" hidden={!isOpen} role="region">
        {unmountClosed && !isOpen ? null : children}
      </div>
    </div>
  );
}
