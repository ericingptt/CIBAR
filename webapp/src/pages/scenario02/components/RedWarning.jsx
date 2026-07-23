import { useState } from 'react';
import { TriangleAlert } from 'lucide-react';

// Full-screen red danger warning, shared by the two mandatory stop-points in
// the 幣勝客 BITION story (before the first deposit, and before the
// top-up/verification payment) - same visual language as scenario01's
// `.warning` card, just with its own confirmation row and a "stopped"
// branch so choosing the safe option doesn't end the whole educational
// scenario early.
export function RedWarning({
  title,
  body,
  emphasis,
  ackLabel,
  primaryLabel,
  secondaryLabel,
  correctText,
  onContinue,
}) {
  const [checked, setChecked] = useState(false);
  const [stopped, setStopped] = useState(false);

  if (stopped) {
    return (
      <div className="warning bition-warning">
        <div className="bition-warning-icon"><TriangleAlert size={32} /></div>
        <h2>你選擇了正確的做法</h2>
        <p>{correctText}</p>
        <button type="button" className="bition-btn-primary" onClick={onContinue}>
          繼續觀看詐騙如何發展
        </button>
      </div>
    );
  }

  return (
    <div className="warning bition-warning">
      <div className="bition-warning-icon"><TriangleAlert size={32} /></div>
      <h2>{title}</h2>
      <p>{body}</p>
      <p className="bition-warning-emphasis">{emphasis}</p>

      <button type="button" className="consent-row" onClick={() => setChecked((v) => !v)}>
        <span className="consent-mark">{checked ? '✓' : '○'}</span>
        <span>{ackLabel}</span>
      </button>

      <div className="btns">
        <button type="button" className="bition-btn-primary bition-btn-danger" onClick={() => setStopped(true)}>
          {primaryLabel}
        </button>
        <button
          type="button"
          className="bition-btn-secondary"
          disabled={!checked}
          onClick={onContinue}
        >
          {secondaryLabel}
        </button>
      </div>
    </div>
  );
}
