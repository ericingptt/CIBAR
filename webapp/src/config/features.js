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

// Same idea, for the scanner page's MindAR image-tracking pipeline. Re-
// enabled for on-device testing with the 佐臻 (Jorjin) glasses bridge: MindAR
// only ever consumes a plain <video> element (see useTracker.js/sharedCamera.js
// below) and never cares how that element's frames got there, so this works
// unchanged whether the stream comes straight from VITURE's camera via
// getUserMedia() or is bridged in by 佐臻's native layer as long as that
// bridge also surfaces as a normal getUserMedia()-enumerable video input (the
// common case for AR-glasses SDKs, which register a virtual camera device).
// If 佐臻's bridge instead hands frames to the page through some other,
// non-getUserMedia channel (e.g. pushing raw frames into a canvas directly),
// sharedCamera.js would need a second input path added for that - flag this
// if that's the actual integration shape tomorrow. The page's "模擬掃到"
// buttons (manual scenario navigation) are unaffected either way, since they
// never depended on MindAR.
export const ENABLE_MINDAR_SCANNER = true;
