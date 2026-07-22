const VISION_VERSION='0.10.14';
const WASM_ROOT=`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VISION_VERSION}/wasm`;
const MODEL_URL='https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const states=['idle','requesting-camera','camera-ready','waiting-for-hand','calibrating-scroll','scroll-confirmed','calibrating-select','select-confirmed','calibration-complete','scanning','camera-error'];
let state='idle',landmarker,raf,lastY=null,scrollTravel=0,pinchFrames=0,cooldownUntil=0;
const setState=s=>{state=s;document.body.dataset.calibrationState=s;};
function ui(){return {start:document.getElementById('startCalibration'),skip:document.getElementById('skipCalibration'),video:document.getElementById('sharedCamera'),status:document.getElementById('calibrationStatus'),step:document.getElementById('calibrationStep'),check:document.getElementById('calibrationCheck')}}
function msg(t){const e=ui().status;if(e)e.textContent=t}
function step(t){const e=ui().step;if(e)e.textContent=t}
function confirm(text,next){const u=ui();u.check.textContent='✓';u.check.hidden=false;msg(text);setTimeout(()=>{u.check.hidden=true;next()},1000)}
async function loadLandmarker(){if(landmarker)return landmarker;const vision=await import(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VISION_VERSION}/vision_bundle.mjs`);const fileset=await vision.FilesetResolver.forVisionTasks(WASM_ROOT);landmarker=await vision.HandLandmarker.createFromOptions(fileset,{baseOptions:{modelAssetPath:MODEL_URL},runningMode:'VIDEO',numHands:1});return landmarker}
function center(lms){return lms[9]||lms[8]}
function pinch(lms){const a=lms[4],b=lms[8];return Math.hypot(a.x-b.x,a.y-b.y)}
function loop(){const u=ui();if(!landmarker||!u.video||u.video.readyState<2){raf=requestAnimationFrame(loop);return}const res=landmarker.detectForVideo(u.video,performance.now());const hand=res.landmarks&&res.landmarks[0];if(!hand){if(state!=='waiting-for-hand'){setState('waiting-for-hand');step('');msg('請將手放入框內')}lastY=null;scrollTravel=0;pinchFrames=0;raf=requestAnimationFrame(loop);return}if(state==='waiting-for-hand'){setState('calibrating-scroll');step('1 / 2 滾動手勢');msg('請將手放入框內，做一次上下滾動手勢');lastY=center(hand).y;scrollTravel=0}
  if(performance.now()<cooldownUntil){raf=requestAnimationFrame(loop);return}
  if(state==='calibrating-scroll'){const y=center(hand).y;if(lastY!==null){const dy=y-lastY;if(Math.abs(dy)<0.018)scrollTravel*=0.92;else scrollTravel+=dy;if(Math.abs(scrollTravel)>0.22){cooldownUntil=performance.now()+900;setState('scroll-confirmed');confirm('滾動手勢確認完成',()=>{setState('calibrating-select');step('2 / 2 選取手勢');msg('請將手放入框內，做一次選取手勢');pinchFrames=0})}}lastY=y}
  else if(state==='calibrating-select'){pinchFrames=pinch(hand)<0.055?pinchFrames+1:Math.max(0,pinchFrames-1);if(pinchFrames>=5){cooldownUntil=performance.now()+900;setState('select-confirmed');confirm('選取手勢確認完成',()=>{setState('calibration-complete');localStorage.setItem('gestureCalibrationCompleted','true');sessionStorage.setItem('gestureCalibrationCompleted','true');msg('校正完成');setTimeout(()=>go('scanner.html'),900)})}}
  raf=requestAnimationFrame(loop)}
async function initGestureCalibration(){const u=ui();if(!u.start)return;setState('idle');if(localStorage.getItem('gestureCalibrationCompleted'))u.skip.hidden=false;u.start.onclick=async()=>{try{setState('requesting-camera');msg('正在開啟鏡頭……');await CameraManager.ensureCameraLayer();await CameraManager.startCamera();await CameraManager.attachVideo(ui().video);setState('camera-ready');msg('鏡頭影像僅用於即時手勢辨識，不會錄影或上傳。');await loadLandmarker();setState('waiting-for-hand');msg('請將手放入框內');loop()}catch(e){setState('camera-error');msg('鏡頭或手勢辨識啟動失敗，請重新整理或重新授權。')}};u.skip.onclick=()=>go('scanner.html')}
window.initGestureCalibration=initGestureCalibration;
