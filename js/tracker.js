// MindAR image-tracking pipeline test. Replaces the earlier coco-ssd object
// detector: this scenario recognizes a known, closed set of images/props, so
// feature-point image tracking is the right tool instead of object
// classification. Paths/target list live in js/tracker-config.js.
import { MindARThree } from 'mind-ar-image-three';

const SCANNING_MESSAGE = '啟動相機與追蹤中……請將鏡頭對準目標圖片';

let mindarThree = null;
let trackerRunning = false;
let navigateTriggered = false;
const targetStates = {};

function renderTargetStatus(){
  const el = document.getElementById('trackerTargets');
  if(!el) return;
  el.innerHTML = TRACKER_TARGETS.map(t => {
    const state = targetStates[t.index] || 'lost';
    const label = state === 'found' ? '✅ 找到／追蹤中' : '⬜ 尚未偵測到';
    return `<p class="mini">Target #${t.index}（${t.name}）：${label}</p>`;
  }).join('');
}

function createTracker(container){
  return new MindARThree({
    container,
    imageTargetSrc: TRACKER_TARGET_SRC
  });
}

// 有 route 的 target（目前是假投資）：先顯示「辨識成功」文字停留一秒，再跳轉頁面，
// 同一次停留在這個頁面時只會跳轉一次。沒有 route 的 target（假交友、假賣家）：只顯示
// 「偵測成功」文字、不跳轉，之後補上 route 就會自動變成會跳轉，不用改這裡的邏輯。
function triggerNavigation(target){
  if(navigateTriggered) return;
  navigateTriggered = true;
  const statusEl = document.getElementById('trackerStatus');
  if(statusEl) statusEl.textContent = '辨識成功：' + target.label;
  setTimeout(() => go(target.route), 1000);
}

function handleTargetFound(target){
  targetStates[target.index] = 'found';
  renderTargetStatus();
  if(target.route){
    triggerNavigation(target);
  }else{
    const statusEl = document.getElementById('trackerStatus');
    if(statusEl && !navigateTriggered) statusEl.textContent = '偵測成功：' + target.label;
  }
}

function handleTargetLost(target){
  targetStates[target.index] = 'lost';
  renderTargetStatus();
  if(!target.route){
    const statusEl = document.getElementById('trackerStatus');
    if(statusEl && !navigateTriggered) statusEl.textContent = SCANNING_MESSAGE;
  }
}

function setupAnchors(three){
  TRACKER_TARGETS.forEach(t => {
    const anchor = three.addAnchor(t.index);
    targetStates[t.index] = 'lost';
    anchor.onTargetFound = () => handleTargetFound(t);
    anchor.onTargetLost = () => handleTargetLost(t);
  });
}

async function startTracker(three, onStats){
  const { renderer, scene, camera } = three;
  trackerRunning = true;
  let lastFrameTime = performance.now();
  await three.start();
  renderer.setAnimationLoop(() => {
    if(!trackerRunning) return;
    renderer.render(scene, camera);
    const now = performance.now();
    const frameMs = now - lastFrameTime;
    lastFrameTime = now;
    if(onStats) onStats({ fps: frameMs > 0 ? 1000 / frameMs : 0, frameMs });
  });
}

function stopTracker(three){
  trackerRunning = false;
  if(three){
    if(three.renderer) three.renderer.setAnimationLoop(null);
    try{ three.stop(); }catch(e){}
  }
}

async function initTracker(){
  const container = document.getElementById('trackerContainer');
  const statusEl = document.getElementById('trackerStatus');
  const fpsEl = document.getElementById('trackerFps');
  const latencyEl = document.getElementById('trackerLatencyMs');
  if(!container) return;

  renderTargetStatus();
  if(statusEl) statusEl.textContent = 'MindAR 初始化中……';
  try{
    mindarThree = createTracker(container);
    setupAnchors(mindarThree);
    if(statusEl) statusEl.textContent = SCANNING_MESSAGE;
    await startTracker(mindarThree, stats => {
      if(fpsEl) fpsEl.textContent = stats.fps.toFixed(1);
      if(latencyEl) latencyEl.textContent = stats.frameMs.toFixed(1);
    });
  }catch(e){
    if(statusEl) statusEl.textContent = 'MindAR 啟動失敗：' + (e && e.message ? e.message : e);
  }
}

function reportFatalError(err){
  const statusEl = document.getElementById('trackerStatus');
  if(statusEl) statusEl.textContent = 'MindAR 啟動失敗：' + (err && err.message ? err.message : err) + '（請確認 assets/targets/targets.mind 是否存在、是否為有效的編譯檔案）';
}

// MindAR 解析 .mind 檔案失敗時（例如檔案還沒放進去、或編譯壞掉）會直接丟出一個沒有被
// 內部 Promise 正確 catch 住的例外，一般的 try/catch 包不到，所以額外加一層全域防護，
// 避免整頁沒有任何提示地卡住。
window.addEventListener('error', e => reportFatalError(e.error || e.message));
window.addEventListener('unhandledrejection', e => reportFatalError(e.reason));

window.addEventListener('pagehide', () => stopTracker(mindarThree));

initTracker();
