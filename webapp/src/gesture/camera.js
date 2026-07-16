// Owns getUserMedia() only - no knowledge of hands/gestures. Kept separate so
// the acquisition lifecycle (including the pause/resume mitigation hook used
// by Scanner.jsx, see useTracker.js's comments) is independently testable.
export function createCameraSession() {
  let stream = null;
  let videoEl = null;
  let lastFacingMode = 'user';

  async function start({ facingMode = 'user' } = {}) {
    lastFacingMode = facingMode;
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false });
    videoEl = document.createElement('video');
    videoEl.autoplay = true;
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.srcObject = stream;
    await new Promise((resolve) => videoEl.addEventListener('loadedmetadata', resolve, { once: true }));
    await videoEl.play();
    return { stream, videoEl };
  }

  function stop() {
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
    if (videoEl) videoEl.srcObject = null;
    videoEl = null;
  }

  // Fully releases the camera hardware (rather than just disabling tracks) so
  // a second consumer - e.g. MindAR's own getUserMedia() call on the scanner
  // page - can actually acquire it. See the scanner-page camera-contention
  // mitigation described in src/pages/Scanner.jsx.
  function pause() {
    stop();
  }

  function resume() {
    return start({ facingMode: lastFacingMode });
  }

  return {
    start,
    stop,
    pause,
    resume,
    get videoEl() {
      return videoEl;
    },
    get stream() {
      return stream;
    },
  };
}
