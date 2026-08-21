import { useRef, useState } from 'react';
import { cx } from '../cx.js';
import type { TagVariant } from '../Tag/index.js';

export interface Token { id: string; label: string; variant?: TagVariant }

export interface TokenInputProps {
  tokens: Token[];
  onAdd?: (label: string) => void;
  onRemove: (id: string) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * Removable tokens plus a text field. Backspace on an empty field removes the
 * last token — the behaviour every user has learned from email clients, and
 * the reason a plain multi-select feels broken here.
 *
 * Each × is a real button: removing a label is an action, and an action that
 * only a mouse can reach is not one.
 */
export function TokenInput({
  tokens, onAdd, onRemove, label, placeholder, disabled, id, className,
}: TokenInputProps) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className={cx('token-input', className)}
      aria-disabled={disabled || undefined}
      onClick={() => inputRef.current?.focus()}>
      {tokens.map((t) => (
        <span key={t.id} className={cx('tag', `tag-${t.variant ?? 'neutral'}`)}>
          {t.label}
          <button type="button" className="tag-remove"
            aria-label={`Remove ${t.label}`}
            disabled={disabled}
            onClick={(e) => { e.stopPropagation(); onRemove(t.id); }}>
            <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/></svg>
          </button>
        </span>
      ))}
      <input ref={inputRef} id={id} className="token-input-field" type="text"
        aria-label={label} placeholder={tokens.length === 0 ? placeholder : undefined}
        value={draft} disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && draft.trim()) { e.preventDefault(); onAdd?.(draft.trim()); setDraft(''); }
          else if (e.key === 'Backspace' && draft === '' && tokens.length) {
            e.preventDefault();
            onRemove(tokens[tokens.length - 1]!.id);
          }
        }} />
    </div>
  );
}
