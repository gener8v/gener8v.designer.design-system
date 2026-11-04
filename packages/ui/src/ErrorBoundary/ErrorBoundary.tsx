import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { State, StateActions, StateBody, StateIcon, StateTitle } from '../State/State.js';
import { Button } from '../Button/Button.js';

export interface ErrorBoundaryLabels {
  /** Default "This part could not be shown". */
  title?: ReactNode;
  /** Default "Something in it went wrong. The rest of the page still works." */
  body?: ReactNode;
  /** The button that tries again. Default "Try again". */
  retry?: ReactNode;
}

export interface ErrorBoundaryProps {
  children?: ReactNode;
  /**
   * When this changes, a caught error is cleared and the children render again. Pass what the
   * region shows — the route's path, the record's id — so moving on recovers it.
   */
  resetKey?: unknown;
  /** Told about the error, for logging. Never shown to the person. */
  onError?: (error: unknown, info: ErrorInfo) => void;
  /**
   * What to show instead of the default `State`. A function is handed `reset`, which clears the
   * error and renders the children again.
   */
  fallback?: ReactNode | ((reset: () => void) => ReactNode);
  labels?: ErrorBoundaryLabels;
  /** The tight `State`, for a panel or a card rather than a whole page. */
  tight?: boolean;
}

interface Caught { failed: boolean; key: unknown }

const WARNING = (
  <svg viewBox="0 0 256 256" fill="currentColor"><path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z"/></svg>
);

/**
 * Catches an error thrown while rendering what it wraps, and shows `State kind="error"` in its
 * place. Everything outside it — the header, the navigation, the other panels — stays, so one
 * broken region never blanks the app.
 *
 * NOTHING FROM THE ERROR IS SHOWN. An error's message is written for a developer, can carry
 * server text, and means nothing to the person reading it. Hand it to `onError` for the log.
 *
 * `resetKey` RECOVERS IT. Wrap a routed page with the path as the key and leaving the page clears
 * the error; wrap a detail pane with the record id and choosing another record does. "Try again"
 * clears it in place. No router is assumed.
 *
 * Render errors only — React does not route an error thrown in an event handler or a promise
 * here. A request that fails is a `State` the screen renders itself.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, Caught> {
  override state: Caught = { failed: false, key: this.props.resetKey };

  static getDerivedStateFromError(): Partial<Caught> {
    return { failed: true };
  }

  static getDerivedStateFromProps(props: ErrorBoundaryProps, state: Caught): Partial<Caught> | null {
    return Object.is(props.resetKey, state.key) ? null : { failed: false, key: props.resetKey };
  }

  override componentDidCatch(error: unknown, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  reset = () => { this.setState({ failed: false }); };

  override render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    const { fallback, labels = {}, tight = false } = this.props;
    if (typeof fallback === 'function') return fallback(this.reset);
    if (fallback !== undefined) return fallback;
    return (
      <State kind="error" tight={tight} role="alert">
        <StateIcon>{WARNING}</StateIcon>
        <StateTitle>{labels.title ?? 'This part could not be shown'}</StateTitle>
        <StateBody>{labels.body ?? 'Something in it went wrong. The rest of the page still works.'}</StateBody>
        <StateActions>
          <Button size="sm" onClick={this.reset}>{labels.retry ?? 'Try again'}</Button>
        </StateActions>
      </State>
    );
  }
}
