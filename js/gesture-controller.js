(function(){
  const VISION_VERSION='0.10.14';
  const WASM_ROOT=`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VISION_VERSION}/wasm`;
  const MODEL_URL='https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
  const cfg={minMove:.16,minFrames:3,timeoutMs:9000,pinch:.055,pinchFrames:4,cooldownMs:700};
  class GestureController extends EventTarget{
    constructor(video){super();this.video=video;this.landmarker=null;this.raf=0;this.mode='idle';this.smoothPalm=null;this.smoothCursor=null;this.baseY=null;this.dirFrames=0;this.lastDir=null;this.lastSeen=0;this.cooldown=0;this.pinchWasDown=false;this.pinchFrames=0;this.frameRect={x:.24,y:.20,w:.52,h:.58};this.hoverEl=null;}
    async init(){if(this.landmarker)return;const vision=await import(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VISION_VERSION}/vision_bundle.mjs`);const fileset=await vision.FilesetResolver.forVisionTasks(WASM_ROOT);this.landmarker=await vision.HandLandmarker.createFromOptions(fileset,{baseOptions:{modelAssetPath:MODEL_URL},runningMode:'VIDEO',numHands:1});}
    start(){cancelAnimationFrame(this.raf);this.loop();}
    stop(){cancelAnimationFrame(this.raf);this.raf=0;}
    setMode(mode){this.mode=mode;this.resetMotion();this.smoothCursor=null;}
    resetMotion(){this.baseY=null;this.dirFrames=0;this.lastDir=null;this.pinchFrames=0;this.pinchWasDown=false;}
    inFrame(p){const r=this.frameRect;return p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h;}
    palm(l){const pts=[l[0],l[5],l[9],l[13],l[17]].filter(Boolean);return pts.reduce((a,p)=>({x:a.x+p.x/pts.length,y:a.y+p.y/pts.length}),{x:0,y:0});}
    smooth(prev,p,a=.28){return prev?{x:prev.x+(p.x-prev.x)*a,y:prev.y+(p.y-prev.y)*a}:p;}
    cursorPoint(l){const p=l[8];const x=p.x*innerWidth,y=p.y*innerHeight;return {x,y};}
    pinchDistance(l){return Math.hypot(l[4].x-l[8].x,l[4].y-l[8].y);}
    emit(name,detail={}){this.dispatchEvent(new CustomEvent(name,{detail}));}
    updateHover(point,targets){let hit=null;(targets||[]).forEach(el=>{const r=el.getBoundingClientRect();if(point.x>=r.left&&point.x<=r.right&&point.y>=r.top&&point.y<=r.bottom)hit=el;el.classList.toggle('gesture-hover',false);});if(hit)hit.classList.add('gesture-hover');this.hoverEl=hit;return hit;}
    handleScroll(p,now){if(!this.baseY)this.baseY=p.y;const dy=p.y-this.baseY;const dir=dy>cfg.minMove?'down':dy<-cfg.minMove?'up':null;if(dir&&dir===this.lastDir)this.dirFrames++;else if(dir){this.lastDir=dir;this.dirFrames=1;}if(dir&&this.dirFrames>=cfg.minFrames&&now>this.cooldown){this.cooldown=now+cfg.cooldownMs;this.baseY=p.y;this.dirFrames=0;this.emit('scroll-direction',{direction:dir});}}
    handleSelect(l,targets,now){const c=this.smoothCursor=this.smooth(this.smoothCursor,this.cursorPoint(l),.32);this.emit('cursor',{x:c.x,y:c.y});const hit=this.updateHover(c,targets);const down=this.pinchDistance(l)<cfg.pinch;if(down)this.pinchFrames++;else {this.pinchFrames=0;this.pinchWasDown=false;}if(hit&&down&&this.pinchFrames>=cfg.pinchFrames&&!this.pinchWasDown&&now>this.cooldown){this.pinchWasDown=true;this.cooldown=now+cfg.cooldownMs;this.emit('select',{target:hit});}}
    loop(){if(this.landmarker&&this.video&&this.video.readyState>=2){const now=performance.now();const res=this.landmarker.detectForVideo(this.video,now);const l=res.landmarks&&res.landmarks[0];if(l){const p=this.smoothPalm=this.smooth(this.smoothPalm,this.palm(l),.25);const inside=this.inFrame(p);this.emit('hand',{inside,palm:p});if(!inside){this.resetMotion();}else{this.lastSeen=now;if(this.mode==='scroll')this.handleScroll(p,now);if(this.mode==='select'||this.mode==='language')this.handleSelect(l,[...document.querySelectorAll(this.mode==='language'?'[data-select-lang]':'#testSelect')],now);}}else{this.emit('hand',{inside:false});this.resetMotion();}}
      this.raf=requestAnimationFrame(()=>this.loop());}
  }
  window.GestureController=GestureController;
})();
