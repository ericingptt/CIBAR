import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TRACKER_TARGET_SRC, TRACKER_TARGETS } from './trackerConfig';

const SCANNING_MESSAGE = '啟動相機與追蹤中……請將鏡頭對準目標圖片';

// Port of js/tracker.js as a hook. MindAR is loaded via the import map in
// index.html (see comment there for why), resolved here with a runtime
// dynamic import() instead of a static <script type="module"> tag.
//
// Behavior ported 1:1: targets with a `route` show "辨識成功" then navigate
// once after ~1s (guarded against repeat triggers for the life of this
// mount); targets with route:null only ever update the status text.
//
// One change from the old version: cleanup now runs on React unmount
// (leaving the /scanner route) instead of on the `pagehide` event — in the
// old multi-page site, unmount and pagehide were roughly the same moment,
// but in the SPA, unmount on navigating away is the more correct signal, so
// the old global 'pagehide' listener was dropped rather than ported.
export function useTracker(containerRef) {
  const navigate = useNavigate();
  const [status, setStatus] = useState('MindAR 尚未啟動……');
  const [targetStates, setTargetStates] = useState({});
  const [stats, setStats] = useState({ fps: 0, frameMs: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let mindarThree = null;
    let trackerRunning = false;
    let cancelled = false;
    let navigateTriggered = false;

    function reportFatalError(err) {
      const message = err && err.message ? err.message : String(err);
      setStatus(`MindAR 啟動失敗：${message}（請確認 assets/targets/targets.mind 是否存在、是否為有效的編譯檔案）`);
    }

    function triggerNavigation(target) {
      if (navigateTriggered) return;
      navigateTriggered = true;
      setStatus('辨識成功：' + target.label);
      setTimeout(() => navigate(target.route), 1000);
    }

    function handleTargetFound(target) {
      setTargetStates((prev) => ({ ...prev, [target.index]: 'found' }));
      if (target.route) {
        triggerNavigation(target);
      } else if (!navigateTriggered) {
        setStatus('偵測成功：' + target.label);
      }
    }

    function handleTargetLost(target) {
      setTargetStates((prev) => ({ ...prev, [target.index]: 'lost' }));
      if (!target.route && !navigateTriggered) {
        setStatus(SCANNING_MESSAGE);
      }
    }

    // MindAR's .mind-file parser can throw in a way that escapes a normal
    // try/catch around `await three.start()` — this global safety net keeps
    // the page from silently getting stuck (see js/tracker.js history).
    const onError = (e) => reportFatalError(e.error || e.message);
    const onRejection = (e) => reportFatalError(e.reason);
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    (async () => {
      setStatus('MindAR 初始化中……');
      try {
        const { MindARThree } = await import('mind-ar-image-three');
        if (cancelled) return;

        mindarThree = new MindARThree({ container, imageTargetSrc: TRACKER_TARGET_SRC });
        TRACKER_TARGETS.forEach((t) => {
          const anchor = mindarThree.addAnchor(t.index);
          anchor.onTargetFound = () => handleTargetFound(t);
          anchor.onTargetLost = () => handleTargetLost(t);
        });

        setStatus(SCANNING_MESSAGE);
        trackerRunning = true;
        const { renderer, scene, camera } = mindarThree;
        let lastFrameTime = performance.now();
        await mindarThree.start();
        if (cancelled) return;

        renderer.setAnimationLoop(() => {
          if (!trackerRunning) return;
          renderer.render(scene, camera);
          const now = performance.now();
          const frameMs = now - lastFrameTime;
          lastFrameTime = now;
          setStats({ fps: frameMs > 0 ? 1000 / frameMs : 0, frameMs });
        });
      } catch (e) {
        if (!cancelled) reportFatalError(e);
      }
    })();

    return () => {
      cancelled = true;
      trackerRunning = false;
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
      if (mindarThree) {
        if (mindarThree.renderer) mindarThree.renderer.setAnimationLoop(null);
        try {
          mindarThree.stop();
        } catch (e) {
          // ignore - best-effort cleanup on unmount
        }
      }
    };
  }, [containerRef, navigate]);

  return { status, targetStates, stats };
}
