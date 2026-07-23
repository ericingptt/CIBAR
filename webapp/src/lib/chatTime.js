import { useState } from 'react';

// Shared clock + per-message timestamp logic for every LINE-style chat
// (scenario01's LineTeacher, scenario02's PrivateChat, and whatever
// scenario03-05 add later) so date/time/read-receipt behavior only needs to
// be right once, in one place.

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

export function formatDateDivider(date) {
  return `${date.getMonth() + 1}月${date.getDate()}日 ${WEEKDAYS[date.getDay()]}`;
}

export function formatTime(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Captures "the moment the player opened this chat" once, persisted so a
// refresh mid-conversation doesn't reroll it (message times would otherwise
// jump around on every render/reload) - but a fresh sessionStorage means a
// new tab/session (or, for scenario02, an explicit resetScenario02() call,
// since that sweeps every key sharing its 'cibar-scenario02-' prefix) gets a
// genuinely new "now" next time.
export function useChatClock(storageKey) {
  const [startDate] = useState(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) return new Date(JSON.parse(raw));
    } catch {
      // fall through to a fresh clock
    }
    const now = new Date();
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(now.getTime()));
    } catch {
      // sessionStorage unavailable - clock just won't survive a refresh.
    }
    return now;
  });
  return startDate;
}

const HHMM_RE = /^(\d{1,2}):(\d{2})$/;
const PAUSE_KINDS = new Set(['video', 'image', 'link', 'tip', 'shot']);

// Derives one timestamp per timeline entry, deterministically from the
// entry's position - never from Date.now() at render time - so the same
// timeline always produces the same times regardless of how many times
// React re-renders it. Returns null for entries that shouldn't show their
// own time (date dividers, and inline "system" time-stamp lines like
// PrivateChat's existing "23:18" markers, which set the clock rather than
// needing a second time label next to them).
//
// Rules (deliberately simple, not a real clock simulation):
// - a normal message nudges the clock forward 0-1 minutes
// - right after a video/image/link/tip/shot ("something the player had to
//   stop and interact with"), the next message jumps 2-5 minutes instead
// - a divider resets the date (startDate + dayOffsets[label], falling back
//   to no offset) and puts the time-of-day back to the session's start time,
//   so later "days" don't just inherit whatever hour the clock drifted to
// - an inline system "HH:mm" line snaps the clock to that exact time
export function computeTimestamps(timeline, startDate, dayOffsets = {}) {
  const smallBumps = [0, 1, 0, 1, 1];
  const pauseBumps = [2, 3, 4, 5];
  let current = new Date(startDate);
  const baseH = startDate.getHours();
  const baseM = startDate.getMinutes();
  let afterPause = false;

  return timeline.map((item, i) => {
    if (item.kind === 'divider') {
      const offset = dayOffsets[item.label] ?? 0;
      current = addDays(startDate, offset);
      current.setHours(baseH, baseM, 0, 0);
      afterPause = false;
      return null;
    }
    if (item.from === 'system' && HHMM_RE.test((item.text || '').trim())) {
      const [, h, m] = HHMM_RE.exec(item.text.trim());
      current = new Date(current);
      current.setHours(Number(h), Number(m), 0, 0);
      afterPause = false;
      return null;
    }
    const bump = afterPause ? pauseBumps[i % pauseBumps.length] : smallBumps[i % smallBumps.length];
    current = new Date(current.getTime() + bump * 60000);
    afterPause = PAUSE_KINDS.has(item.kind);
    return new Date(current);
  });
}
