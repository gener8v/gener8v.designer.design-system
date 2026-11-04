import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ToastRegion, Toast, ToastTitle, ToastBody, ToastAction, ToastClose } from '../Toast/index.js';
import type { Tone } from '../Alert/index.js';

/** The one thing a toast lets you do about what it reports — Undo, most often. */
export interface ToastSpecAction {
  /** The button's words: "Undo". */
  label: ReactNode;
  /** Runs on the press. The toast is dismissed after it. */
  onAction: () => void;
}

export interface ToastSpec {
  title: ReactNode;
  body?: ReactNode;
  tone?: Tone;
  /**
   * Milliseconds. 0 keeps it until dismissed — use for anything actionable. A toast with an
   * `action` defaults to 0, so the action cannot leave before someone reaches it.
   */
  duration?: number;
  /**
   * A button in the toast, announced with it and reached by Tab. For undoing what just happened,
   * not for a decision: a toast can be missed, and a decision cannot.
   */
  action?: ToastSpecAction;
}

interface Entry extends ToastSpec { id: number }

interface ToastApi {
  toast: (spec: ToastSpec) => number;
  dismiss: (id: number) => void;
}

const Ctx = createContext<ToastApi | null>(null);

export interface ToastProviderProps {
  children?: ReactNode;
  /** Older toasts are dropped past this. A wall of toasts is not a notification. */
  max?: number;
  defaultDuration?: number;
}

/**
 * Owns the queue and the timers so `Toast` can stay presentational.
 *
 * Timers pause while the pointer is over the region: a toast that vanishes
 * mid-read is worse than no toast, and hover is the signal that someone is
 * reading it; keyboard focus inside the region pauses them the same way.
 * Anything with an action defaults to no timeout at all — an action the
 * person cannot reach in time is a broken promise.
 */
export function ToastProvider({ children, max = 4, defaultDuration = 5200 }: ToastProviderProps) {
  const [items, setItems] = useState<Entry[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const paused = useRef(false);
  const hovered = useRef(false);
  const focused = useRef(false);
  const region = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const lasts = useCallback(
    (spec: ToastSpec) => spec.duration ?? (spec.action ? 0 : defaultDuration),
    [defaultDuration],
  );

  const dismiss = useCallback((id: number) => {
    const t = timers.current.get(id);
    if (t) { clearTimeout(t); timers.current.delete(id); }
    setItems((list) => list.filter((i) => i.id !== id));
  }, []);

  const arm = useCallback((id: number, duration: number) => {
    if (duration <= 0 || paused.current) return;
    timers.current.set(id, setTimeout(() => dismiss(id), duration));
  }, [dismiss]);

  const toast = useCallback((spec: ToastSpec) => {
    const id = nextId.current++;
    setItems((list) => [...list, { ...spec, id }].slice(-max));
    arm(id, lasts(spec));
    return id;
  }, [arm, lasts, max]);

  useEffect(() => () => { for (const t of timers.current.values()) clearTimeout(t); }, []);

  // Hover and keyboard focus both mean someone is reading or about to act; neither leaves until
  // both have gone.
  const pause = () => {
    paused.current = true;
    for (const t of timers.current.values()) clearTimeout(t);
    timers.current.clear();
  };
  const resume = () => {
    if (hovered.current || focused.current) return;
    paused.current = false;
    for (const i of items) arm(i.id, lasts(i));
  };

  // A toast removed from under the keyboard — its action pressed, or dismissed — takes focus with
  // it, and no blur says so. Send focus back to where it came from rather than to the page.
  useEffect(() => {
    if (!focused.current || typeof document === 'undefined') return;
    const at = document.activeElement;
    if (region.current && at && region.current.contains(at)) return;
    focused.current = false;
    const back = returnTo.current;
    returnTo.current = null;
    if ((!at || at === document.body) && back?.isConnected) back.focus();
    resume();
  });

  const api = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <ToastRegion
        ref={region}
        onMouseEnter={() => { hovered.current = true; pause(); }}
        onMouseLeave={() => { hovered.current = false; resume(); }}
        onFocus={(e) => {
          if (!focused.current && e.relatedTarget instanceof HTMLElement) returnTo.current = e.relatedTarget;
          focused.current = true;
          pause();
        }}
        onBlur={(e) => {
          // Focus moving between two buttons in the region is still focus in the region. Focus going
          // nowhere is a toast removed under it, which the effect above settles.
          if (!e.relatedTarget || e.currentTarget.contains(e.relatedTarget as Node)) return;
          focused.current = false;
          returnTo.current = null;
          resume();
        }}
      >
        {items.map((i) => (
          <Toast key={i.id} {...(i.tone ? { tone: i.tone } : {})}>
            <div>
              <ToastTitle>{i.title}</ToastTitle>
              {i.body ? <ToastBody>{i.body}</ToastBody> : null}
            </div>
            {i.action ? (
              <ToastAction onClick={() => { i.action?.onAction(); dismiss(i.id); }}>
                {i.action.label}
              </ToastAction>
            ) : null}
            <ToastClose onClick={() => dismiss(i.id)} />
          </Toast>
        ))}
      </ToastRegion>
    </Ctx.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
