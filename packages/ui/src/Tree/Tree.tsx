import { useCallback, useMemo, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { cx } from '../cx.js';

export interface TreeNode {
  id: string;
  label: ReactNode;
  /** Trailing figure — a count, a size. */
  meta?: ReactNode;
  children?: TreeNode[];
}

export interface TreeProps {
  nodes: TreeNode[];
  'aria-label': string;
  selected?: string | null;
  onSelect?: (id: string) => void;
  defaultExpanded?: string[];
  className?: string;
}

/** Depth-first list of the currently visible ids — the arrow-key order. */
function visibleOrder(nodes: TreeNode[], expanded: Set<string>, out: string[] = []): string[] {
  for (const n of nodes) {
    out.push(n.id);
    if (n.children?.length && expanded.has(n.id)) visibleOrder(n.children, expanded, out);
  }
  return out;
}

function findParents(nodes: TreeNode[], parent: string | null, map = new Map<string, string | null>()) {
  for (const n of nodes) {
    map.set(n.id, parent);
    if (n.children?.length) findParents(n.children, n.id, map);
  }
  return map;
}

/**
 * `role="tree"` with the WAI-ARIA keyboard contract: Up/Down move through
 * *visible* rows only, Right expands then descends, Left collapses then rises
 * to the parent, Home/End jump. One roving tabindex, so the whole tree is a
 * single Tab stop rather than one per row.
 */
export function Tree({
  nodes, selected = null, onSelect, defaultExpanded = [], className, ...rest
}: TreeProps) {
  const [expanded, setExpanded] = useState(() => new Set(defaultExpanded));
  const [focused, setFocused] = useState<string | null>(null);

  const order = useMemo(() => visibleOrder(nodes, expanded), [nodes, expanded]);
  const parents = useMemo(() => findParents(nodes, null), [nodes]);
  const byId = useMemo(() => {
    const map = new Map<string, TreeNode>();
    const walk = (list: TreeNode[]) => list.forEach((n) => { map.set(n.id, n); if (n.children) walk(n.children); });
    walk(nodes);
    return map;
  }, [nodes]);

  const current = focused ?? selected ?? order[0] ?? null;

  const focus = useCallback((id: string) => {
    setFocused(id);
    queueMicrotask(() => {
      document.querySelector<HTMLElement>(`[data-tree-id="${CSS.escape(id)}"]`)?.focus();
    });
  }, []);

  const toggle = useCallback((id: string, open?: boolean) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      const shouldOpen = open ?? !next.has(id);
      if (shouldOpen) next.add(id); else next.delete(id);
      return next;
    });
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (!current) return;
    const i = order.indexOf(current);
    const node = byId.get(current);
    const hasKids = !!node?.children?.length;

    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); if (order[i + 1]) focus(order[i + 1]!); break;
      case 'ArrowUp': e.preventDefault(); if (order[i - 1]) focus(order[i - 1]!); break;
      case 'Home': e.preventDefault(); if (order[0]) focus(order[0]!); break;
      case 'End': e.preventDefault(); if (order.at(-1)) focus(order.at(-1)!); break;
      case 'ArrowRight':
        e.preventDefault();
        if (hasKids && !expanded.has(current)) toggle(current, true);
        else if (hasKids && order[i + 1]) focus(order[i + 1]!);
        break;
      case 'ArrowLeft': {
        e.preventDefault();
        if (hasKids && expanded.has(current)) { toggle(current, false); break; }
        const p = parents.get(current);
        if (p) focus(p);
        break;
      }
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (hasKids) toggle(current);
        onSelect?.(current);
        break;
    }
  };

  const renderLevel = (list: TreeNode[]) => list.map((n) => {
    const hasKids = !!n.children?.length;
    const isOpen = expanded.has(n.id);
    return (
      <li key={n.id} role="treeitem"
        aria-expanded={hasKids ? isOpen : undefined}
        aria-selected={selected === n.id}>
        <button type="button" className="tree-item"
          data-tree-id={n.id}
          data-leaf={hasKids ? undefined : ''}
          tabIndex={current === n.id ? 0 : -1}
          aria-selected={selected === n.id}
          onFocus={() => setFocused(n.id)}
          onClick={() => { if (hasKids) toggle(n.id); onSelect?.(n.id); }}>
          <span className="tree-twisty" aria-hidden="true" />
          <span className="tree-label">{n.label}</span>
          {n.meta ? <span className="tree-count">{n.meta}</span> : null}
        </button>
        {hasKids && isOpen ? <ul role="group" className="tree-group">{renderLevel(n.children!)}</ul> : null}
      </li>
    );
  });

  return (
    <ul {...rest} role="tree" onKeyDown={onKeyDown} className={cx('tree', className)}>
      {renderLevel(nodes)}
    </ul>
  );
}
