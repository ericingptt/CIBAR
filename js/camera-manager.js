(function(){
  const CameraManager={stream:null,status:'idle',listeners:new Set(),videoEls:new Set(),rootPrefix:''};
  const labels={NotAllowedError:'鏡頭權限已被拒絕，請到瀏覽器設定重新允許。',NotFoundError:'找不到可用鏡頭，請確認裝置已連接相機。',NotReadableError:'鏡頭目前被其他應用程式使用，請關閉其他相機程式後重試。',OverconstrainedError:'找不到符合條件的後鏡頭，正在改用可用鏡頭。',SecurityError:'目前頁面不允許使用鏡頭，請確認使用 HTTPS。'};
  function emit(message,type='info'){CameraManager.status=type;CameraManager.listeners.forEach(fn=>fn({message,type}));document.querySelectorAll('[data-camera-status]').forEach(el=>el.textContent=message)}
  function readable(err){return labels[err&&err.name]||'鏡頭啟動失敗，請重新整理或重新授權。'}
  function live(){return CameraManager.stream&&CameraManager.stream.getVideoTracks().some(t=>t.readyState==='live')}
  async function request(constraints){return navigator.mediaDevices.getUserMedia(constraints)}
  CameraManager.startCamera=async function(){
    if(live()){emit('鏡頭已啟動');return CameraManager.stream}
    if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){emit('此瀏覽器不支援相機功能，請改用 Chrome 或 Android Chrome。','error');throw new Error('getUserMedia unavailable')}
    emit('正在開啟鏡頭……','requesting-camera');
    try{CameraManager.stream=await request({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false})}
    catch(err){
      if(err&&err.name==='OverconstrainedError'){emit(labels.OverconstrainedError,'warning');CameraManager.stream=await request({video:true,audio:false})}
      else {emit(readable(err),'error');throw err}
    }
    CameraManager.stream.getVideoTracks().forEach(t=>t.addEventListener('ended',()=>emit('鏡頭已中斷，請按重新啟動鏡頭。','error')));
    CameraManager.videoEls.forEach(v=>CameraManager.attachVideo(v));
    localStorage.setItem('cameraPermissionGranted','true');emit('鏡頭已啟動');return CameraManager.stream;
  };
  CameraManager.getStream=()=>CameraManager.stream;
  CameraManager.attachVideo=async function(video){if(!video)return null;CameraManager.videoEls.add(video);video.autoplay=true;video.playsInline=true;video.muted=true;if(CameraManager.stream){video.srcObject=CameraManager.stream;try{await video.play()}catch(e){}}return video};
  CameraManager.stopCamera=function(){if(CameraManager.stream){CameraManager.stream.getTracks().forEach(t=>t.stop())}CameraManager.stream=null;CameraManager.videoEls.forEach(v=>v.srcObject=null);emit('鏡頭已停止','idle')};
  CameraManager.restartCamera=async function(){CameraManager.stopCamera();return CameraManager.startCamera()};
  CameraManager.onStatus=fn=>{CameraManager.listeners.add(fn);return()=>CameraManager.listeners.delete(fn)};
  CameraManager.ensureCameraLayer=async function(opts={}){let layer=document.getElementById('cameraLayer');if(!layer){layer=document.createElement('div');layer.id='cameraLayer';layer.className=opts.compact?'camera-layer camera-layer-compact':'camera-layer';layer.innerHTML='<video id="sharedCamera" autoplay playsinline muted></video><div class="camera-state" data-camera-status>尚未開啟鏡頭</div><button class="camera-restart" type="button">重新啟動鏡頭</button>';document.body.prepend(layer)}const v=layer.querySelector('video');layer.querySelector('.camera-restart').onclick=()=>CameraManager.restartCamera();await CameraManager.attachVideo(v);return {layer,video:v}};
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&CameraManager.stream&&!live())emit('鏡頭已中斷，請重新啟動鏡頭。','error')});
  window.CameraManager=CameraManager;
})();
