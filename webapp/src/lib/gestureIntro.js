const GESTURE_INTRO_DONE_KEY = 'gestureIntroDone';

// Once a visitor has proven they can perform both gestures, later visits
// (or a page refresh) skip straight to the language page instead of forcing
// the tutorial again - same pattern the app already uses for language choice
// (see hasLanguage() in lib/lang.js) and the scanner route guard.
export function hasCompletedGestureIntro() {
  return Boolean(localStorage.getItem(GESTURE_INTRO_DONE_KEY));
}

export function setGestureIntroCompleted() {
  localStorage.setItem(GESTURE_INTRO_DONE_KEY, '1');
}
