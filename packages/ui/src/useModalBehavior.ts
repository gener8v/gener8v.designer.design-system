import { useCallback, useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),' +
  'textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Nested modals each lock scroll; only the outermost may restore it. */
let lockDepth = 0;
let savedOverflow = '';

/**
 * The behaviour a modal actually owes you: Escape closes, focus moves in on
 * open and returns to the trigger on close, Tab cycles inside the panel, and
 * background scroll is locked.
 *
 * Shared by Dialog and Drawer so the two cannot drift — a panel that merely
 * looks like a modal is worse than none, because it looks finished.
 */
export function useModalBehavior(open: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLElement | null>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopPropagation(); onClose(); return; }
    if (e.key !== 'Tab' || !panelRef.current) return;
    // Visibility is checked from computed style, not offsetParent. offsetParent
    // is layout-derived — it is null for position:fixed subtrees and always
    // null under jsdom, which silently collapses the trap to one element.
    const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
      .filter((el) => {
        if (el.closest('[hidden]')) return false;
        const cs = getComputedStyle(el);
        return cs.display !== 'none' && cs.visibility !== 'hidden';
      });
    if (items.length === 0) { e.preventDefault(); return; }
    const first = items[0]!;
    const last = items[items.length - 1]!;
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === panelRef.current)) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault(); first.focus();
    }
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    restoreTo.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    (panel?.querySelector<HTMLElement>(FOCUSABLE) ?? panel)?.focus();

    if (lockDepth === 0) savedOverflow = document.body.style.overflow;
    lockDepth += 1;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      lockDepth -= 1;
      if (lockDepth === 0) document.body.style.overflow = savedOverflow;
      restoreTo.current?.focus();
    };
  }, [open, onKeyDown]);

  return panelRef;
}

/** Merges the internal panel ref with a caller's forwarded ref. */
export function mergeRefs<T extends HTMLElement>(
  internal: React.MutableRefObject<HTMLElement | null>,
  forwarded: React.ForwardedRef<T>,
) {
  return (node: T | null) => {
    internal.current = node;
    if (typeof forwarded === 'function') forwarded(node);
    else if (forwarded) forwarded.current = node;
  };
}
