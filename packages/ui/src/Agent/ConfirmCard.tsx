import { forwardRef, useEffect, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';
import { Tag } from '../Tag/index.js';
import type { TagVariant } from '../Tag/index.js';
import { Button, ButtonLink } from '../Button/index.js';
import { mergeRefs } from '../useModalBehavior.js';

/**
 * Who answers. `confirm` — the person in the conversation, here, now. `approval` — somebody with
 * the authority to: here when this person has it, or `elsewhere` (an approvals list) when not.
 */
export type ConfirmTier = 'confirm' | 'approval';
/** `failed` is a yes that did not land: the change was not made, and `problem` says why. */
export type ConfirmState = 'open' | 'confirmed' | 'cancelled' | 'failed';

export interface ConfirmValue {
  label: ReactNode;
  value: ReactNode;
}

export interface ConfirmCardLabels {
  /** The yes on a `confirm` card. Default `Confirm Change`. */
  confirm?: string;
  /** The yes on an `approval` card. Default `Approve`. */
  approve?: string;
  /** The yes on a card that costs money, at either tier. Default `Approve Spend`. */
  approveSpend?: string;
  /** Default `Cancel`. Cancel is an answer, not a dismissal. */
  cancel?: string;
  /** The tag on a card that costs money. Default `costs money`. */
  costsMoney?: string;
  /** Default `read only`. */
  readOnly?: string;
  /** The answered words. Defaults `confirmed` (or `approved`), `cancelled`, `not made`. */
  confirmed?: string;
  approved?: string;
  cancelled?: string;
  failed?: string;
  /** Names the card. Defaults to `A change waiting for you`, or one that says it costs money. */
  name?: string;
}

export interface ConfirmCardElsewhere {
  /** Why it is not answered here — `Needs approval in Plan`. */
  note: ReactNode;
  /** The way there. */
  action?: { label: string; href?: string; onActivate?: () => void };
}

export interface ConfirmCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  /** The proposed change, as a sentence — `Move REQ-014 to Milestone 2`. */
  summary: ReactNode;
  /** The values it would write, as a list — `Fee: $12,000`. */
  values?: ConfirmValue[];
  tier?: ConfirmTier;
  /**
   * It costs money. `true` says so in a tag; anything else is said beside it — `starts a billed
   * run`, `$1,240 estimated`. The yes becomes Approve Spend, at either tier.
   */
  spend?: boolean | ReactNode;
  state?: ConfirmState;
  /** Why a `failed` change was not made, in the server's words. */
  problem?: ReactNode;
  /**
   * The yes. Return a promise and the button stays busy until it settles; either way Cancel is
   * held while it is busy, so nobody answers twice.
   */
  onConfirm?: () => void | Promise<unknown>;
  onCancel?: () => void;
  /** Busy from outside, for a caller that tracks the request itself. */
  pending?: boolean;
  /** Somebody who can only read: the change is shown and nothing can be answered. */
  readOnly?: boolean;
  /** Answered somewhere else: instead of the buttons, why, and the way there. */
  elsewhere?: ConfirmCardElsewhere;
  labels?: ConfirmCardLabels;
}

const TONE: Record<Exclude<ConfirmState, 'open'>, TagVariant> = {
  confirmed: 'success', cancelled: 'neutral', failed: 'danger',
};

/**
 * A change that needs a person asks one, in the conversation, with the change on it.
 *
 * Nothing is written until the yes. The card says what will change and the values it will write;
 * whether this person answers it or somebody with authority does (`tier`); and — before the button,
 * in a tag — when it costs money, where the yes says Approve Spend rather than pretending to be
 * one more edit.
 *
 * ONCE ANSWERED IT STAYS, AS A RECORD. The buttons go and the answer takes their place, in a
 * polite status that was there from the start so the change is announced. If the answer took the
 * focus with it — the pressed button is gone — the card takes it, so a keyboard is not dropped to
 * the top of the page.
 */
export const ConfirmCard = forwardRef<HTMLDivElement, ConfirmCardProps>(function ConfirmCard(
  {
    summary, values, tier = 'confirm', spend = false, state = 'open', problem, onConfirm, onCancel,
    pending = false, readOnly = false, elsewhere, labels: L = {}, className, ...rest
  }, ref,
) {
  const [pressed, setPressed] = useState(false);
  const own = useRef<HTMLDivElement>(null);
  const was = useRef(state);
  const busy = pending || pressed;
  const costs = spend !== false && spend != null;

  useEffect(() => {
    if (was.current === 'open' && state !== 'open') {
      setPressed(false);
      const active = typeof document !== 'undefined' ? document.activeElement : null;
      if (!active || active === document.body || own.current?.contains(active)) own.current?.focus();
    }
    was.current = state;
  }, [state]);

  function yes() {
    if (busy) return;
    setPressed(true);
    const r = onConfirm?.();
    if (r && typeof (r as Promise<unknown>).then === 'function') {
      (r as Promise<unknown>).then(() => setPressed(false), () => setPressed(false));
    }
  }

  const answered = state === 'open' ? null
    : state === 'confirmed' ? (tier === 'approval' ? L.approved ?? 'approved' : L.confirmed ?? 'confirmed')
      : state === 'cancelled' ? L.cancelled ?? 'cancelled' : L.failed ?? 'not made';
  const name = L.name ?? (costs ? 'A change that costs money, waiting for you' : 'A change waiting for you');
  const yesLabel = costs ? L.approveSpend ?? 'Approve Spend'
    : tier === 'approval' ? L.approve ?? 'Approve' : L.confirm ?? 'Confirm Change';

  return (
    <div {...rest} ref={mergeRefs(own, ref)} role="group" aria-label={name} tabIndex={-1}
      data-tier={tier} data-spend={costs ? 'true' : undefined} data-state={state}
      className={cx('card', 'card-pad-sm', 'confirm-card', className)}>
      {costs ? (
        <div className="confirm-card-flags">
          <Tag variant="danger">{L.costsMoney ?? 'costs money'}</Tag>
          {spend !== true ? <span className="confirm-card-spend">{spend}</span> : null}
        </div>
      ) : null}
      <p className="confirm-card-summary">{summary}</p>
      {values?.length ? (
        <dl className="confirm-card-values">
          {values.map((v, i) => (
            <div key={i}>
              <dt>{v.label}</dt>
              <dd>{v.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {state === 'open' && readOnly ? (
        <div className="confirm-card-actions"><Tag variant="neutral">{L.readOnly ?? 'read only'}</Tag></div>
      ) : state === 'open' && elsewhere ? (
        <div className="confirm-card-actions">
          <Tag variant="warning">{elsewhere.note}</Tag>
          {elsewhere.action?.href ? (
            <ButtonLink variant="secondary" size="sm" href={elsewhere.action.href}
              onClick={elsewhere.action.onActivate}>{elsewhere.action.label}</ButtonLink>
          ) : elsewhere.action?.onActivate ? (
            <Button variant="secondary" size="sm" onClick={elsewhere.action.onActivate}>{elsewhere.action.label}</Button>
          ) : null}
        </div>
      ) : state === 'open' ? (
        <div className="confirm-card-actions">
          <Button variant="secondary" size="sm" loading={busy} onClick={yes}>{yesLabel}</Button>
          <Button variant="ghost" size="sm" disabled={busy} onClick={onCancel}>{L.cancel ?? 'Cancel'}</Button>
        </div>
      ) : null}
      <div className="confirm-card-outcome" role="status">
        {state !== 'open' ? (
          <>
            <Tag variant={TONE[state]}>{answered}</Tag>
            {problem ? <span className="confirm-card-problem">{problem}</span> : null}
          </>
        ) : null}
      </div>
    </div>
  );
});
