import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx.js';

export interface CommentProps extends HTMLAttributes<HTMLDivElement> {
  author: ReactNode;
  time: ReactNode;
  avatar?: ReactNode;
  children?: ReactNode;
}

export function Comment({ author, time, avatar, children, className, ...rest }: CommentProps) {
  return (
    <div {...rest} className={cx('comment', className)}>
      {avatar}
      <div className="comment-body">
        <div className="comment-head">
          <span className="comment-author">{author}</span>
          <span className="comment-time">{time}</span>
        </div>
        <div className="comment-text">{children}</div>
      </div>
    </div>
  );
}

export const CommentCompose = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) =>
  <div {...rest} className={cx('comment-compose', className)} />;

export const CommentActions = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) =>
  <div {...rest} className={cx('comment-actions', className)} />;
