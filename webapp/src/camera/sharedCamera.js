import { listVideoInputDevices, pickPreferredDevice } from './deviceSelection';
import { getCameraSourcePreference } from './cameraSourcePreference';

// Single shared camera session for the whole app - both the persistent
// gesture module AND the scanner's MindAR tracker read from this SAME
// stream/video element, rather than each independently calling
// getUserMedia(). Two independent opens of the same physical external UVC
// camera is exactly the failure mode that was reported (each side landing
// on a different default device, or one of them failing/freezing when both
// try to open the same external camera at once) - this module exists so
// there is only ever one getUserMedia() call for the whole app.
let sessionPromise = null;
let currentSession = null;

export function getCurrentCameraInfo() {
  if (!currentSession) return null;
  return { label: currentSession.device.label, deviceId: currentSession.device.deviceId };
}

// Whether to use the native camera-bridge (public/camera-bridge.js) instead
// of getUserMedia() is decided in this order:
//   1. An explicit choice from CameraSourceSelect.jsx (cameraSourcePreference.js)
//      always wins, since it exists specifically to let testing without the
//      physical 佐臻/Jorjin glasses force a normal getUserMedia() camera even
//      inside the native shell, or force bridge-waiting even outside it.
//   2. Otherwise, auto-detect: public/camera-bridge.js sets
//      window.__cibarCameraBridge.isNativeShell as soon as it runs (true
//      when window.AndroidCamera is present), since inside that shell
//      getUserMedia() is never going to work - the shell was built to push
//      frames in via window.onNativeCameraFrame instead, not to grant
//      camera permission to the page.
// Returns null immediately (not a promise) when neither applies, so normal
// browsers fall straight through to the getUserMedia() path below untouched.
function getBridgeCameraSession() {
  const preference = getCameraSourcePreference();
  if (preference === 'native') return null;

  const bridge = window.__cibarCameraBridge;
  const useBridge = preference === 'jorjin' || (!preference && bridge && bridge.isNativeShell);
  if (!useBridge) return null;

  if (!bridge) {
    return Promise.reject(new Error('已選擇「佐臻 AR 相機」，但找不到相機橋接程式（window.__cibarCameraBridge 未定義）'));
  }

  return (async () => {
    const videoEl = await Promise.race([
      bridge.getVideoElement(),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('等待原生鏡頭橋接影格逾時（8 秒內未收到任何影格）')), 8000);
      }),
    ]);
    if (!videoEl.videoWidth) {
      await new Promise((resolve) => videoEl.addEventListener('loadedmetadata', resolve, { once: true }));
    }
    // Same critical fix as the getUserMedia path below - MindAR reads the
    // plain width/height attributes, not videoWidth/videoHeight.
    videoEl.width = videoEl.videoWidth;
    videoEl.height = videoEl.videoHeight;
    return {
      stream: videoEl.srcObject,
      videoEl,
      device: { label: '佐臻原生相機橋接（camera-bridge.js）', deviceId: 'jorjin-native-bridge' },
      devices: [],
    };
  })();
}

export function getSharedCamera() {
  if (sessionPromise) return sessionPromise;

  sessionPromise = (async () => {
    const bridgeSession = getBridgeCameraSession();
    if (bridgeSession) {
      currentSession = await bridgeSession;
      return currentSession;
    }

    const devices = await listVideoInputDevices();
    if (devices.length === 0) {
      throw new Error('找不到任何攝影機裝置（enumerateDevices 回傳 0 個 videoinput）');
    }
    const device = pickPreferredDevice(devices);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: device.deviceId } },
      audio: false,
    });

    const videoEl = document.createElement('video');
    videoEl.autoplay = true;
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.srcObject = stream;
    await new Promise((resolve) => videoEl.addEventListener('loadedmetadata', resolve, { once: true }));
    await videoEl.play();

    // Critical: MindAR's internal per-frame capture (controller's
    // inputLoader.loadInput()) reads video.width/video.height - the plain
    // HTML width/height attributes - NOT video.videoWidth/videoHeight, to
    // decide how much of the frame to draw via canvas drawImage(). Those
    // attributes default to 0 on a plain `document.createElement('video')`
    // and are never set automatically from the decoded stream, so without
    // this, MindAR draws a zero-sized region every frame and "detects"
    // nothing - not because the camera or the target file is wrong, but
    // because every frame it reads is blank. MindAR's own internal
    // _startVideo() sets these explicitly when it owns the camera itself;
    // since we're feeding it an externally-created video element instead
    // (see useTracker.js), we have to replicate that side effect here.
    videoEl.width = videoEl.videoWidth;
    videoEl.height = videoEl.videoHeight;

    currentSession = { stream, videoEl, device, devices };
    return currentSession;
  })();

  sessionPromise.catch(() => {
    // Let a failed acquisition be retried (e.g. after the user grants
    // permission or plugs in a device) instead of permanently caching a
    // rejected promise.
    sessionPromise = null;
  });

  return sessionPromise;
}

export function stopSharedCamera() {
  currentSession?.stream.getTracks().forEach((t) => t.stop());
  currentSession = null;
  sessionPromise = null;
}
