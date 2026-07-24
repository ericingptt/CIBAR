// Explicit, per-session override for which camera source getSharedCamera()
// should use - set by CameraSourceSelect.jsx so testing without the
// physical 佐臻/Jorjin glasses (e.g. "打開原生相機") can force a normal
// getUserMedia() camera even in contexts where the native bridge might
// otherwise be auto-detected, and so "打開佐臻AR相機" can force waiting on
// bridged frames even if the auto-detect signal (window.AndroidCamera)
// isn't present for some reason.
//
// sessionStorage (not the 'cibar-scenario02-' prefixed keys) since this is
// an app-level device choice, not scenario progress - it should NOT be
// swept by resetScenario02(), and should persist for the rest of this
// browser tab's session once chosen.
const KEY = 'cibar-camera-source-preference';

export function setCameraSourcePreference(mode) {
  try {
    sessionStorage.setItem(KEY, mode);
  } catch {
    // sessionStorage unavailable - preference just won't persist across pages.
  }
}

// Returns 'native', 'jorjin', or null (no explicit choice made yet - callers
// should fall back to auto-detection).
export function getCameraSourcePreference() {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}
