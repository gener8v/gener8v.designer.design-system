import { useCallback, useId, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

/** One thing that can sit in one of two places. */
export interface ShelfItem {
  id: string;
  name: ReactNode;
  /** Why it is here, or what it is. Read at a glance or not at all. */
  note?: ReactNode;
  /** Cannot be moved, and why. The reason is REQUIRED when it is fixed: a thing that refuses to
   *  move without saying so teaches the reader that the control is broken. */
  fixed?: string;
}

export interface ShelfProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** The two places, in reading order. */
  zones: [{ id: string; title: string; empty: string }, { id: string; title: string; empty: string }];
  /** Which items are in which zone, keyed by zone id. */
  items: Record<string, ShelfItem[]>;
  /** Somebody moved one. The caller decides whether it actually moves — an optimistic list that
   *  the server refuses has to be able to go back. */
  onMove: (itemId: string, toZone: string) => void;
  /** Somebody opened one. A row is a link to the thing, not only a token to drag. */
  onOpen?: (itemId: string) => void;
}

/**
 * Moving a thing between two places.
 *
 * NOT A LIST OF SWITCHES. A switch answers "is this on"; this is somebody taking an item out of
 * one place and putting it in another. A control that shows only the resulting state makes the
 * reader infer the movement from it.
 *
 * ONE MECHANISM, TWO GESTURES
 *
 * The keyboard path is not a fallback bolted beside the pointer path — both call the same `lift`
 * / `drop`, so a behaviour can never be true of one and not the other. A drag-only control is one
 * a keyboard cannot operate at all, and in an audited product the people most likely to be using
 * one are exactly the people it is for.
 *
 * Space picks up, arrows move between zones, Space drops, Escape cancels. Every one of those
 * announces through a live region, because a reader who cannot see the lift has no other way to
 * know it happened.
 *
 * THE GRIP IS THE DRAG TARGET, NOT THE ROW. The row opens the item. If the whole row were
 * draggable every click would begin a drag nobody asked for, and the two gestures would fight on
 * every press.
 */
export function Shelf({ zones, items, onMove, onOpen, className, ...rest }: ShelfProps) {
  const [lifted, setLifted] = useState<{ id: string; from: string } | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [said, setSaid] = useState('');
  const id = useId();

  const zoneOf = useCallback(
    (itemId: string) =>
      zones.find((z) => (items[z.id] ?? []).some((i) => i.id === itemId))?.id ?? zones[0].id,
    [zones, items],
  );

  const nameOf = useCallback(
    (itemId: string) => {
      for (const zone of zones) {
        const found = (items[zone.id] ?? []).find((i) => i.id === itemId);
        // The accessible announcement needs a STRING, and `name` is a ReactNode. Falling back to
        // the id keeps the announcement honest rather than empty when a caller passes an element.
        if (found) return typeof found.name === 'string' ? found.name : itemId;
      }
      return itemId;
    },
    [zones, items],
  );

  const lift = useCallback(
    (itemId: string) => {
      const from = zoneOf(itemId);
      setLifted({ id: itemId, from });
      setSaid(`${nameOf(itemId)} picked up. Arrow keys to move it, space to drop, escape to cancel.`);
    },
    [zoneOf, nameOf],
  );

  const drop = useCallback(
    (toZone: string) => {
      if (!lifted) return;
      const name = nameOf(lifted.id);
      if (toZone === lifted.from) {
        setSaid(`${name} put back.`);
      } else {
        onMove(lifted.id, toZone);
        setSaid(`${name} moved to ${zones.find((z) => z.id === toZone)?.title ?? toZone}.`);
      }
      setLifted(null);
      setOver(null);
    },
    [lifted, nameOf, onMove, zones],
  );

  const cancel = useCallback(() => {
    if (!lifted) return;
    setSaid(`${nameOf(lifted.id)} left where it was.`);
    setLifted(null);
    setOver(null);
  }, [lifted, nameOf]);

  const onGripKey = (e: React.KeyboardEvent<HTMLButtonElement>, item: ShelfItem) => {
    if (item.fixed) return;
    const other = zones.find((z) => z.id !== (lifted ? over ?? lifted.from : zoneOf(item.id)));
    switch (e.key) {
      case ' ':
      case 'Enter':
        e.preventDefault();
        if (lifted?.id === item.id) drop(over ?? lifted.from);
        else lift(item.id);
        break;
      case 'ArrowRight':
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'ArrowDown':
        if (!lifted || lifted.id !== item.id || !other) return;
        e.preventDefault();
        // ONE ANNOUNCEMENT PER MOVE, naming where it would land. Silence here leaves a reader
        // pressing arrows with no idea whether anything is happening.
        setOver(other.id);
        setSaid(`${nameOf(item.id)} over ${other.title}. Space to drop.`);
        break;
      case 'Escape':
        e.preventDefault();
        cancel();
        // NO EXPLICIT REFOCUS. Cancelling changes an attribute on the row, not the identity of the
        // button, so React updates in place and focus never leaves. A `.focus()` here survived
        // every mutation of it — which is the definition of a line nothing depends on, and the
        // test below is what says so rather than a comment claiming it.
        break;
    }
  };

  return (
    <div {...rest} className={cx('shelf', className)}>
      {zones.map((zone) => (
        <section
          key={zone.id}
          data-over={over === zone.id || undefined}
          className="shelf-zone"
          onDragOver={(e) => {
            if (!lifted) return;
            // Without this the drop never fires: the default is to refuse.
            e.preventDefault();
            setOver(zone.id);
          }}
          onDragLeave={() => setOver((z) => (z === zone.id ? null : z))}
          onDrop={(e) => {
            e.preventDefault();
            drop(zone.id);
          }}
        >
          <p className="shelf-zone-title">{zone.title}</p>
          {(items[zone.id] ?? []).length === 0 ? (
            <p className="shelf-zone-empty">{zone.empty}</p>
          ) : (
            (items[zone.id] ?? []).map((item) => (
              <div
                key={item.id}
                data-lifted={lifted?.id === item.id || undefined}
                data-fixed={item.fixed ? '' : undefined}
                className="shelf-item"
                role={onOpen ? 'button' : undefined}
                tabIndex={onOpen ? 0 : undefined}
                onClick={() => onOpen?.(item.id)}
                onKeyDown={(e) => {
                  if (!onOpen) return;
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onOpen(item.id);
                  }
                }}
              >
                {item.fixed ? (
                  // NO GRIP AT ALL, rather than a disabled one. A control that exists and refuses
                  // invites the attempt it refuses; its absence plus the reason below says the
                  // same thing without costing anybody a try.
                  <span className="shelf-grip" aria-hidden="true" style={{ visibility: 'hidden' }} />
                ) : (
                  <button
                    type="button"
                    className="shelf-grip"
                    draggable
                    aria-label={`Move ${nameOf(item.id)}`}
                    aria-describedby={`${id}-how`}
                    aria-pressed={lifted?.id === item.id}
                    onClick={(e) => e.stopPropagation()}
                    onDragStart={() => lift(item.id)}
                    onDragEnd={() => setLifted(null)}
                    onKeyDown={(e) => onGripKey(e, item)}
                  />
                )}
                <span className="shelf-item-body">
                  <span className="shelf-item-name">{item.name}</span>
                  {(item.fixed || item.note) && (
                    <span className="shelf-item-note">{item.fixed || item.note}</span>
                  )}
                </span>
              </div>
            ))
          )}
        </section>
      ))}

      <p id={`${id}-how`} className="sr-only">
        Press space to pick up, arrow keys to move between lists, space again to drop, escape to
        cancel.
      </p>
      {/* WHAT JUST HAPPENED. A reader who cannot see the lift has no other way to know it worked,
          and a drag interface without this is one that silently does nothing for them. */}
      <p aria-live="polite" className="sr-only">
        {said}
      </p>
    </div>
  );
}
