import { useEffect } from 'react';

// Port of the old js/app.js fitStage(): scales the stage element to fit the
// viewport while preserving its aspect ratio, centered/letterboxed. The old
// "fitWidth" branch (triggered by body[data-fit="width"]) is dropped here —
// grepping the pre-SPA site confirmed no page ever set that attribute, so it
// was dead code; the feed page's internal scrolling comes entirely from its
// own .feed-scroll CSS, not from fitStage().
export function useFitStage(stageRef) {
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    function fit() {
      stage.style.cssText = '';
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const rect = stage.getBoundingClientRect();
      const scale = Math.min(vw / rect.width, vh / rect.height);
      stage.style.position = 'fixed';
      stage.style.left = '50%';
      stage.style.top = '50%';
      stage.style.transformOrigin = 'center center';
      stage.style.transform = `translate(-50%,-50%) scale(${scale})`;
    }

    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);

    let raf = null;
    let ro = null;
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(() => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(fit);
      });
      ro.observe(stage);
    }

    return () => {
      window.removeEventListener('resize', fit);
      window.removeEventListener('orientationchange', fit);
      if (ro) ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [stageRef]);
}
