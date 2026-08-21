import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

export const Timeline = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function Timeline({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('timeline', className)} />;
  });

export interface TimelineItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  time: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  /** Highlights the marker as the live entry. */
  current?: boolean;
}

export const TimelineItem = forwardRef<HTMLDivElement, TimelineItemProps>(function TimelineItem(
  { time, title, body, current = false, className, ...rest }, ref,
) {
  return (
    <div {...rest} ref={ref} data-state={current ? 'current' : undefined}
      className={cx('timeline-item', className)}>
      <span className="timeline-marker" />
      <div>
        <p className="timeline-time">{time}</p>
        <p className="timeline-title">{title}</p>
        {body ? <p className="timeline-body">{body}</p> : null}
      </div>
    </div>
  );
});
