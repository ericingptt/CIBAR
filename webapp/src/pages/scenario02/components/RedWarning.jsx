import { useState } from 'react';
import { TriangleAlert, Phone } from 'lucide-react';
import { Hotline165 } from './Hotline165';

// Full-screen red danger warning, shared by the two mandatory stop-points in
// the 幣勝客 BITION story (before the first deposit, and before the
// top-up/verification payment). No checkbox/consent row anywhere - hand-
// gesture-only play means nothing here should ever require a small tap
// target or a "must confirm before continuing" gate. Three large, always-
// tappable buttons instead: stop, call the 165 hotline, or continue anyway
// (deliberately the least visually prominent of the three).
export function RedWarning({
  title,
  body,
  emphasis,
  primaryLabel,
  secondaryLabel,
  correctText,
  onContinue,
}) {
  const [stopped, setStopped] = useState(false);
  const [showHotline, setShowHotline] = useState(false);

  if (stopped) {
    return (
      <div className="warning bition-warning">
        <div className="bition-warning-icon"><TriangleAlert size={32} /></div>
        <h2>你選擇了正確的做法</h2>
        <p>{correctText}</p>
        <button type="button" className="bition-warn-btn bition-warn-btn-continue" onClick={onContinue}>
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

      <div className="bition-warning-actions">
        <button type="button" className="bition-warn-btn bition-warn-btn-stop" onClick={() => setStopped(true)}>
          {primaryLabel}
        </button>
        <button type="button" className="bition-warn-btn bition-warn-btn-hotline" onClick={() => setShowHotline(true)}>
          <Phone size={20} /> 撥打反詐專線 165
        </button>
        <button type="button" className="bition-warn-btn bition-warn-btn-continue" onClick={onContinue}>
          {secondaryLabel}
        </button>
      </div>

      {showHotline && (
        <Hotline165
          onBack={() => setShowHotline(false)}
          onStopPayment={() => {
            setShowHotline(false);
            setStopped(true);
          }}
        />
      )}
    </div>
  );
}
