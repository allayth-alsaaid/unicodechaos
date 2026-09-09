// landing.js — intro page behavior: language, theme, glyph rain, marquee, counters.
(function () {
  'use strict';

  // Official repository. Website URL is added to README once provided.
  var GITHUB_URL = 'https://github.com/allayth-alsaaid/unicodechaos';

  function boot() {
    // Old shared links pointed at index.html (?seed=…). Forward them to the generator.
    try {
      var q = new URLSearchParams(location.search);
      if (q.get('seed')) {
        location.replace('generator.html' + location.search);
        return;
      }
    } catch (e) { /* ignore */ }

    ChaosSite.initTheme(document.getElementById('theme'));
    ChaosSite.applyI18n(document);
    ChaosSite.keepLang();

    var langBtn = document.getElementById('langToggle');
    var langMenu = document.getElementById('langMenu');
    (function syncLangMenu() {
      var cur = document.documentElement.lang === 'ar' ? 'ar' : 'en';
      langMenu.querySelectorAll('[data-lang]').forEach(function (b) {
        b.setAttribute('aria-checked', String(b.dataset.lang === cur));
      });
    })();
    langBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = langMenu.hidden;
      langMenu.hidden = !open;
      langBtn.setAttribute('aria-expanded', String(open));
    });
    langMenu.querySelectorAll('[data-lang]').forEach(function (b) {
      b.addEventListener('click', function () {
        ChaosSite.setLang(b.dataset.lang, true); // reload is fine here — no state to keep
      });
    });
    document.addEventListener('click', function (e) {
      if (!langMenu.hidden && !e.target.closest('.langwrap')) {
        langMenu.hidden = true;
        langBtn.setAttribute('aria-expanded', 'false');
      }
    });

    document.getElementById('ghNav').href = GITHUB_URL;
    document.getElementById('ghBtn').href = GITHUB_URL;

    buildMarquee();
    seedDemo();
    ticker();
    rain();
    counters();
  }

  var SAMPLES = [
    ['AaBb', 'Latin'], ['ا ب ت', 'Arabic'], ['אבג', 'Hebrew'], ['ЖюЯ', 'Cyrillic'],
    ['ΩΨω', 'Greek'], ['ԱԲԳ', 'Armenian'], ['აბგ', 'Georgian'], ['अआइ', 'Devanagari'],
    ['অআই', 'Bengali'], ['กขค', 'Thai'], ['ກຂຄ', 'Lao'], ['កខគ', 'Khmer'],
    ['ကခဂ', 'Myanmar'], ['ሀለሐ', 'Ethiopic'], ['ཀཁག', 'Tibetan'], ['ᠮᠨᠣ', 'Mongolian'],
    ['あいう', 'Hiragana'], ['アイウ', 'Katakana'], ['한글', 'Hangul'], ['文語字', 'CJK'],
    ['ᎠᎡᎢ', 'Cherokee'], ['ᚠᚱᚢ', 'Runic'], ['ᐃᐊᖷ', 'Inuktitut'], ['ⴰⴱⴳ', 'Tifinagh'],
    ['ꋅꗡꗳ', 'Vai'], ['ꚠꚡꚢ', 'Bamum'], ['𐌀𐌁𐌂', 'Old Italic'], ['𐎀𐎁𐎂', 'Ugaritic'],
    ['𓀀𓀁𓀂', 'Hieroglyphs'], ['𒀭𒉿', 'Cuneiform'], ['𖼀𖼁', 'Mende'], ['𐊧𐊨', 'Lycian']
  ];

  function buildMarquee() {
    var track = document.getElementById('mtrack');
    var html = SAMPLES.map(function (s) {
      return '<span class="mitem"><b>' + s[0] + '</b><i>' + s[1] + '</i></span>';
    }).join('<span class="mdot" aria-hidden="true">·</span>');
    track.innerHTML = html + '<span class="mdot" aria-hidden="true">·</span>' + html + '<span class="mdot" aria-hidden="true">·</span>';
  }

  function hex(n) {
    try {
      var a = new Uint8Array(n);
      (crypto.getRandomValues ? crypto.getRandomValues(a) : a.map(function () { return Math.random() * 256; }));
      return Array.from(a).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    } catch (e) {
      var s = '';
      for (var i = 0; i < n; i++) s += Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
      return s;
    }
  }

  function seedDemo() {
    try {
      var h = ChaosEntropy.toHex(ChaosEntropy.sha256(new TextEncoder().encode('asdf jkl; qwerpoi')));
      document.getElementById('seedDemo').textContent = '→ ' + h.slice(0, 16) + '…';
    } catch (e) { /* entropy.js missing — leave placeholder */ }
  }

  function ticker() {
    var el = document.getElementById('ticker');
    el.textContent = ChaosSite.T('regen');
    function tick() { el.textContent = 'seed ' + hex(4) + '…'; }
    tick();
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(tick, 2500);
  }

  // Glyph rain: one canvas, transform-only motion. Runs only in the first
  // scene (pauses once scrolled down, resumes on return — never dies),
  // static under reduced motion. Desktop pointers get a soft empty circle
  // around the cursor (cloud parting); touch devices keep the plain rain.
  function rain() {
    var cv = document.getElementById('chaos');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    // Core-supported scripts only (no tofu boxes in the hero).
    var glyphs = Array.from('AaBbZz文語字あいうアイウ한글اعربאבגЖжЯΩΨωԱԲაბგअआঅআกขກຂកខကခဟလဟཀཁᎠᎡ');
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fineHover = false;
    try { fineHover = matchMedia('(hover: hover) and (pointer: fine)').matches; } catch (e) {}
    var W, H, cols, drops, fs, R;
    var mx = 0, my = 0, mouseIn = false;
    // Desktop: particle field with depth layers (pseudo-3D) pushed aside by
    // the cursor — glyphs never fade. Touch: classic column rain in the box.
    var fieldMode = fineHover && !reduce;
    var P = [], ft = 0;
    var LAYERS = [
      { size: 13, alpha: 0.20, fall: 0.28, repel: 0.45, sway: 4 },
      { size: 17, alpha: 0.34, fall: 0.48, repel: 0.85, sway: 9 },
      { size: 23, alpha: 0.50, fall: 0.75, repel: 1.35, sway: 15 }
    ];
    function seedField() {
      P = [];
      var n = Math.max(180, Math.min(420, Math.round(W * H / 3000)));
      for (var i = 0; i < n; i++) {
        P.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: 0, vy: 0, layer: (Math.random() * 3) | 0,
          g: glyphs[(Math.random() * glyphs.length) | 0],
          ph: Math.random() * Math.PI * 2, sp: 0.5 + Math.random() * 0.8,
          accent: Math.random() < 0.12
        });
      }
    }
    function size() {
      var r = cv.parentElement.getBoundingClientRect();
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(50, r.width); H = Math.max(50, r.height);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fs = 17; cols = Math.ceil(W / (fs * 1.15)); drops = [];
      for (var i = 0; i < cols; i++) drops.push(Math.random() * -H / fs);
      R = fieldMode ? Math.max(77, Math.min(126, Math.min(W, H) * 0.21))
                    : Math.max(70, Math.min(150, Math.min(W, H) * 0.30));
      if (fieldMode) seedField();
    }
    size();
    var panel = cv.parentElement;
    var hero = (panel && panel.closest) ? (panel.closest('.hero') || cv) : cv;
    if (fineHover && !reduce) {
      hero.addEventListener('mousemove', function (e) {
        var r = cv.getBoundingClientRect();
        mx = e.clientX - r.left; my = e.clientY - r.top; mouseIn = true;
      });
      hero.addEventListener('mouseleave', function () { mouseIn = false; });
    }
    var ioVisible = true, nearTop = true, visible = true, running = false;
    function kick() {
      if (visible && !reduce && !running) { running = true; requestAnimationFrame(frame); }
    }
    function refresh() {
      visible = ioVisible && nearTop;
      kick();
    }
    function onScroll() {
      nearTop = (window.scrollY || window.pageYOffset || 0) < window.innerHeight * 0.22;
      refresh();
    }
    window.addEventListener('resize', function () { size(); onScroll(); });
    try { window.addEventListener('scroll', onScroll, { passive: true }); }
    catch (e) { window.addEventListener('scroll', onScroll); }
    try {
      ioVisible = false; // let the observer decide (fires immediately)
      new IntersectionObserver(function (es) {
        ioVisible = !!(es[0] && es[0].isIntersecting);
        refresh();
      }).observe(hero);
    } catch (e) { ioVisible = true; /* always visible */ }
    function fieldFrame() {
      ft++;
      var bgc = getComputedStyle(document.documentElement).getPropertyValue('--bg') || '#101210';
      ctx.fillStyle = bgc;
      ctx.fillRect(0, 0, W, H);
      var useMouse = fineHover && mouseIn;
      for (var i = 0; i < P.length; i++) {
        var p = P[i], L = LAYERS[p.layer];
        if (useMouse) {
          var ox = p.x - mx, oy = p.y - my;
          var d = Math.sqrt(ox * ox + oy * oy);
          var Rr = R * (0.75 + 0.3 * p.layer);
          if (d < Rr && d > 0.5) {
            var f = 1 - d / Rr; f *= f; f *= 3.4 * L.repel;
            p.vx += (ox / d) * f; p.vy += (oy / d) * f;
          }
        }
        p.vx *= 0.90; p.vy *= 0.90;
        p.x += p.vx + Math.sin(ft * 0.02 * p.sp + p.ph) * L.sway * 0.06;
        p.y += p.vy + L.fall;
        if (p.y > H + 30) { p.y = -30; p.x = Math.random() * W; p.vx = 0; p.vy = 0; }
        if (p.x < -40) p.x = W + 40; else if (p.x > W + 40) p.x = -40;
        ctx.font = L.size + 'px system-ui, "Segoe UI", sans-serif';
        ctx.fillStyle = p.accent ? 'rgba(125,211,192,0.950)' : 'rgba(125,211,192,' + L.alpha.toFixed(3) + ')';
        ctx.fillText(p.g, p.x, p.y);
      }
    }
    function frame() {
      if (!visible || reduce) { running = false; return; } // pausable + restartable
      if (fieldMode) { fieldFrame(); }
      else {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--field') || '#121412';
      ctx.fillRect(0, 0, W, H);
      ctx.font = fs + 'px system-ui, "Segoe UI", sans-serif';
      var useMouse = fineHover && mouseIn;
      for (var i = 0; i < cols; i++) {
        var x = i * fs * 1.15, y = drops[i] * fs;
        var dx = 0, a = 1;
        if (useMouse) {
          var ox = x - mx, oy = y - my;
          var d = Math.sqrt(ox * ox + oy * oy);
          if (d < R) {
            var t = d / R;
            a = t * t * (3 - 2 * t); // smooth hole edge
            if (d > 0.5) dx = (ox / d) * (1 - t) * 22; // columns part aside
          }
        }
        if (a > 0.02) {
          var g = glyphs[(Math.random() * glyphs.length) | 0];
          var head = (i * 37 + ((drops[i] * 13) | 0)) % 5 === 0;
          ctx.fillStyle = head ? 'rgba(125,211,192,' + (0.95 * a).toFixed(3) + ')'
                               : 'rgba(125,211,192,' + (0.34 * a).toFixed(3) + ')';
          ctx.fillText(g, x + dx, y);
        }
        drops[i] += 0.42;
        if (drops[i] * fs > H && Math.random() > 0.976) drops[i] = 0;
      }
      }
      requestAnimationFrame(frame);
    }
    if (reduce) frameOnce();
    else { onScroll(); refresh(); }
    function frameOnce() {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--field') || '#121412';
      ctx.fillRect(0, 0, W, H);
      ctx.font = fs + 'px system-ui, "Segoe UI", sans-serif';
      ctx.fillStyle = 'rgba(125,211,192,.5)';
      for (var i = 0; i < cols; i++) {
        for (var j = 0; j < H / fs / 2; j++) {
          if (Math.random() > 0.72) ctx.fillText(glyphs[(Math.random() * glyphs.length) | 0], i * fs * 1.15, j * fs * 2);
        }
      }
    }
  }

  function counters() {
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('[data-static]').forEach(function (el) { el.textContent = ChaosSite.T(el.dataset.static); });
    var nums = Array.from(document.querySelectorAll('[data-count]'));
    function setFinal() { nums.forEach(function (el) { el.textContent = el.dataset.count; }); }
    if (reduce || !('IntersectionObserver' in window)) { setFinal(); return; }
    var done = false;
    new IntersectionObserver(function (es, ob) {
      if (!es[0].isIntersecting || done) return;
      done = true; ob.disconnect();
      var t0 = performance.now();
      (function step(t) {
        var p = Math.min(1, (t - t0) / 1100);
        nums.forEach(function (el) { el.textContent = Math.round(+el.dataset.count * (1 - Math.pow(1 - p, 3))); });
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }, { threshold: 0.4 }).observe(nums[0].closest('dl') || nums[0]);
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
