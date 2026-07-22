(function(){
  // Generic gesture navigation for the story/scenario pages: a screen cursor that follows the index
  // fingertip, pinch-to-click any real clickable element, and scroll gesture for the page's scrollable
  // content. This reuses the same GestureController used by the tutorial/language-selection flow, just
  // with requireFrame=false (no narrow "put your hand in this box" viewfinder here — the camera is only
  // a small picture-in-picture preview on these pages) and a broad, page-agnostic target selector instead
  // of the tutorial's single hardcoded button.
  const SELECTOR = 'a[href], button:not([disabled]), [data-choice], [data-select-lang], [role="button"]';
  let gc = null;
  let cursorEl = null;

  function visibleTargets(){
    return [...document.querySelectorAll(SELECTOR)].filter(el => {
      if(el.closest('[hidden]')) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
  }

  function ensureCursor(){
    if(cursorEl) return cursorEl;
    cursorEl = document.createElement('div');
    cursorEl.className = 'gesture-cursor cursor-hidden';
    cursorEl.id = 'siteGestureCursor';
    document.body.appendChild(cursorEl);
    return cursorEl;
  }

  function scrollTarget(){
    // Prefer an inner scrollable content area (chat/feed) over the outer 16:9 stage, so scrolling a long
    // chat log doesn't instead scroll the whole page frame.
    const candidates = document.querySelectorAll('.line-chat, .vip-chat, .feed-scroll');
    for(const el of candidates){ if(el.scrollHeight > el.clientHeight + 4) return el; }
    return document.scrollingElement || document.documentElement;
  }

  function bind(){
    gc.addEventListener('hand', e => cursorEl.classList.toggle('cursor-hidden', !e.detail.inside));
    gc.addEventListener('cursor', e => { cursorEl.style.transform = `translate(${e.detail.x}px,${e.detail.y}px)`; });
    gc.addEventListener('select', e => { if(e.detail.target) e.detail.target.click(); });
    gc.addEventListener('scroll-direction', e => {
      scrollTarget().scrollBy({ top: e.detail.direction === 'down' ? 220 : -220, behavior: 'smooth' });
    });
  }

  window.initGestureNav = async function(video){
    if(!window.GestureController || !video || gc) return;
    try{
      ensureCursor();
      gc = new GestureController(video);
      gc.requireFrame = false;
      gc.getTargets = visibleTargets;
      await gc.init();
      bind();
      gc.setMode('site');
      gc.start();
    }catch(e){
      // CameraManager's own [data-camera-status] element already surfaces camera errors on this page;
      // gesture navigation simply stays unavailable and touch/click remains fully usable.
    }
  };
})();
