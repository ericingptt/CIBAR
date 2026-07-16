import { useEffect, useState } from 'react';
import { useGesture } from './GestureProvider';

const GESTURE_LABELS = {
  idle: 'idle',
  scrollUp: '↑ scrollUp',
  scrollDown: '↓ scrollDown',
  select: '🤏 select',
};

// Rendered once in AppShell so every route gets it for free. Toggled by a
// small persistent tap chip (this is a kiosk/glasses device with no reliable
// keyboard) plus a keyboard shortcut for desktop dev testing.
export function DebugPanel() {
  const [open, setOpen] = useState(false);
  const { gesture, handsDetected, ready, error, fps } = useGesture();

  // Window-level listener (rather than an onKeyDown prop) so the shortcut
  // works regardless of what currently has focus - useful for desktop dev
  // testing where clicking the tap chip first isn't the natural flow.
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'g' || e.key === 'G') setOpen((o) => !o);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        right: 12,
        bottom: 12,
        zIndex: 1000,
        fontSize: 13,
        fontFamily: 'monospace',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          border: '1px solid rgba(255,255,255,.3)',
          borderRadius: 999,
          padding: '6px 12px',
          background: 'rgba(0,0,0,.55)',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        {open ? '手勢除錯 ▼' : '手勢除錯 ▲'}
      </button>
      {open && (
        <div
          style={{
            marginTop: 6,
            padding: '10px 14px',
            borderRadius: 12,
            background: 'rgba(0,0,0,.72)',
            color: '#fff',
            minWidth: 220,
          }}
        >
          <div>狀態：{error ? '錯誤' : ready ? '運作中' : '啟動中……'}</div>
          {error && <div style={{ color: '#ff4d6d' }}>錯誤：{error}</div>}
          <div>偵測到手：{handsDetected} 隻</div>
          <div>手勢狀態：{GESTURE_LABELS[gesture] || gesture}</div>
          <div>推論 FPS：{fps.toFixed(1)}</div>
        </div>
      )}
    </div>
  );
}
