// Feature switch for the gesture-controlled flow: the opening gesture
// tutorial (scroll + select practice), gesture-driven language selection,
// and the persistent camera/MediaPipe hand-tracking pipeline that runs
// site-wide behind it.
//
// Off for now - there's no AR-glasses hardware to test gestures on yet, and
// re-running the tutorial on every reload is too slow for iterating on
// scenario content. Nothing gesture-related is deleted; this only gates
// whether it runs. Flip back to `true` to restore the full flow with no
// further changes needed.
export const ENABLE_GESTURE_TUTORIAL = false;

// Same idea, for the scanner page's MindAR image-tracking pipeline: off
// while development is focused on scenario content rather than the
// physical scan step, so opening /scanner doesn't need a camera or trigger
// a permission prompt. The page's "模擬掃到" buttons (manual scenario
// navigation) work exactly the same either way, since they never depended
// on MindAR. Flip back to `true` to restore real image scanning with no
// further changes needed.
export const ENABLE_MINDAR_SCANNER = false;
