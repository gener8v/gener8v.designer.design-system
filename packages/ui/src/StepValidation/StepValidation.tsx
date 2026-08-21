import { useCallback, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

export interface StepIssue {
  /** The id of the control this is about. Used to focus and to link. */
  fieldId: string;
  message: string;
}

export interface UseStepValidation {
  /** Attach to the element wrapping the step's controls. */
  formRef: React.RefObject<HTMLElement | null>;
  issues: StepIssue[];
  /** Runs validation; calls `onValid` only if the step passes. */
  tryAdvance: (onValid: () => void) => Promise<boolean>;
  clear: () => void;
}

const CONTROLS = 'input, select, textarea';

/**
 * Validation-on-advance built on **native constraint validation**, not a schema
 * library.
 *
 * The design system ships native controls, so `checkValidity()` already knows
 * about `required`, `type="email"`, `min`, `max` and `pattern` — and it works
 * with no dependency, no resolver wiring, and no version coupling between this
 * package and whatever an engagement picks. A team that wants Zod or Valibot
 * passes its own `validate`; the two compose rather than compete.
 *
 * Bundling a schema library into a design system would make every consumer
 * inherit that choice, which is exactly the kind of decision a design system
 * has no business making for an application.
 */
export function useStepValidation(
  options: { validate?: () => StepIssue[] | Promise<StepIssue[]> } = {},
): UseStepValidation {
  const formRef = useRef<HTMLElement | null>(null);
  const [issues, setIssues] = useState<StepIssue[]>([]);

  const clear = useCallback(() => setIssues([]), []);

  const tryAdvance = useCallback(async (onValid: () => void) => {
    const found: StepIssue[] = [];
    const root = formRef.current;

    if (root) {
      for (const el of root.querySelectorAll<HTMLInputElement>(CONTROLS)) {
        if (el.disabled || el.type === 'hidden') continue;
        if (el.checkValidity()) { el.removeAttribute('aria-invalid'); continue; }
        el.setAttribute('aria-invalid', 'true');
        // Prefer the control's own label over the browser's message where one
        // exists — "Enter a valid email address" beats "Please fill in this field".
        const label = root.querySelector<HTMLElement>(`label[for="${CSS.escape(el.id)}"]`);
        found.push({
          fieldId: el.id,
          message: el.validationMessage || `${label?.textContent?.trim() ?? 'This field'} is required`,
        });
      }
    }

    const extra = (await options.validate?.()) ?? [];
    for (const issue of extra) {
      document.getElementById(issue.fieldId)?.setAttribute('aria-invalid', 'true');
      found.push(issue);
    }

    setIssues(found);
    if (found.length === 0) { onValid(); return true; }

    // Focus the summary, not the first field: on a long step the summary is the
    // only place that says how many problems there are.
    queueMicrotask(() => root?.ownerDocument
      ?.querySelector<HTMLElement>('[data-error-summary]')?.focus());
    return false;
  }, [options]);

  return { formRef, issues, tryAdvance, clear };
}

export interface ErrorSummaryProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  issues: StepIssue[];
  title?: ReactNode;
}

/**
 * Renders nothing when the step is valid, so it never occupies space it has not
 * earned. `tabIndex={-1}` so validation can move focus here; `role="alert"` so
 * the count is announced when it appears.
 */
export function ErrorSummary({ issues, title, className, ...rest }: ErrorSummaryProps) {
  if (issues.length === 0) return null;
  return (
    <div {...rest} data-error-summary tabIndex={-1} role="alert"
      className={cx('error-summary', className)}>
      <p className="error-summary-title">
        {title ?? `There ${issues.length === 1 ? 'is 1 problem' : `are ${issues.length} problems`} with this step`}
      </p>
      <ul className="error-summary-list">
        {issues.map((i) => (
          <li key={i.fieldId}>
            <a href={`#${i.fieldId}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(i.fieldId)?.focus();
              }}>{i.message}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
