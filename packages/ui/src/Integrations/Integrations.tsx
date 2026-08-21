import { forwardRef, useCallback, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

/* ------------------------------------------------------------- connection */

export type ConnectionState = 'connected' | 'degraded' | 'error' | 'pending' | 'off';

const STATE_LABEL: Record<ConnectionState, string> = {
  connected: 'Connected', degraded: 'Degraded', error: 'Error',
  pending: 'Connecting', off: 'Not connected',
};

export const Connection = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) =>
  <div {...rest} className={cx('connection', className)} />;
export const ConnectionMark = ({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) =>
  <span {...rest} aria-hidden="true" className={cx('connection-mark', className)} />;
export const ConnectionBody = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) =>
  <div {...rest} className={cx('connection-body', className)} />;
export const ConnectionName = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) =>
  <div {...rest} className={cx('connection-name', className)} />;
export const ConnectionNote = ({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) =>
  <p {...rest} className={cx('connection-note', className)} />;
export const ConnectionActions = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) =>
  <div {...rest} className={cx('connection-actions', className)} />;

export interface ConnectionStatusProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  state: ConnectionState;
  children?: ReactNode;
}

/** The dot is decorative; the word carries the state, never colour alone. */
export const ConnectionStatus = forwardRef<HTMLSpanElement, ConnectionStatusProps>(
  function ConnectionStatus({ state, children, className, ...rest }, ref) {
    return (
      <span {...rest} ref={ref} data-state={state}
        className={cx('connection-status', className)}>
        {children ?? STATE_LABEL[state]}
      </span>
    );
  });

/* ------------------------------------------------------------ credential */

export interface CredentialProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The secret. Only rendered while revealed — see below. */
  value: string;
  label: string;
  /** Leading characters left visible so a key can be identified, not read. */
  hint?: number;
  onRotate?: () => void;
  /** Suppresses the reveal control entirely for write-once secrets. */
  neverReveal?: boolean;
}

/**
 * A secret field.
 *
 * Two decisions matter here, and both are security rather than styling:
 *
 * 1. **The masked value is not in the DOM.** A CSS mask over the real string
 *    leaves the secret in the markup, in devtools, and in any DOM snapshot. So
 *    the mask is a substitute string; the real value only mounts once revealed.
 * 2. **Copy does not require reveal.** Making someone display a key in order to
 *    copy it is how keys end up in screenshots and screen shares.
 */
export const Credential = forwardRef<HTMLDivElement, CredentialProps>(function Credential(
  { value, label, hint = 4, onRotate, neverReveal = false, className, ...rest }, ref,
) {
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);

  const masked = `${value.slice(0, hint)}${'•'.repeat(Math.max(8, Math.min(24, value.length - hint)))}`;

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard?.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard is permission-gated; the rotate path still works */ }
  }, [value]);

  return (
    <div {...rest} ref={ref} data-masked={shown ? undefined : ''}
      className={cx('credential', className)}>
      <span className="credential-value">
        <span className="sr-only">{label}: </span>
        {shown ? value : masked}
      </span>
      <span className="credential-actions">
        {!neverReveal && (
          <button type="button" className="btn btn-ghost btn-xs"
            aria-pressed={shown}
            onClick={() => setShown((v) => !v)}>{shown ? 'Hide' : 'Reveal'}</button>
        )}
        <button type="button" className="btn btn-ghost btn-xs" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
        {onRotate && (
          <button type="button" className="btn btn-ghost btn-xs" onClick={onRotate}>Rotate</button>
        )}
      </span>
    </div>
  );
});

/* -------------------------------------------------------------- API keys */

export const KeyList = ({ className, ...rest }: HTMLAttributes<HTMLUListElement>) =>
  <ul {...rest} className={cx('key-list', className)} />;

export interface KeyRowProps extends Omit<HTMLAttributes<HTMLLIElement>, 'children'> {
  name: string;
  /** Identifies the key without exposing it. */
  fingerprint: string;
  lastUsed: ReactNode;
  scopes?: ReactNode;
  /** Nearing expiry — a warning, since it still works today. */
  expiring?: boolean;
  expired?: boolean;
  actions?: ReactNode;
}

export const KeyRow = forwardRef<HTMLLIElement, KeyRowProps>(function KeyRow(
  { name, fingerprint, lastUsed, scopes, expiring, expired, actions, className, ...rest }, ref,
) {
  return (
    <li {...rest} ref={ref}
      data-expiring={expiring || undefined} data-expired={expired || undefined}
      className={cx('key-row', className)}>
      <span className="key-name">{name}</span>
      <span className="key-fingerprint">{fingerprint}</span>
      {scopes}
      <span className="key-used">{lastUsed}</span>
      {actions}
    </li>
  );
});

export const Scopes = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) =>
  <div {...rest} className={cx('scopes', className)} />;

export interface ScopeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Marks a write scope — the one worth noticing in a list of twelve. */
  write?: boolean;
}

export const Scope = ({ write, className, ...rest }: ScopeProps) =>
  <span {...rest} data-write={write || undefined} className={cx('scope', className)} />;

/* ----------------------------------------------------------- event rules */

export interface RuleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** What fires the rule. */
  from: ReactNode;
  event: ReactNode;
  /** What it does. */
  to: ReactNode;
  action: ReactNode;
  fromIcon?: ReactNode;
  toIcon?: ReactNode;
  enabled?: boolean;
  trailing?: ReactNode;
}

/** trigger → action, read as a sentence. */
export const Rule = forwardRef<HTMLDivElement, RuleProps>(function Rule(
  { from, event, to, action, fromIcon, toIcon, enabled = true, trailing, className, ...rest }, ref,
) {
  return (
    <div {...rest} ref={ref} data-off={enabled ? undefined : ''} className={cx('rule', className)}>
      <span className="rule-node">
        {fromIcon}
        <span className="rule-label">{from}<span className="rule-event"> · {event}</span></span>
      </span>
      <span className="rule-arrow" aria-hidden="true">
        <svg viewBox="0 0 256 256" fill="currentColor"><path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/></svg>
      </span>
      <span className="rule-node">
        {toIcon}
        <span className="rule-label">{to}<span className="rule-event"> · {action}</span></span>
        {trailing}
      </span>
    </div>
  );
});

export interface EndpointProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  method?: string;
  url: string;
}

export const Endpoint = ({ method = 'POST', url, className, ...rest }: EndpointProps) => (
  <div {...rest} className={cx('endpoint', className)}>
    <span className="endpoint-method">{method}</span>
    <span>{url}</span>
  </div>
);
