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
    specimens();
    lab();
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

  // Specimen wall: live samples from twelve writing systems. Pools use only
  // core-supported scripts (no tofu); one random card refills every 3s.
  var SPEC_POOLS = {
    lat: 'AaBbCcDdEeFfGgHhŽžØøÞþŒœ',
    ara: 'ابتثجحخدرزسشصضطظعغفقكلمنهوي',
    heb: 'אבגדהוזחטיכלמנסעפצקרשת',
    cyr: 'АбВгДжЖзИйКлМнОпРстУфХцЧшЩэЮя',
    ell: 'ΑαΒβΓγΔδΕεΖζΗηΘθΙιΚκΛλΜμΝνΞξΟοΠπΡρΣσΤτΥυΦφΧχΨψΩω',
    dev: 'अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह',
    tha: 'กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ',
    kor: '가나다라마바사아자차카타파하각간갇갈감갑값갓강같',
    han: '文語字漢字学国語読書東南西北',
    hir: 'あいうえおかきくけこさしすせそたちつてとなにぬねの'
  };
  function cryptoRnd() {
    var c = null;
    try { c = (typeof crypto !== 'undefined' && crypto.getRandomValues) ? crypto : null; } catch (e) {}
    if (!c) return Math.random;
    var a = new Uint32Array(8), i = 8;
    return function () {
      if (i >= 8) { try { c.getRandomValues(a); } catch (e) { return Math.random(); } i = 0; }
      return a[i++] / 4294967296;
    };
  }
  function drawFrom(pool, n, rnd) {
    var chars = Array.from(pool), out = '';
    for (var i = 0; i < n; i++) out += chars[(rnd() * chars.length) | 0];
    return out;
  }
  function specimens() {
    var els = Array.prototype.slice.call(document.querySelectorAll('#specgrid [data-pool]'));
    if (!els.length) return;
    var rnd = cryptoRnd();
    function fill(el) {
      var pool = SPEC_POOLS[el.getAttribute('data-pool')];
      if (pool) el.textContent = drawFrom(pool, 42, rnd);
    }
    els.forEach(fill);
    var reduce = false;
    try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    if (reduce) return;
    setInterval(function () {
      if (document.hidden || !els[0].offsetParent) return; // wall hidden (mobile) — stay idle
      fill(els[(Math.random() * els.length) | 0]);
    }, 3000);
  }

  // Live seed lab: typing hashes to a seed (SHA-256) and rebuilds
  // deterministic chaos through the real Hash-DRBG — same text, same output.
  var LAB_POOL = 'AaBbZz文語字あいうアイウ한글اعربאבגЖжЯΩΨωԱԲაბგअआঅআกขກຂកខကခဟလဟཀཁᎠᎡ★☾☀♜♞☯∞§¶';
  function lab() {
    var input = document.getElementById('labIn');
    var out = document.getElementById('labTxt');
    var seedEl = document.getElementById('seedDemo');
    if (!input || !out) return;
    function render() {
      var hex = '';
      try {
        hex = ChaosEntropy.toHex(ChaosEntropy.sha256(new TextEncoder().encode(input.value || '')));
      } catch (e) { hex = ''; }
      var stream = null;
      try { stream = hex && ChaosEntropy.streamFromHex ? ChaosEntropy.streamFromHex(hex) : null; } catch (e) {}
      var pool = Array.from(LAB_POOL), s = '';
      for (var i = 0; i < 140; i++) {
        var r = stream ? stream.nextFloat() : Math.random();
        s += pool[(r * pool.length) | 0];
      }
      out.textContent = s;
      if (seedEl) seedEl.textContent = '→ ' + (hex ? hex.slice(0, 16) : '…') + '…';
    }
    input.addEventListener('input', render);
    render();
    var copyBtn = document.getElementById('labCopy');
    if (copyBtn) copyBtn.addEventListener('click', function () {
      var txt = out.textContent;
      function flash(ok) {
        var original = copyBtn.getAttribute('data-label') || copyBtn.textContent;
        copyBtn.setAttribute('data-label', original);
        copyBtn.textContent = ChaosSite.T(ok ? 'copied' : 'copy');
        setTimeout(function () { copyBtn.textContent = copyBtn.getAttribute('data-label'); }, 1200);
      }
      function legacyCopy() {
        try {
          var ta = document.createElement('textarea');
          ta.value = txt; ta.setAttribute('readonly', '');
          ta.style.position = 'absolute'; ta.style.opacity = '0';
          document.body.appendChild(ta); ta.select();
          var ok = document.execCommand('copy');
          document.body.removeChild(ta);
          flash(!!ok);
        } catch (e) { flash(false); }
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(function () { flash(true); }, legacyCopy);
      } else legacyCopy();
    });
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
  // around the cursor (cloud parting); hold left for slow drift, hold right
  // for a downpour — both switch the umbrella off. Touch keeps plain rain.
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
    // Hold modes (field mode only): left button held = slow drift, right
    // button held = downpour. Both switch the cursor umbrella off.
    var slowmo = false, storm = false, stormT = 0;
    // Desktop: particle field with depth layers (pseudo-3D) pushed aside by
    // the cursor — glyphs never fade. Touch: classic column rain in the box.
    var fieldMode = fineHover && !reduce;
    var P = [], ft = 0;
    // Theme-aware glyph ink: light teal on dark bg, dark teal on light bg.
    // Read from --chaos-ink (r, g, b); follows the theme toggle live.
    var ink = { r: 125, g: 211, b: 192 };
    function readInk() {
      try {
        var parts = getComputedStyle(document.documentElement).getPropertyValue('--chaos-ink').split(',');
        var r = +parts[0], g = +parts[1], b = +parts[2];
        if (parts.length === 3 && [r, g, b].every(function (n) { return isFinite(n) && n >= 0 && n <= 255; })) {
          ink = { r: r, g: g, b: b };
        }
      } catch (e) {}
    }
    function rgba(a) { return 'rgba(' + ink.r + ',' + ink.g + ',' + ink.b + ',' + a + ')'; }
    readInk();
    try {
      new MutationObserver(readInk).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    } catch (e) { /* single theme — keep boot ink */ }
    var LAYERS = [
      { size: 13, alpha: 0.20, fall: 0.28, repel: 0.45, sway: 4 },
      { size: 17, alpha: 0.34, fall: 0.48, repel: 0.85, sway: 9 },
      { size: 23, alpha: 0.50, fall: 0.75, repel: 1.35, sway: 15 }
    ];
    // Motion feel: base drift slightly livelier than before, slow-mo crawls,
    // storm rushes downward. No fading, no density change — speed only.
    var BASE_SPD = 1.12, SLOW_SPD = 0.22, STORM_FALL = 2.4, STORM_SWAY = 1.2;
    function targetCount(w, h) { return Math.max(180, Math.min(420, Math.round(w * h / 3000))); }
    function newParticle() {
      return {
        x: Math.random() * W, y: Math.random() * H,
        vx: 0, vy: 0, layer: (Math.random() * 3) | 0,
        g: glyphs[(Math.random() * glyphs.length) | 0],
        ph: Math.random() * Math.PI * 2, sp: 0.5 + Math.random() * 0.8,
        accent: Math.random() < 0.12
      };
    }
    function seedField() {
      P = [];
      targetN = targetCount(W, H);
      for (var i = 0; i < targetN; i++) P.push(newParticle());
    }
    // Dynamic bounds: the canvas end tracks its container automatically —
    // any window/screen/zoom change flows in through ResizeObserver below.
    // Desktop follows width AND height; touch follows width only (ignores
    // height-only churn like the mobile URL bar) for a stable panel.
    // Existing particles survive resizes (clamped in); the crowd eases
    // toward the new target count over frames — never a jump, never fixed.
    var firstSize = true, targetN = 0, lastW = 0, lastH = 0;
    function size(force) {
      var r = cv.parentElement.getBoundingClientRect();
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      var w = Math.max(50, Math.round(r.width)), h = Math.max(50, Math.round(r.height));
      if (!force && w === lastW && (h === lastH || !fieldMode)) return false;
      lastW = w; lastH = h; W = w; H = h;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fs = 17; cols = Math.ceil(W / (fs * 1.15)); drops = [];
      for (var i = 0; i < cols; i++) drops.push(Math.random() * -H / fs);
      R = fieldMode ? Math.max(77, Math.min(126, Math.min(W, H) * 0.21))
                    : Math.max(70, Math.min(150, Math.min(W, H) * 0.30));
      if (fieldMode) {
        if (firstSize || !P.length) { seedField(); }
        else {
          for (var j = 0; j < P.length; j++) {
            if (P[j].x > W) P[j].x = Math.random() * W;
            if (P[j].y > H) P[j].y = Math.random() * H;
          }
          targetN = targetCount(W, H);
        }
      }
      firstSize = false;
      return true;
    }
    size(true);
    var panel = cv.parentElement;
    var hero = (panel && panel.closest) ? (panel.closest('.hero') || cv) : cv;
    if (fineHover && !reduce) {
      hero.addEventListener('mousemove', function (e) {
        var r = cv.getBoundingClientRect();
        mx = e.clientX - r.left; my = e.clientY - r.top; mouseIn = true;
      });
      hero.addEventListener('mouseleave', function () { mouseIn = false; });
      hero.addEventListener('mousedown', function (e) {
        if (e.button === 0) { slowmo = true; hero.classList.add('hold-slow'); }
        else if (e.button === 2) { storm = true; stormT = Date.now(); hero.classList.add('hold-fast'); }
      });
      window.addEventListener('mouseup', function (e) {
        if (e.button === 0) { slowmo = false; hero.classList.remove('hold-slow'); }
        else if (e.button === 2) { storm = false; hero.classList.remove('hold-fast'); }
      });
      window.addEventListener('blur', function () {
        slowmo = false; storm = false;
        hero.classList.remove('hold-slow'); hero.classList.remove('hold-fast');
      });
      hero.addEventListener('contextmenu', function (e) {
        // A quick right-click keeps the native menu; only a real hold
        // (storm mode engaged) suppresses it so the downpour stays clean.
        if (storm && Date.now() - stormT > 250) e.preventDefault();
      });
    }
    // One continuous field behind nav + hero: pull the hero under the bar
    // (measured, never hardcoded) so glyphs reach the exact viewport top.
    function behindNav() {
      if (!fieldMode) return;
      var nav = document.querySelector('.nav');
      if (!nav || !hero || !hero.style) return;
      var h = nav.offsetHeight || 0;
      hero.style.marginTop = (-h) + 'px';
      hero.style.paddingTop = (36 + h) + 'px';
    }
    behindNav();
    var ioVisible = true, visible = true, running = false;
    function kick() {
      if (visible && !reduce && !running) { running = true; requestAnimationFrame(frame); }
    }
    function refresh() {
      visible = ioVisible;
      kick();
    }
    window.addEventListener('resize', requestSize);
    window.addEventListener('orientationchange', requestSize);
    var rsT = null;
    function requestSize() {
      if (rsT) return; // debounce: settle once the window stops changing
      rsT = setTimeout(function () {
        rsT = null;
        if (size(false)) behindNav();
        refresh();
      }, 120);
    }
    try {
      // Fully automatic bounds: ANY hero/panel size change (window, zoom,
      // fonts, content, browser chrome) resizes the canvas end — no fixed sizes.
      if ('ResizeObserver' in window) {
        new ResizeObserver(function () { requestSize(); }).observe(fieldMode ? hero : panel);
      }
    } catch (e) { /* resize listener above is the fallback */ }
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
      // Ease the crowd toward the target after a resize (grow a few per
      // frame, shrink at once with hysteresis) — the end stays filled.
      if (P.length < targetN) {
        for (var k = 0; k < 4 && P.length < targetN; k++) P.push(newParticle());
      } else if (P.length > targetN + 20) {
        P.length = targetN;
      }
      var useMouse = fineHover && mouseIn && !slowmo && !storm;
      var slowOn = !storm && slowmo; // storm wins if both buttons held
      var fallMul = BASE_SPD * (storm ? STORM_FALL : (slowOn ? SLOW_SPD : 1));
      var swayMul = BASE_SPD * (storm ? STORM_SWAY : (slowOn ? SLOW_SPD : 1));
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
        p.x += p.vx + Math.sin(ft * 0.02 * p.sp + p.ph) * L.sway * 0.06 * swayMul;
        p.y += p.vy + L.fall * fallMul;
        if (p.y > H + 30) { p.y = -30; p.x = Math.random() * W; p.vx = 0; p.vy = 0; }
        if (p.x < -40) p.x = W + 40; else if (p.x > W + 40) p.x = -40;
        ctx.font = L.size + 'px system-ui, "Segoe UI", sans-serif';
        ctx.fillStyle = p.accent ? rgba(0.95) : rgba(L.alpha.toFixed(3));
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
          ctx.fillStyle = head ? rgba((0.95 * a).toFixed(3))
                               : rgba((0.34 * a).toFixed(3));
          ctx.fillText(g, x + dx, y);
        }
        drops[i] += 0.42;
        if (drops[i] * fs > H && Math.random() > 0.976) drops[i] = 0;
      }
      }
      requestAnimationFrame(frame);
    }
    if (reduce) frameOnce();
    else { refresh(); }
    function frameOnce() {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--field') || '#121412';
      ctx.fillRect(0, 0, W, H);
      ctx.font = fs + 'px system-ui, "Segoe UI", sans-serif';
      ctx.fillStyle = rgba(0.5);
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
