import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ToastRegion, Toast, ToastTitle, ToastBody, ToastClose } from '../Toast/index.js';
import type { Tone } from '../Alert/index.js';

export interface ToastSpec {
  title: ReactNode;
  body?: ReactNode;
  tone?: Tone;
  /** Milliseconds. 0 keeps it until dismissed — use for anything actionable. */
  duration?: number;
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
 * reading it. Anything with an action defaults to no timeout at all — a
 * dismissible action the user cannot reach in time is a broken promise.
 */
export function ToastProvider({ children, max = 4, defaultDuration = 5200 }: ToastProviderProps) {
  const [items, setItems] = useState<Entry[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const paused = useRef(false);

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
    arm(id, spec.duration ?? defaultDuration);
    return id;
  }, [arm, defaultDuration, max]);

  useEffect(() => () => { for (const t of timers.current.values()) clearTimeout(t); }, []);

  const api = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <ToastRegion
        onMouseEnter={() => {
          paused.current = true;
          for (const t of timers.current.values()) clearTimeout(t);
          timers.current.clear();
        }}
        onMouseLeave={() => {
          paused.current = false;
          for (const i of items) arm(i.id, i.duration ?? defaultDuration);
        }}
      >
        {items.map((i) => (
          <Toast key={i.id} {...(i.tone ? { tone: i.tone } : {})}>
            <div>
              <ToastTitle>{i.title}</ToastTitle>
              {i.body ? <ToastBody>{i.body}</ToastBody> : null}
            </div>
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
