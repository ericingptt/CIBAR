import { forwardRef } from 'react';

export const Chat = forwardRef(function Chat({ variant = '', children }, ref) {
  return (
    <section ref={ref} className={`chat${variant ? ' ' + variant : ''}`} aria-live="polite">
      {children}
    </section>
  );
});

export function Message({ type = '', children }) {
  return <div className={`msg${type ? ' ' + type : ''}`}>{children}</div>;
}

export function TypingIndicator({ label = '對方正在輸入' }) {
  return (
    <div className="msg typing" aria-label={label}>
      <span>{label}</span>
      <i></i><i></i><i></i>
    </div>
  );
}

// LINE-style time/read-receipt placement, shared by every 1:1 scripted chat
// (scenario01's LineTeacher, scenario02's PrivateChat, and any later
// scenario that needs the same layout) - deliberately just a wrapper around
// whatever bubble markup the caller passes as children, not a bubble style
// of its own, so it works with each page's existing bubble classes.
export function IncomingMessage({ time, children }) {
  return (
    <div className="chat-row chat-row-in">
      {children}
      {time && <span className="chat-time">{time}</span>}
    </div>
  );
}

export function OutgoingMessage({ time, read = true, children }) {
  return (
    <div className="chat-row chat-row-out">
      <div className="chat-meta">
        {read && <span className="chat-read">已讀</span>}
        {time && <span className="chat-time">{time}</span>}
      </div>
      {children}
    </div>
  );
}
