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
