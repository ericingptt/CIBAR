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

// Which of Sophie/Lina's mini-arcs the player has already resolved (matched
// -> chatted -> she ended it), so returning to /dating-browse resumes at
// the next unresolved card instead of restarting from Sophie.
const RESOLVED_KEY = 'cibar-scenario02-dating-resolved';

export function getResolvedDatingCards() {
  try {
    const raw = localStorage.getItem(RESOLVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markDatingCardResolved(id) {
  try {
    const current = getResolvedDatingCards();
    if (!current.includes(id)) {
      localStorage.setItem(RESOLVED_KEY, JSON.stringify([...current, id]));
    }
  } catch {
    // localStorage unavailable - progress just won't persist.
  }
}

// How the player ended up talking to Emily - null (not reached yet),
// 'liked' (swiped her directly), 'reconsidered' (skipped her, then looked
// at her "someone liked you" notice and opened the chat anyway), or
// 'simulation' (skipped her and explicitly declined, entering the
// educational case-study path instead). DatingChat reads this to pick its
// opening line/banner. Stored rather than passed only via router location
// state, since location state doesn't survive a hard refresh.
const EMILY_DECISION_KEY = 'cibar-scenario02-emily-decision';

export function saveEmilyDecision(decision) {
  try {
    localStorage.setItem(EMILY_DECISION_KEY, decision);
  } catch {
    // ignore
  }
}

export function getEmilyDecision() {
  try {
    return localStorage.getItem(EMILY_DECISION_KEY);
  } catch {
    return null;
  }
}
