import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TRACKER_TARGET_SRC, TRACKER_TARGETS } from './trackerConfig';
import { getSharedCamera } from '../camera/sharedCamera';
import { ENABLE_MINDAR_SCANNER } from '../config/features';
import { resetScenario02 } from '../lib/scenario02Store';

const SCANNING_MESSAGE = '啟動相機與追蹤中……請將鏡頭對準目標圖片';

// Port of js/tracker.js as a hook. MindAR is loaded via the import map in
// index.html (see comment there for why), resolved here with a runtime
// dynamic import() instead of a static <script type="module"> tag.
//
// Behavior ported 1:1: targets with a `route` show "辨識成功" then navigate
// once after ~1s (guarded against repeat triggers for the life of this
// mount); targets with route:null only ever update the status text.
//
// Camera: MindARThree normally opens its OWN getUserMedia() stream
// internally (via its private _startVideo()), with device selection based
// only on a facingMode:'environment' hint - on a Windows laptop with an
// external UVC camera (e.g. VITURE glasses) plugged in, that hint is
// unreliable and can silently resolve to the built-in webcam instead. This
// hook instead reads the single shared camera session from
// src/camera/sharedCamera.js (also used by the gesture module, so there is
// only ever one getUserMedia() call for the whole app, using an explicitly
// selected deviceId) and feeds it into MindAR by assigning `mindarThree.video`
// directly and calling the internal `_startAR()` instead of the public
// `start()` - `start()` unconditionally calls `_startVideo()` first, which
// would open a second, independent camera connection. This relies on
// MindAR's internal method/property names rather than its public
// constructor API, which is a real fragility tradeoff, but there is no
// supported way to hand MindARThree an existing stream; the mind-ar version
// is pinned (1.2.5) specifically so this doesn't silently break underneath
// us on an unrelated dependency update.
export function useTracker(containerRef) {
  const navigate = useNavigate();
  const [status, setStatus] = useState('MindAR 尚未啟動……');
  const [targetStates, setTargetStates] = useState({});
  const [stats, setStats] = useState({ fps: 0, frameMs: 0 });
  const [cameraLabel, setCameraLabel] = useState(null);
  const [targetsLoaded, setTargetsLoaded] = useState(null); // null=unknown, number=count, 'error'

  useEffect(() => {
    // MindAR disabled (see config/features.js): never open the shared
    // camera or load the tracker. The page's "模擬掃到" buttons don't use
    // this hook at all, so manual scenario navigation is unaffected.
    if (!ENABLE_MINDAR_SCANNER) {
      setStatus('MindAR 已停用（開發模式）：請使用下方「模擬掃到」按鈕。');
      return undefined;
    }

    const container = containerRef.current;
    if (!container) return undefined;

    let mindarThree = null;
    let trackerRunning = false;
    let cancelled = false;
    let navigateTriggered = false;

    function reportFatalError(stage, err) {
      const message = err && err.message ? err.message : String(err);
      setTargetsLoaded('error');
      setStatus(`${stage}失敗：${message}`);
    }

    function triggerNavigation(target) {
      if (navigateTriggered) return;
      navigateTriggered = true;
      // Same rule as the "模擬掃到" buttons in Scanner.jsx: entering
      // scenario02 this way must also always start a fresh run.
      if (target.scenario === 'romance') resetScenario02();
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
    // try/catch around the tracker startup — this global safety net keeps
    // the page from silently getting stuck (see js/tracker.js history).
    const onError = (e) => reportFatalError('MindAR 啟動', e.error || e.message);
    const onRejection = (e) => reportFatalError('MindAR 啟動', e.reason);
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    (async () => {
      setStatus('正在取得共用攝影機……');
      let sharedVideoEl;
      let sharedDevice;
      try {
        const shared = await getSharedCamera();
        if (cancelled) return;
        sharedVideoEl = shared.videoEl;
        sharedDevice = shared.device;
        setCameraLabel(sharedDevice.label || '(無標籤裝置)');
      } catch (e) {
        reportFatalError('取得攝影機', e);
        return;
      }

      setStatus('MindAR 初始化中……');
      try {
        const { MindARThree } = await import('mind-ar-image-three');
        if (cancelled) return;

        mindarThree = new MindARThree({ container, imageTargetSrc: TRACKER_TARGET_SRC });

        // Feed in the shared video instead of letting MindAR open its own
        // camera connection (see hook-level comment above).
        mindarThree.video = sharedVideoEl;
        sharedVideoEl.style.position = 'absolute';
        sharedVideoEl.style.top = '0px';
        sharedVideoEl.style.left = '0px';
        sharedVideoEl.style.zIndex = '-2';
        container.appendChild(sharedVideoEl);

        TRACKER_TARGETS.forEach((t) => {
          const anchor = mindarThree.addAnchor(t.index);
          anchor.onTargetFound = () => handleTargetFound(t);
          anchor.onTargetLost = () => handleTargetLost(t);
        });

        setStatus('讀取 target 檔案中……');
        mindarThree.ui.showLoading();
        trackerRunning = true;
        const { renderer, scene, camera } = mindarThree;
        let lastFrameTime = performance.now();

        await mindarThree._startAR();
        if (cancelled) return;

        setTargetsLoaded(TRACKER_TARGETS.length);
        setStatus(SCANNING_MESSAGE);

        renderer.setAnimationLoop(() => {
          if (!trackerRunning) return;
          renderer.render(scene, camera);
          const now = performance.now();
          const frameMs = now - lastFrameTime;
          lastFrameTime = now;
          setStats({ fps: frameMs > 0 ? 1000 / frameMs : 0, frameMs });
        });
      } catch (e) {
        reportFatalError('MindAR target 載入', e);
      }
    })();

    return () => {
      cancelled = true;
      trackerRunning = false;
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
      if (mindarThree) {
        if (mindarThree.renderer) mindarThree.renderer.setAnimationLoop(null);
        // Deliberately NOT calling mindarThree.stop(): that method stops the
        // tracks on this.video.srcObject directly, which would kill the
        // shared camera stream for the rest of the app (including gesture
        // recognition) since MindAR is now sharing our one camera session
        // instead of owning its own. Halting the render loop and the
        // controller's own video-processing loop is enough cleanup for
        // leaving this page.
        try {
          mindarThree.controller?.stopProcessVideo();
        } catch (e) {
          // best-effort cleanup on unmount
        }
      }
    };
  }, [containerRef, navigate]);

  return { status, targetStates, stats, cameraLabel, targetsLoaded };
}
