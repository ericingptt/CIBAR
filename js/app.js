const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
const go=url=>{localStorage.setItem('lastPage',location.pathname.split('/').pop());location.href=url};
function setLang(lang){localStorage.setItem('language',lang);$$('[data-lang]').forEach(el=>el.classList.toggle('active',el.dataset.lang===lang))}
function initLang(){const lang=localStorage.getItem('language')||localStorage.getItem('lang')||'zh';$$('[data-lang]').forEach(el=>{el.onclick=()=>{setLang(el.dataset.lang);showCalibration()}});$$('[data-lang]').forEach(el=>el.classList.toggle('active',el.dataset.lang===lang))}

function showCalibration(){const hero=document.querySelector('.hero');const panel=document.getElementById('calibrationPanel');if(hero)hero.hidden=true;if(panel)panel.hidden=false;fitStage()}
function initPageCamera(options={}){if(!window.CameraManager)return;CameraManager.ensureCameraLayer({compact:options.compact!==false}).then(({video})=>{CameraManager.startCamera().catch(()=>{});if(window.initGestureNav)window.initGestureNav(video);}).catch(()=>{});}
function hasLanguage(){return Boolean(localStorage.getItem('language'))}
function initAdLabel(){const lang=localStorage.getItem('language')||localStorage.getItem('lang')||'zh';const labels={zh:'贊助內容',en:'Sponsored',jp:'広告',ja:'広告'};$$('[data-ad-label]').forEach(el=>{el.textContent=labels[lang]||labels.zh})}
function initScanner(){if(!hasLanguage()){location.replace('index.html');return}initCamera()}
async function initCamera(){const video=$('#camera');if(!video)return;try{const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false});video.srcObject=stream}catch(e){$('#cameraStatus').textContent='無法開啟相機，請確認瀏覽器權限。'} }
function typeMessages(messages,doneSelector,options={}){const box=$('#chatBox');if(!box)return;let i=0;const messageDelay=options.messageDelay||1700,typingDelay=options.typingDelay||900;function scrollLatest(){box.scrollTop=box.scrollHeight}function showVipWarning(){const modal=$('#vipWarningModal');if(modal)modal.classList.add('show')}function showDone(){const reply=options.replySelector?$(options.replySelector):null;if(reply)reply.hidden=false;const done=$(doneSelector);if(done){done.hidden=false;done.style.display='block'}scrollLatest()}function addTyping(){const div=document.createElement('div');div.className='msg typing';div.setAttribute('aria-label','對方正在輸入');div.innerHTML='<span>對方正在輸入</span><i></i><i></i><i></i>';box.appendChild(div);scrollLatest();return div}function addMessage(m){const div=document.createElement('div');div.className='msg '+(m.type||'');div.textContent=m.text;box.appendChild(div);if(m.showVipWarning)setTimeout(showVipWarning,500);scrollLatest()}function next(){if(i>=messages.length){showDone();return}const m=messages[i++];if(m.type==='user'||m.type==='system'){addMessage(m);setTimeout(next,m.delay||messageDelay);return}const typing=addTyping();setTimeout(()=>{typing.remove();addMessage(m);setTimeout(next,m.delay||messageDelay)},m.typingDelay||typingDelay)}next()}
function moneyAnim(done){
  const el=$('#money');
  if(!el){if(done)done();return}
  const badge=$('#profitBadge'),chartGain=$('#chartGain'),statGain=$('#statGain'),statPercent=$('#statPercent');
  const principal=10000,finalPercent=56.4;
  // Same y-values as the 10 <polyline>/candle points in scene01_profit.html's chart, so the profit
  // numbers move through the same up/down zigzag the chart visually draws, not just a flat ramp.
  const ys=[102,91,98,73,81,55,63,39,45,22];
  const minY=Math.min(...ys),maxY=Math.max(...ys);
  // Matches the candles' own CSS: animation-delay:calc(.25s + var(--i)*.38s), duration .34s — each
  // number update fires exactly when that candle finishes popping in, not on a separate fixed timer.
  ys.forEach((y,i)=>{
    setTimeout(()=>{
      const percent=((maxY-y)/(maxY-minY))*finalPercent;
      const value=Math.round(principal*(1+percent/100));
      const gain=value-principal;
      el.textContent='NT$'+value.toLocaleString();
      if(badge)badge.textContent=(percent>=0?'+':'')+percent.toFixed(1)+'%';
      if(chartGain)chartGain.textContent=(gain>=0?'+':'')+'NT$'+gain.toLocaleString();
      if(statGain)statGain.textContent=(gain>=0?'+':'')+'NT$'+gain.toLocaleString();
      if(statPercent)statPercent.textContent=(percent>=0?'+':'')+percent.toFixed(1)+'%';
      if(i===ys.length-1&&done)setTimeout(done,1200);
    },(0.25+i*0.38+0.34)*1000);
  });
}
function initProfitAnimation(){const btn=$('#withdrawBtn');if(btn)btn.hidden=true;moneyAnim(()=>{if(btn)btn.hidden=false})}
function chooseQuiz(ans){go(ans==='A'?'scene01_quiz_wrong.html':'scene01_quiz_right.html')}
if('serviceWorker' in navigator){const swUrl=new URL('../sw.js',document.currentScript.src).href;navigator.serviceWorker.register(swUrl+'?v=20260720-8').catch(()=>{})}
function fitStage(){let stage=document.body.firstElementChild;while(stage&&stage.tagName==='SCRIPT')stage=stage.nextElementSibling;if(!stage)return;const fitWidth=document.body.dataset.fit==='width';stage.style.cssText='';const vw=window.innerWidth,vh=window.innerHeight;if(fitWidth){const rect=stage.getBoundingClientRect();const scale=vw/rect.width;stage.style.position='fixed';stage.style.left='0';stage.style.top='0';stage.style.width=vw+'px';if(rect.height*scale>vh){stage.style.maxHeight=vh+'px';stage.style.overflowY='auto'}}else{const rect=stage.getBoundingClientRect();const scale=Math.min(vw/rect.width,vh/rect.height);stage.style.position='fixed';stage.style.left='50%';stage.style.top='50%';stage.style.transformOrigin='center center';stage.style.transform=`translate(-50%,-50%) scale(${scale})`}}
window.addEventListener('load',fitStage);window.addEventListener('resize',fitStage);window.addEventListener('orientationchange',fitStage);fitStage();
if('ResizeObserver' in window){let stage=document.body.firstElementChild;while(stage&&stage.tagName==='SCRIPT')stage=stage.nextElementSibling;if(stage){let raf=null;new ResizeObserver(()=>{if(raf)cancelAnimationFrame(raf);raf=requestAnimationFrame(fitStage)}).observe(stage)}}
