import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getSharedCamera } from '../camera/sharedCamera';
import { loadHandLandmarker, detectFrame } from './handLandmarker';
import { createGestureClassifier } from './gestureClassifier';
import { ENABLE_GESTURE_TUTORIAL } from '../config/features';

const GestureContext = createContext(null);

export function useGesture() {
  const ctx = useContext(GestureContext);
  if (!ctx) throw new Error('useGesture() must be used within a GestureProvider');
  return ctx;
}

// Mounted once at the app root (see main.jsx), wrapping the router, so the
// hand-tracking model survives every route change - React Router only
// unmounts the matched route's own subtree, never its ancestors. Broadcasts
// already edge-triggered discrete gesture events; see gestureClassifier.js
// for why.
//
// Reads from getSharedCamera() (src/camera/sharedCamera.js) rather than
// opening its own getUserMedia() stream - the scanner page's MindAR tracker
// reads from that same shared session, so there is only ever one camera
// connection for the whole app. Because of that, pause()/resume() here only
// stop/restart this module's own per-frame hand-detection inference (to
// save CPU on pages that don't need gestures) - they never touch the shared
// camera stream itself, since another consumer (MindAR) may still be using
// it.
export function GestureProvider({ children }) {
  const [gesture, setGesture] = useState('idle');
  const [seq, setSeq] = useState(0);
  const [handsDetected, setHandsDetected] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [fps, setFps] = useState(0);
  const [cameraInfo, setCameraInfo] = useState(null);

  const pausedRef = useRef(false);

  useEffect(() => {
    // Gesture flow disabled (see config/features.js): never open the shared
    // camera or load the hand-tracking model from here. Scanner's MindAR
    // tracker still opens the shared camera itself when that page mounts -
    // this only skips this module's own eager, site-wide acquisition.
    if (!ENABLE_GESTURE_TUTORIAL) return undefined;

    let cancelled = false;
    let rafId = null;
    let landmarker = null;
    let lastFrameTime = performance.now();
    const classifier = createGestureClassifier();

    function tick(videoEl) {
      if (cancelled) return;
      rafId = requestAnimationFrame(() => tick(videoEl));
      if (pausedRef.current || !landmarker || videoEl.readyState < 2) return;

      const now = performance.now();
      const frameMs = now - lastFrameTime;
      lastFrameTime = now;
      setFps(frameMs > 0 ? 1000 / frameMs : 0);

      const result = detectFrame(landmarker, videoEl, now);
      const hands = result?.landmarks || [];
      setHandsDetected(hands.length);

      const next = classifier.processFrame(hands);
      setGesture(next);
      if (next !== 'idle') setSeq((s) => s + 1);
    }

    (async () => {
      try {
        const [{ videoEl, device }, hl] = await Promise.all([getSharedCamera(), loadHandLandmarker()]);
        if (cancelled) return;
        landmarker = hl;
        setCameraInfo({ label: device.label, deviceId: device.deviceId });
        setReady(true);
        rafId = requestAnimationFrame(() => tick(videoEl));
      } catch (e) {
        if (!cancelled) setError(e && e.message ? e.message : String(e));
      }
    })();

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      landmarker?.close?.();
      // Deliberately NOT stopping the shared camera here: it's owned by
      // sharedCamera.js and may still be in use by the scanner page's
      // MindAR tracker.
    };
  }, []);

  const value = {
    gesture,
    seq,
    handsDetected,
    ready,
    error,
    fps,
    cameraLabel: cameraInfo?.label ?? null,
    cameraDeviceId: cameraInfo?.deviceId ?? null,
    pause: () => {
      pausedRef.current = true;
    },
    resume: () => {
      pausedRef.current = false;
    },
  };

  return <GestureContext.Provider value={value}>{children}</GestureContext.Provider>;
}
