// genbg.js — faint drifting-glyph backdrop for the generator console.
// Ultra-subtle decoration only: theme-aware, static on touch / reduced-motion.
(function () {
  'use strict';
  var cv = document.getElementById('genbg');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var GLYPHS = ('AEMNRTΑΕΛΩЖДабвгдежзиالعربيل123あア中文字한글가나다กขคงမမအဟሀለ∞π∑√∫§¶★♪♡').split('');
  var P = [];
  var W = 0, H = 0, color = '#7dd3c0', running = false, raf = 0;
  var still = false;
  try {
    still = matchMedia('(prefers-reduced-motion: reduce)').matches
      || matchMedia('(pointer: coarse)').matches;
  } catch (e) { /* keep motion */ }

  function readColor() {
    try {
      var c = getComputedStyle(document.body).getPropertyValue('--acc').trim();
      if (c) color = c;
    } catch (e) { /* keep last */ }
  }

  function resize() {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    var n = Math.max(36, Math.min(90, Math.round((W * H) / 26000)));
    P = [];
    for (var i = 0; i < n; i++) {
      P.push({
        ch: GLYPHS[(Math.random() * GLYPHS.length) | 0],
        x: Math.random() * W, y: Math.random() * H,
        s: 11 + Math.random() * 18,
        vx: (Math.random() - 0.35) * 0.16,
        vy: -0.05 - Math.random() * 0.12,
        ph: Math.random() * 6.28, sp: 0.002 + Math.random() * 0.006,
        a: 0.35 + Math.random() * 0.65
      });
    }
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.1;
    ctx.textBaseline = 'middle';
    for (var i = 0; i < P.length; i++) {
      var p = P[i];
      p.x += p.vx + Math.sin(p.ph) * 0.08;
      p.y += p.vy;
      p.ph += p.sp * 16;
      if (p.y < -30) { p.y = H + 30; p.x = Math.random() * W; }
      if (p.x > W + 30) p.x = -30; else if (p.x < -30) p.x = W + 30;
      ctx.globalAlpha = 0.05 + 0.06 * p.a * (0.6 + 0.4 * Math.sin(p.ph));
      ctx.font = p.s + 'px system-ui, "Segoe UI", Arial, sans-serif';
      ctx.fillText(p.ch, p.x, p.y);
    }
    ctx.globalAlpha = 1;
  }

  function loop() {
    if (!running) return;
    frame();
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;
    if (still) { frame(); running = false; return; }
    loop();
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  var rt = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(resize, 150);
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });
  try {
    new MutationObserver(function (m) {
      for (var i = 0; i < m.length; i++) {
        if (m[i].attributeName === 'data-theme') { readColor(); if (still) frame(); }
      }
    }).observe(document.documentElement, { attributes: true });
  } catch (e) { /* older browsers */ }

  readColor();
  resize();
  start();
})();
