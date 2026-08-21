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
}

/**
 * Wires `aria-expanded`, `aria-controls` and `hidden` from one piece of state,
 * so the chevron, the panel and the announcement cannot disagree. The panel is
 * `hidden` rather than height-0 — collapsed content must leave the
 * accessibility tree, not just the viewport.
 */
export function AccordionItem({ title, children, value, className, ...rest }: AccordionItemProps) {
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
      <div id={panelId} className="accordion-panel" hidden={!isOpen} role="region">
        {children}
      </div>
    </div>
  );
}
