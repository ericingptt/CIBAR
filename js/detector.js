// Object-detection pipeline test (coco-ssd). This is a stand-in model to prove
// the "camera frame -> inference -> overlay" pipeline before swapping in a
// custom-trained model (likely ONNX/TFJS YOLO) for the real closed set of props.
// Swap the model by replacing loadDetectorModel()/runDetectorInference(); the
// frame-grab and drawing functions don't need to change.
const DETECTOR_MODEL_NAME = 'coco-ssd';
const DETECTOR_MODEL_VERSION = 'lite_mobilenet_v2';

// 現場微調用：低於這個信心分數的偵測結果不畫框、不顯示
const DETECTOR_CONFIDENCE_THRESHOLD = 0.5;

// 只顯示這些 coco-ssd class，其餘一律忽略；key 是 coco-ssd 的原始 class 名稱，
// value 是畫在方框上的中文標籤。coco-ssd 80 類沒有「筆記本」，這裡先用最接近
// 的 "book" 暫代，用來測試 pipeline，不代表最終辨識準確度。
const DETECTOR_CLASS_LABELS = {
  'cell phone': '手機',
  'book': '筆記本'
};

let detectorModel = null;
let detectorRunning = false;

function filterDetectionResults(predictions){
  return predictions.filter(p => DETECTOR_CLASS_LABELS[p.class] && p.score >= DETECTOR_CONFIDENCE_THRESHOLD);
}

function getDetectionFrame(){
  return document.getElementById('camera');
}

async function loadDetectorModel(){
  const t0 = performance.now();
  detectorModel = await cocoSsd.load({ base: DETECTOR_MODEL_VERSION });
  return performance.now() - t0;
}

async function runDetectorInference(frame){
  const t0 = performance.now();
  const predictions = await detectorModel.detect(frame);
  const inferMs = performance.now() - t0;
  return { predictions, inferMs };
}

function drawDetectionResults(predictions, canvas, video){
  if(canvas.width !== video.videoWidth || canvas.height !== video.videoHeight){
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = Math.max(2, canvas.width / 240);
  ctx.font = `${Math.max(14, Math.round(canvas.width / 40))}px system-ui,sans-serif`;
  ctx.textBaseline = 'top';
  predictions.forEach(p => {
    const [x, y, w, h] = p.bbox;
    ctx.strokeStyle = '#25d0ff';
    ctx.strokeRect(x, y, w, h);
    const label = `${DETECTOR_CLASS_LABELS[p.class] || p.class} ${p.score.toFixed(2)}`;
    const textWidth = ctx.measureText(label).width;
    const labelY = Math.max(0, y - 20);
    ctx.fillStyle = '#25d0ff';
    ctx.fillRect(x, labelY, textWidth + 8, 20);
    ctx.fillStyle = '#06162d';
    ctx.fillText(label, x + 4, labelY + 2);
  });
}

function startDetectorLoop(video, canvas, onStats){
  detectorRunning = true;
  let lastFrameTime = performance.now();

  async function loop(){
    if(!detectorRunning) return;
    if(video.readyState >= 2 && !video.paused){
      const { predictions, inferMs } = await runDetectorInference(video);
      const filtered = filterDetectionResults(predictions);
      drawDetectionResults(filtered, canvas, video);
      const now = performance.now();
      const fps = now > lastFrameTime ? 1000 / (now - lastFrameTime) : 0;
      lastFrameTime = now;
      if(onStats) onStats({ fps, inferMs, count: filtered.length });
    }
    requestAnimationFrame(loop);
  }
  loop();
}

function stopDetectorLoop(){
  detectorRunning = false;
}

async function initDetector(){
  const video = getDetectionFrame();
  const canvas = document.getElementById('detectionCanvas');
  const modelInfoEl = document.getElementById('detectorModelInfo');
  const fpsEl = document.getElementById('detectorFps');
  const inferEl = document.getElementById('detectorInferMs');
  const countEl = document.getElementById('detectorCount');
  if(!video || !canvas || typeof cocoSsd === 'undefined') return;

  if(modelInfoEl) modelInfoEl.textContent = `模型載入中……（${DETECTOR_MODEL_NAME} / ${DETECTOR_MODEL_VERSION}）`;
  try{
    const loadMs = await loadDetectorModel();
    if(modelInfoEl) modelInfoEl.textContent = `模型：${DETECTOR_MODEL_NAME} (${DETECTOR_MODEL_VERSION})　載入耗時：${loadMs.toFixed(0)} ms`;
    startDetectorLoop(video, canvas, stats => {
      if(fpsEl) fpsEl.textContent = stats.fps.toFixed(1);
      if(inferEl) inferEl.textContent = stats.inferMs.toFixed(1);
      if(countEl) countEl.textContent = stats.count;
    });
  }catch(e){
    if(modelInfoEl) modelInfoEl.textContent = '模型載入失敗：' + (e && e.message ? e.message : e);
  }
}

window.addEventListener('pagehide', stopDetectorLoop);
