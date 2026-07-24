/**
 * CIBAR web-side receiver for the native Jorjin camera bridge.
 *
 * Native side calls:
 *   window.onNativeCameraFrame(base64Jpeg, captureTs, frameId, width, height)
 * on every frame it manages to push through (frames are dropped natively
 * under backpressure, so this is "latest frame wins", not every camera frame).
 *
 * This script:
 *   1. Decodes the JPEG into a <canvas id="cibarBridgeCanvas">.
 *   2. Tracks web-side FPS and end-to-end latency (Date.now() - captureTs).
 *   3. Calls back into window.AndroidCamera.onWebFrameRendered(...) so the
 *      native overlay can show the same numbers.
 *   4. Fires a `cibar:frame` CustomEvent on `document` with {canvas, width,
 *      height, frameId, latencyMs} so MindAR/MediaPipe glue code can just
 *      listen for that instead of touching this file.
 *
 * Does nothing in a normal browser (window.onNativeCameraFrame just never
 * gets called), so it's safe to ship in the same repo deployed to Pages.
 *
 * TEMP-VISIBLE-FOR-ONSITE-DEBUG (2026-07-24): the canvas below is normally
 * meant to be an invisible pixel source for MindAR/MediaPipe, not something
 * a person looks at - it's deliberately made visible right now (small
 * floating preview, top-right) so the native-bridge test tonight can
 * confirm with the naked eye that frames are actually arriving. Find and
 * remove every block tagged TEMP-VISIBLE-FOR-ONSITE-DEBUG to go back to
 * hidden-by-default once that's confirmed.
 */
(function () {
  'use strict';
  var canvas = document.getElementById('cibarBridgeCanvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'cibarBridgeCanvas';
    // TEMP-VISIBLE-FOR-ONSITE-DEBUG: visible floating preview instead of
    // `canvas.style.display = 'none'`. Revert to display:none (and drop the
    // border/position/z-index below) once frame delivery is confirmed.
    canvas.style.cssText =
      'position:fixed;top:28px;right:0;width:240px;height:auto;z-index:99998;' +
      'border:2px solid #0f0;background:#000;';
    document.documentElement.appendChild(canvas);
  }
  var ctx = canvas.getContext('2d');
  var frameTimestamps = [];
  function tickJsFps() {
    var now = performance.now();
    frameTimestamps.push(now);
    while (frameTimestamps.length && now - frameTimestamps[0] > 1000) {
      frameTimestamps.shift();
    }
    return frameTimestamps.length;
  }
  var decoding = false;
  var img = new Image();
  img.onload = function () {
    if (canvas.width !== img.width) canvas.width = img.width;
    if (canvas.height !== img.height) canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    var latencyMs = Date.now() - img._captureTs;
    var jsFps = tickJsFps();
    document.dispatchEvent(new CustomEvent('cibar:frame', {
      detail: {
        canvas: canvas, width: canvas.width, height: canvas.height,
        frameId: img._frameId, latencyMs: latencyMs, jsFps: jsFps,
      },
    }));
    if (window.AndroidCamera && window.AndroidCamera.onWebFrameRendered) {
      window.AndroidCamera.onWebFrameRendered(String(img._frameId), latencyMs, jsFps);
    }
    decoding = false;
  };
  img.onerror = function (e) {
    decoding = false;
    if (window.AndroidCamera && window.AndroidCamera.log) {
      window.AndroidCamera.log('frame decode error: ' + e);
    }
  };
  window.onNativeCameraFrame = function (base64Jpeg, captureTs, frameId) {
    if (decoding) return;
    decoding = true;
    img._captureTs = Number(captureTs);
    img._frameId = frameId;
    img.src = 'data:image/jpeg;base64,' + base64Jpeg;
  };
  // Small on-page overlay so fps/latency is visible in the browser too.
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;right:0;z-index:99999;' +
      'background:rgba(0,0,0,0.6);color:#fff;font:12px monospace;padding:4px 6px;';
  overlay.textContent = 'waiting for native frames...';
  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(overlay);
  });
  document.addEventListener('cibar:frame', function (ev) {
    overlay.textContent = 'web ' + ev.detail.jsFps.toFixed(1) + ' fps | e2e ' +
        ev.detail.latencyMs + ' ms | ' + ev.detail.width + 'x' + ev.detail.height;
  });
})();
