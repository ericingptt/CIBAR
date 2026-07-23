import { useEffect } from 'react';

// Tracks which page the player last reached, purely for the reset checklist
// below (resetScenario02() clears it along with everything else) - nothing
// reads it back to offer a "resume" UI. A mid-scenario browser refresh
// already lands back on the right page for free, since the route itself
// lives in the URL (HashRouter), not in this value.
const KEY = 'cibar-scenario02-progress';

export function saveScenario02Progress(route) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ route, updatedAt: Date.now() }));
  } catch {
    // localStorage unavailable (private mode, quota) - progress just won't persist.
  }
}

// Call from every scenario02 page (except Briefing).
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

// Every persisted scenario02 key shares this prefix (KEY/RESOLVED_KEY/
// EMILY_DECISION_KEY above), so sweeping by prefix - rather than naming each
// key here individually - also catches anything added later without this
// function needing an update. Everything else the scenario touches (quiz
// answers, deposit/profit/withdrawal amounts, platform registration, watched
// videos, dialogue timelines...) only ever lives in per-page React state,
// which already resets on its own the moment that page unmounts; there is no
// second, page-local storage mechanism for any of it to fall out of sync
// with.
const SCENARIO02_KEY_PREFIX = 'cibar-scenario02-';

// The single reset entry point for "start scenario02 over from nothing" -
// used both when re-entering from the Scanner and by every in-scenario
// "重新開始" button. Clears every persisted key so the next mount of
// DatingBrowse/Briefing/etc. recomputes its initial state (index 0, no
// resolved cards, no Emily decision, no saved route) instead of resuming.
export function resetScenario02() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(SCENARIO02_KEY_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // localStorage unavailable - nothing to clear.
  }
  try {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith(SCENARIO02_KEY_PREFIX))
      .forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // sessionStorage unavailable - nothing to clear.
  }
}
