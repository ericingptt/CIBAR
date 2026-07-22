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
