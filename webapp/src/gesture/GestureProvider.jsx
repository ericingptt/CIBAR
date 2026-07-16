import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createCameraSession } from './camera';
import { loadHandLandmarker, detectFrame } from './handLandmarker';
import { createGestureClassifier } from './gestureClassifier';

const GestureContext = createContext(null);

export function useGesture() {
  const ctx = useContext(GestureContext);
  if (!ctx) throw new Error('useGesture() must be used within a GestureProvider');
  return ctx;
}

// Mounted once at the app root (see main.jsx), wrapping the router, so the
// camera + model survive every route change - React Router only unmounts the
// matched route's own subtree, never its ancestors. Broadcasts already
// edge-triggered discrete gesture events; see gestureClassifier.js for why.
export function GestureProvider({ children }) {
  const [gesture, setGesture] = useState('idle');
  const [seq, setSeq] = useState(0);
  const [handsDetected, setHandsDetected] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [fps, setFps] = useState(0);

  const pauseImplRef = useRef(() => {});
  const resumeImplRef = useRef(() => {});

  useEffect(() => {
    let cancelled = false;
    let rafId = null;
    let landmarker = null;
    let lastFrameTime = performance.now();
    let paused = false;
    const camera = createCameraSession();
    const classifier = createGestureClassifier();
    // Read from a ref rather than the init() closure's local variable so
    // resume() (which re-acquires a fresh <video> element) is picked up by
    // the already-running detection loop instead of it reading a stale,
    // detached element.
    const videoElRef = { current: null };

    function tick() {
      if (cancelled) return;
      rafId = requestAnimationFrame(tick);
      const videoEl = videoElRef.current;
      if (paused || !landmarker || !videoEl || videoEl.readyState < 2) return;

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

    async function acquireCamera() {
      const { videoEl } = await camera.start({ facingMode: 'user' });
      videoElRef.current = videoEl;
    }

    (async () => {
      try {
        const [, hl] = await Promise.all([acquireCamera(), loadHandLandmarker()]);
        if (cancelled) return;
        landmarker = hl;
        setReady(true);
      } catch (e) {
        if (!cancelled) setError(e && e.message ? e.message : String(e));
      }
    })();

    rafId = requestAnimationFrame(tick);

    pauseImplRef.current = () => {
      paused = true;
      camera.pause();
      videoElRef.current = null;
      classifier.reset();
    };
    resumeImplRef.current = async () => {
      if (cancelled) return;
      paused = false;
      try {
        await acquireCamera();
      } catch (e) {
        setError(e && e.message ? e.message : String(e));
      }
    };

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      camera.stop();
      landmarker?.close?.();
    };
  }, []);

  const value = {
    gesture,
    seq,
    handsDetected,
    ready,
    error,
    fps,
    pause: () => pauseImplRef.current(),
    resume: () => resumeImplRef.current(),
  };

  return <GestureContext.Provider value={value}>{children}</GestureContext.Provider>;
}
