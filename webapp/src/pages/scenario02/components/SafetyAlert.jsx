import { TriangleAlert } from 'lucide-react';

// High-contrast safety-tip box (icon+title header, solid-color button) used
// wherever scenario02 warns the player about a manipulation tactic mid-story
// (moving off-platform, fabricated profit screenshots, etc). Replaces the old
// plain "⚠ AI 提醒" text, which rendered white button text on a near-identical
// pale-yellow background - readable contrast was the whole point of this
// component existing, so every color here is deliberate; don't reintroduce a
// pastel-on-pastel combination.
export function SafetyAlert({
  text,
  detail,
  expanded,
  onToggleDetail,
  acknowledged,
  onAcknowledge,
  className = '',
}) {
  return (
    <div className={`safety-alert ${className}`}>
      <div className="safety-alert-header">
        <TriangleAlert size={22} className="safety-alert-icon" />
        <span className="safety-alert-title">安全提醒</span>
      </div>
      <p className="safety-alert-body">{text}</p>
      {detail && (
        <>
          <button type="button" className="safety-alert-toggle" onClick={onToggleDetail}>
            {expanded ? '收起' : '查看原因'}
          </button>
          {expanded && (
            <ul className="safety-alert-detail">
              {detail.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          )}
        </>
      )}
      {acknowledged ? (
        <p className="safety-alert-ack">已知悉</p>
      ) : (
        <button type="button" className="safety-alert-btn" onClick={onAcknowledge}>知道了</button>
      )}
    </div>
  );
}
