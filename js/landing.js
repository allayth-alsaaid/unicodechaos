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

  // Glyph rain: one canvas, transform-only motion, pauses offscreen, static under reduced motion.
  function rain() {
    var cv = document.getElementById('chaos');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    var glyphs = '文あア한عЖΩשअবกကဟཀᚠᐃⴰꋅꚠ𐌀AaΒáçñØ文語字あいう한글عربЖжΩΩPriya'.split('');
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var W, H, cols, drops, fs;
    function size() {
      var r = cv.parentElement.getBoundingClientRect();
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(50, r.width); H = Math.max(50, r.height);
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fs = 17; cols = Math.ceil(W / (fs * 1.15)); drops = [];
      for (var i = 0; i < cols; i++) drops.push(Math.random() * -H / fs);
    }
    size();
    window.addEventListener('resize', size);
    var visible = true;
    try {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(cv);
    } catch (e) { /* always visible */ }
    function frame() {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--field') || '#121412';
      ctx.fillRect(0, 0, W, H);
      ctx.font = fs + 'px system-ui, "Segoe UI", sans-serif';
      for (var i = 0; i < cols; i++) {
        var g = glyphs[(Math.random() * glyphs.length) | 0];
        var head = (i * 37 + ((drops[i] * 13) | 0)) % 5 === 0;
        ctx.fillStyle = head ? 'rgba(125,211,192,.95)' : 'rgba(125,211,192,.34)';
        ctx.fillText(g, i * fs * 1.15, drops[i] * fs);
        drops[i] += 0.42;
        if (drops[i] * fs > H && Math.random() > 0.976) drops[i] = 0;
      }
      if (visible && !reduce) requestAnimationFrame(frame);
    }
    if (reduce) frameOnce();
    else requestAnimationFrame(frame);
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
