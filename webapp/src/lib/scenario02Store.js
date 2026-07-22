import { useEffect } from 'react';

// Route-level progress persistence for scenario02. Deliberately coarse: we
// remember which page the player last reached, not mid-conversation state -
// every scripted page here replays from its own start in well under a
// minute, so a full per-message resume isn't worth the complexity. This is
// enough to satisfy "refresh keeps your place" and "restart the scenario".
const KEY = 'cibar-scenario02-progress';

export function saveScenario02Progress(route) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ route, updatedAt: Date.now() }));
  } catch {
    // localStorage unavailable (private mode, quota) - progress just won't persist.
  }
}

export function loadScenario02Progress() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function resetScenario02Progress() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

// Call from every scenario02 page (except Briefing) so a refresh anywhere
// in the flow can be resumed from Briefing's "繼續上次進度".
export function useSaveScenario02Progress(route) {
  useEffect(() => {
    saveScenario02Progress(route);
  }, [route]);
}
