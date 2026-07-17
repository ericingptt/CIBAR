// Device enumeration + preference logic, split out from sharedCamera.js so
// it's independently testable without touching getUserMedia/video elements.

const PREFERRED_DEVICE_ID_KEY = 'cameraDeviceId';

// Label patterns tried in order when no manual override is stored. Device
// labels vary by OS/driver, so this is a best-effort guess, not a guarantee -
// that's exactly why CameraPicker.jsx exists as a manual override: if none
// of these match (or match the wrong device, e.g. a laptop's built-in
// webcam happens to contain one of these words), the user can pick the
// right one from the enumerated list and it's remembered from then on.
const PREFERRED_LABEL_PATTERNS = [/viture/i, /luma/i];

export async function listVideoInputDevices() {
  let devices = await navigator.mediaDevices.enumerateDevices();
  let videoInputs = devices.filter((d) => d.kind === 'videoinput');

  // Labels are blank until a getUserMedia permission has been granted at
  // least once - request a throwaway generic stream just to unlock them,
  // then re-enumerate and immediately release it.
  if (videoInputs.length > 0 && videoInputs.every((d) => !d.label)) {
    const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
    tempStream.getTracks().forEach((t) => t.stop());
    devices = await navigator.mediaDevices.enumerateDevices();
    videoInputs = devices.filter((d) => d.kind === 'videoinput');
  }

  return videoInputs;
}

export function getStoredPreferredDeviceId() {
  return localStorage.getItem(PREFERRED_DEVICE_ID_KEY);
}

export function setStoredPreferredDeviceId(deviceId) {
  localStorage.setItem(PREFERRED_DEVICE_ID_KEY, deviceId);
}

// Manual override (if it still corresponds to a currently-plugged-in
// device) wins; otherwise the first label matching a preferred pattern;
// otherwise just the first enumerated device.
export function pickPreferredDevice(devices) {
  if (devices.length === 0) return null;

  const storedId = getStoredPreferredDeviceId();
  if (storedId) {
    const stored = devices.find((d) => d.deviceId === storedId);
    if (stored) return stored;
  }

  const patternMatch = devices.find((d) => PREFERRED_LABEL_PATTERNS.some((p) => p.test(d.label)));
  if (patternMatch) return patternMatch;

  return devices[0];
}
