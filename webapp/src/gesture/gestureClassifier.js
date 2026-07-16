// @ts-check
// Pure, framework-agnostic gesture state machine - no DOM/React dependency,
// so it's directly unit-testable. Broadcasts already edge-triggered discrete
// events (not raw continuous landmark data): both gestures are debounced by
// definition in the spec, so putting that hysteresis here once means no
// consuming page ever has to reimplement it.

/** @typedef {"idle"|"scrollUp"|"scrollDown"|"select"} GestureState */

// Normalized (0-1) index-tip<->thumb-tip distance below which a pinch is
// recognized as a "select". Tune these against real hands/lighting/device -
// these are engineering starting points, not validated values (see plan).
export const PINCH_DISTANCE_THRESHOLD = 0.06;
// Must open back past this (larger) distance before the next pinch can
// trigger again - this is the "must open then re-pinch" debounce, done as
// hysteresis so noisy frames near the boundary don't chatter.
export const PINCH_RELEASE_THRESHOLD = 0.09;

// Normalized vertical displacement from the current anchor that triggers a
// scroll.
export const SCROLL_DISTANCE_THRESHOLD = 0.12;
// Must return within this (smaller) distance of the anchor before the next
// scroll can trigger - the "return to neutral before next trigger" debounce.
export const SCROLL_RESET_THRESHOLD = 0.03;

// MediaPipe HandLandmarker landmark indices.
const THUMB_TIP = 4;
const INDEX_TIP = 8;

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function createGestureClassifier() {
  let pinched = false;
  let scrollAnchorY = null;
  let scrollArmed = true;

  function reset() {
    pinched = false;
    scrollAnchorY = null;
    scrollArmed = true;
  }

  /**
   * @param {Array<Array<{x:number,y:number,z:number}>>} handsLandmarks - one
   *   array of 21 landmarks per detected hand (MediaPipe HandLandmarker
   *   output shape).
   * @returns {GestureState}
   */
  function processFrame(handsLandmarks) {
    if (!handsLandmarks || handsLandmarks.length === 0) {
      // Losing tracking mid-scroll shouldn't let a stale anchor cause a
      // spurious trigger once a hand reappears, so the scroll anchor resets.
      // The pinch latch deliberately does NOT reset here: a brief
      // occlusion/frame-drop mid-pinch shouldn't itself count as "opened".
      scrollAnchorY = null;
      scrollArmed = true;
      return 'idle';
    }

    // Only the first detected hand drives gestures - two-hand conflicts are
    // unaddressed by the spec (documented assumption, see plan).
    const hand = handsLandmarks[0];
    const thumbTip = hand[THUMB_TIP];
    const indexTip = hand[INDEX_TIP];

    const pinchDistance = distance(thumbTip, indexTip);
    if (!pinched && pinchDistance < PINCH_DISTANCE_THRESHOLD) {
      pinched = true;
      return 'select';
    }
    if (pinched && pinchDistance > PINCH_RELEASE_THRESHOLD) {
      pinched = false;
    }

    const y = indexTip.y; // normalized [0,1], increases downward
    if (scrollAnchorY === null) {
      scrollAnchorY = y;
      return 'idle';
    }
    const delta = y - scrollAnchorY;
    if (scrollArmed && Math.abs(delta) > SCROLL_DISTANCE_THRESHOLD) {
      scrollArmed = false;
      scrollAnchorY = y; // re-anchor at the trigger point for the reset check
      return delta > 0 ? 'scrollDown' : 'scrollUp';
    }
    if (!scrollArmed && Math.abs(delta) < SCROLL_RESET_THRESHOLD) {
      scrollArmed = true;
    }

    return 'idle';
  }

  return { processFrame, reset };
}
