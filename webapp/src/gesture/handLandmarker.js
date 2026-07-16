import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

// Model + WASM runtime are self-hosted under public/ rather than fetched from
// Google's CDN at runtime, matching this repo's existing precedent of
// vendoring binary assets (assets/targets/targets.mind) - avoids a runtime
// dependency on an external CDN being reachable on whatever network the
// glasses are on, and lets the service worker precache them for offline use.
const WASM_BASE_PATH = `${import.meta.env.BASE_URL}mediapipe-wasm`;
const MODEL_ASSET_PATH = `${import.meta.env.BASE_URL}models/hand_landmarker.task`;

export async function loadHandLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(WASM_BASE_PATH);
  return HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MODEL_ASSET_PATH,
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numHands: 2,
  });
}

export function detectFrame(landmarker, videoEl, timestampMs) {
  return landmarker.detectForVideo(videoEl, timestampMs);
}
