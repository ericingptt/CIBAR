import { useEffect, useState } from 'react';
import { listVideoInputDevices, setStoredPreferredDeviceId } from './deviceSelection';
import { getCurrentCameraInfo } from './sharedCamera';

// Manual override for camera selection: automatic label-pattern matching in
// deviceSelection.js is a best-effort guess (device labels vary by
// OS/driver), so this lets the user pick the correct physical camera from
// the actually-enumerated list when the guess is wrong - same idea as the
// old camera-test.html's device dropdown. Switching devices reloads the
// page: both MindAR and the gesture pipeline are already mid-session with
// the old stream, and re-plumbing a live swap is a lot of complexity for a
// setup step that only needs to happen once per machine.
export function CameraPicker() {
  const [devices, setDevices] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const current = getCurrentCameraInfo();

  useEffect(() => {
    listVideoInputDevices()
      .then(setDevices)
      .catch((e) => setLoadError(e && e.message ? e.message : String(e)));
  }, []);

  function onChange(e) {
    const deviceId = e.target.value;
    if (!deviceId) return;
    setStoredPreferredDeviceId(deviceId);
    window.location.reload();
  }

  if (loadError) {
    return <div style={{ color: '#ff4d6d' }}>裝置列表讀取失敗：{loadError}</div>;
  }

  return (
    <div style={{ marginTop: 6 }}>
      <div>目前使用：{current ? `${current.label || '(無標籤)'}` : '尚未取得'}</div>
      <select
        onChange={onChange}
        value={current?.deviceId || ''}
        style={{ marginTop: 4, maxWidth: 220 }}
      >
        <option value="" disabled>
          切換攝影機來源……
        </option>
        {devices.map((d) => (
          <option key={d.deviceId} value={d.deviceId}>
            {d.label || d.deviceId.slice(0, 8)}
          </option>
        ))}
      </select>
    </div>
  );
}
