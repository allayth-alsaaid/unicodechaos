// app.js — UI wiring: theme, generation, seed share links (?seed=).
(function () {
  const $ = (id) => document.getElementById(id);

  var T = function (k, v) { return globalThis.ChaosSite.T(k, v); };

  function seedFromURL() {
    try {
      const v = new URLSearchParams(location.search).get('seed');
      return v && /^[0-9a-fA-F]{64}$/.test(v) ? v.toLowerCase() : null;
    } catch (e) { return null; }
  }

  // Advanced modal (top-level: safe to call even while data is still loading).
  function openAdv() {
    const m = $('advModal');
    if (!m) return;
    m.hidden = false;
    try { document.body.classList.add('noscroll'); } catch (e) { /* ignore */ }
    const c = $('advClose');
    if (c) c.focus();
  }
  function closeAdv() {
    const m = $('advModal');
    if (!m || m.hidden) return;
    m.hidden = true;
    try { document.body.classList.remove('noscroll'); } catch (e) { /* ignore */ }
  }
  var applyLangRefresh = null;
  function applyLanguage(next) {
    if (next !== 'ar' && next !== 'en') return;
    try { localStorage.setItem('chaos-lang', next); } catch (e) { /* ignore */ }
    document.documentElement.lang = next;
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
    ChaosSite.applyI18n(document);
    syncLangMenu();
    if (applyLangRefresh) applyLangRefresh();
  }
  function syncLangMenu() {
    const menu = $('langMenu'), btn = $('langToggle');
    if (!menu || !btn) return;
    const cur = document.documentElement.lang === 'ar' ? 'ar' : 'en';
    menu.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.lang === cur)));
  }
  function wireLangMenu() {
    const btn = $('langToggle'), menu = $('langMenu');
    if (!btn || !menu) return;
    syncLangMenu();
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = menu.hidden;
      closeAdv();
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => {
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      applyLanguage(b.dataset.lang);
    }));
    document.addEventListener('click', (e) => {
      if (!menu.hidden && !e.target.closest('.langwrap')) {
        menu.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) {
        menu.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  }

  async function boot() {
    ChaosSite.initTheme($('theme'));
    ChaosSite.applyI18n(document);
    wireLangMenu();
    if (window.__CHAOS_FALLBACK__) ChaosUnicode.setFallback(window.__CHAOS_FALLBACK__);
    let data = null;
    try {
      data = await ChaosUnicode.loadAll();
    } catch (e) {
      $('output').textContent = T('dataError');
      return;
    }
    if (!data.scripts && window.__CHAOS_FALLBACK__) {
      ChaosUnicode.setFallback(window.__CHAOS_FALLBACK__);
      data = await ChaosUnicode.loadAll();
    }

    const lenInput = $('len'), chaos = $('chaos'), chaosVal = $('chaosVal'),
      levelName = $('levelName'), out = $('output'), stats = $('stats'),
      seedEl = $('seed'), genBtn = $('generate');

    function levelKey(v) { return v <= 25 ? 'low' : v <= 50 ? 'medium' : v <= 80 ? 'high' : 'maximum'; }
    function refreshChaosLabel() {
      const v = +chaos.value;
      chaosVal.textContent = v + '%';
      const key = levelKey(v);
      levelName.textContent = T(key);
      levelName.dataset.level = key;
    }
    chaos.addEventListener('input', refreshChaosLabel);
    refreshChaosLabel();

    document.querySelectorAll('.scale .tick').forEach(t => {
      t.addEventListener('click', () => { chaos.value = t.dataset.value; refreshChaosLabel(); });
    });
    document.querySelectorAll('[data-preset]').forEach(b => {
      b.addEventListener('click', () => {
        lenInput.value = b.dataset.preset;
        document.querySelectorAll('[data-preset]').forEach(x => x.classList.remove('on'));
        b.classList.add('on');
      });
    });

    // ---- Advanced selection: pick exact scripts & categories ----
    const CATS = ['symbols', 'emoji', 'numbers', 'punctuation', 'currency', 'other'];
    const GROUPS = [['modern', 'gModern'], ['cjk', 'gCjk'], ['ancient', 'gAncient']];
    const sel = { disabled: new Set(), emoji: true };
    try {
      const saved = JSON.parse(localStorage.getItem('chaos-sel-v1') || 'null');
      if (saved) {
        if (Array.isArray(saved.d)) saved.d.forEach(id => sel.disabled.add(id));
        if (saved.e === false) sel.emoji = false;
      }
    } catch (e) { /* ignore */ }
    function saveSel() {
      try { localStorage.setItem('chaos-sel-v1', JSON.stringify({ d: [...sel.disabled], e: sel.emoji })); } catch (e) { /* ignore */ }
    }

    const emojiToggle = $('emojiToggle'), emojiState = $('emojiState'),
      catList = $('catList'), scriptGroups = $('scriptGroups'),
      selCount = $('selCount'), advBtn = $('advBtn'), advDot = $('advDot'),
      advModal = $('advModal'), scriptFilter = $('scriptFilter');

    function refreshCounts() {
      const enScripts = data.scripts.filter(s => !sel.disabled.has(s.id)).length;
      const enCats = CATS.filter((k) => !sel.disabled.has('cat:' + k)).length;
      selCount.textContent = T('counts', { s: enScripts, st: data.scripts.length, c: enCats, ct: CATS.length });
      advDot.hidden = !(sel.disabled.size > 0 || !sel.emoji); // dot = custom selection
    }
    function setEmoji(v) {
      sel.emoji = !!v;
      emojiToggle.checked = sel.emoji;
      const inner = catList.querySelector('input[data-cat="emoji"]');
      if (inner) inner.checked = sel.emoji;
      emojiState.textContent = T(sel.emoji ? 'emojiOn' : 'emojiOff');
      saveSel(); refreshCounts();
    }
    emojiToggle.checked = sel.emoji;
    emojiState.textContent = T(sel.emoji ? 'emojiOn' : 'emojiOff');
    emojiToggle.addEventListener('change', () => setEmoji(emojiToggle.checked));

    // Rebuildable (language switch re-renders labels, selection state is kept).
    const scriptBoxes = [];
    function buildLists() {
      catList.innerHTML = '';
      scriptGroups.innerHTML = '';
      scriptBoxes.length = 0;

      CATS.forEach((key) => {
        const lab = document.createElement('label');
        lab.className = 'chk';
        const box = document.createElement('input');
        box.type = 'checkbox'; box.dataset.cat = key;
        box.checked = !sel.disabled.has('cat:' + key) && (key !== 'emoji' || sel.emoji);
        box.addEventListener('change', () => {
          if (key === 'emoji') { setEmoji(box.checked); return; }
          if (box.checked) sel.disabled.delete('cat:' + key); else sel.disabled.add('cat:' + key);
          saveSel(); refreshCounts();
        });
        lab.append(box, document.createTextNode(T('cat_' + key)));
        catList.append(lab);
      });

      GROUPS.forEach(([type, titleKey]) => {
        const members = data.scripts.filter(s => s.type === type);
        if (!members.length) return;
        const sec = document.createElement('div');
        sec.className = 'sgroup';
        const head = document.createElement('div');
        head.className = 'sgrouphead';
        const h = document.createElement('span');
        h.textContent = T(titleKey) + ' (' + members.length + ')';
        const btns = document.createElement('span');
        btns.className = 'advbtns';
        const mkBtn = (labelKey, val) => {
          const b = document.createElement('button');
          b.type = 'button'; b.textContent = T(labelKey);
          b.addEventListener('click', () => {
            members.forEach(s => {
              if (val) sel.disabled.delete(s.id); else sel.disabled.add(s.id);
            });
            scriptBoxes.forEach(o => { if (o.s.type === type) o.box.checked = val; });
            saveSel(); refreshCounts();
          });
          return b;
        };
        btns.append(mkBtn('all', true), mkBtn('none', false));
        head.append(h, btns);
        const grid = document.createElement('div');
        grid.className = 'checkgrid';
        members.forEach(s => {
          const lab = document.createElement('label');
          lab.className = 'chk'; lab.title = s.name;
          const box = document.createElement('input');
          box.type = 'checkbox';
          box.checked = !sel.disabled.has(s.id);
          box.addEventListener('change', () => {
            if (box.checked) sel.disabled.delete(s.id); else sel.disabled.add(s.id);
            saveSel(); refreshCounts();
          });
          lab.append(box, document.createTextNode(s.name));
          grid.append(lab);
          scriptBoxes.push({ s, box, lab });
        });
        sec.append(head, grid);
        scriptGroups.append(sec);
      });
      applyFilter();
    }

    function applyFilter() {
      const q = (scriptFilter.value || '').trim().toLowerCase();
      scriptBoxes.forEach(({ s, lab }) => {
        lab.style.display = (!q || s.name.toLowerCase().includes(q) || s.id.includes(q)) ? '' : 'none';
      });
    }
    scriptFilter.addEventListener('input', applyFilter);
    buildLists();

    $('selAll').addEventListener('click', () => {
      sel.disabled.clear();
      document.querySelectorAll('#catList input, #scriptGroups input').forEach(b => { b.checked = true; });
      if (!sel.emoji) { sel.emoji = true; emojiToggle.checked = true; emojiState.textContent = 'included'; }
      saveSel(); refreshCounts();
    });
    $('selNone').addEventListener('click', () => {
      data.scripts.forEach(s => sel.disabled.add(s.id));
      CATS.forEach((k) => { if (k !== 'emoji') sel.disabled.add('cat:' + k); });
      scriptBoxes.forEach(o => { o.box.checked = false; });
      catList.querySelectorAll('input').forEach(b => { if (b.dataset.cat !== 'emoji') b.checked = false; });
      saveSel(); refreshCounts();
    });

    function selectionOpts() {
      const out = { emojiOn: sel.emoji };
      if (sel.disabled.size) {
        const enScripts = data.scripts.filter(s => !sel.disabled.has(s.id)).map(s => s.id);
        if (enScripts.length < data.scripts.length) out.enabledScripts = enScripts;
        const cats = {};
        let anyCatOff = false;
        CATS.forEach((k) => {
          const off = sel.disabled.has('cat:' + k) || (k === 'emoji' && !sel.emoji);
          cats[k] = !off;
          if (off) anyCatOff = true;
        });
        if (anyCatOff) out.enabledCats = cats;
      }
      return out;
    }
    refreshCounts();

    var lastResult = null, lastMs = '0';
    function render(result, ms) {
      lastResult = result; lastMs = ms;
      out.textContent = result.text;
      renderStats();
      seedEl.textContent = result.seedHex ? result.seedHex.slice(0, 16) + '…' : '—';
      seedEl.title = result.seedHex || '';
      seedEl.dataset.full = result.seedHex || '';
      out.classList.remove('flash');
      void out.offsetWidth;
      out.classList.add('flash');
    }
    function renderStats() {
      if (!lastResult) return;
      const scriptsUsed = new Set(lastResult.meta).size;
      const graphemes = (typeof Intl !== 'undefined' && Intl.Segmenter)
        ? [...new Intl.Segmenter().segment(lastResult.text)].length
        : lastResult.units.length;
      stats.textContent = T('stats', { g: graphemes, s: scriptsUsed, ms: lastMs, level: T(lastResult.weights.name) });
    }

    // ---- Seed: random by default on every Generate; small Edit for manual text ----
    const seedInput = $('customSeed'), seedHash = $('seedHash'),
      seedEditBtn = $('seedEdit'), seedEditRow = $('seedEditRow'), seedHint = $('seedHint');
    function customSeedHex() {
      const t = (seedInput.value || '');
      if (!t) return null;
      try {
        return ChaosEntropy.toHex(ChaosEntropy.sha256(new TextEncoder().encode(t)));
      } catch (e) { return null; }
    }
    function refreshSeedPreview() {
      // Latin printable only (spec) — strip anything else as it is typed.
      const clean = (seedInput.value || '').replace(/[^\x20-\x7E]/g, '');
      if (clean !== seedInput.value) seedInput.value = clean;
      const hex = customSeedHex();
      seedHash.textContent = hex ? hex.slice(0, 12) + '…' : '—';
      seedEditBtn.classList.toggle('on', !!clean);
    }
    seedInput.addEventListener('input', refreshSeedPreview);
    seedEditBtn.addEventListener('click', () => {
      seedEditRow.hidden = !seedEditRow.hidden;
      seedHint.hidden = seedEditRow.hidden;
      if (!seedEditRow.hidden) { refreshSeedPreview(); seedInput.focus(); }
    });
    $('seedApply').addEventListener('click', () => {
      refreshSeedPreview();
      seedEditRow.hidden = true;
      seedHint.hidden = true;
      doGenerate(); // empty input = fresh random seed (default)
    });
    $('seedRandom').addEventListener('click', () => {
      seedInput.value = '';
      refreshSeedPreview();
      seedEditRow.hidden = true;
      seedHint.hidden = true;
      doGenerate();
    });
    refreshSeedPreview();

    // Modal open/close.
    advBtn.addEventListener('click', openAdv);
    $('advClose').addEventListener('click', () => { closeAdv(); advBtn.focus(); });
    advModal.addEventListener('click', (e) => { if (e.target === advModal) closeAdv(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !advModal.hidden) { closeAdv(); advBtn.focus(); }
    });

    applyLangRefresh = () => {
      refreshChaosLabel();
      buildLists();
      refreshCounts();
      setEmoji(sel.emoji);
      refreshSeedPreview();
      renderStats();
      ChaosSite.keepLang();
    };

    function doGenerate(restoreSeed) {
      genBtn.disabled = true;
      setTimeout(() => {
        const t0 = performance.now();
        const result = ChaosGenerator.generate(data, {
          length: +lenInput.value || 2000,
          chaos: +chaos.value,
          restoreSeed: customSeedHex() || restoreSeed || undefined,
          ...selectionOpts()
        });
        render(result, (performance.now() - t0).toFixed(1));
        genBtn.disabled = false;
      }, 30);
    }

    genBtn.addEventListener('click', () => doGenerate());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (document.activeElement === lenInput || document.activeElement === seedInput || document.activeElement === document.body)) doGenerate();
    });

    $('copy').addEventListener('click', async () => {
      if (!out.textContent) return;
      try { await navigator.clipboard.writeText(out.textContent); flash('copy', T('copied')); }
      catch (e) {
        const ta = document.createElement('textarea');
        ta.value = out.textContent; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); ta.remove(); flash('copy', T('copied'));
      }
    });

    $('share').addEventListener('click', async () => {
      const full = seedEl.dataset.full;
      if (!full) return;
      const url = location.origin + location.pathname + '?seed=' + full + '&len=' + (+lenInput.value || 2000) + '&chaos=' + (+chaos.value) + '&lang=' + document.documentElement.lang;
      try { await navigator.clipboard.writeText(url); flash('share', T('linkCopied')); }
      catch (e) {
        const ta = document.createElement('textarea');
        ta.value = url; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); ta.remove(); flash('share', T('linkCopied'));
      }
    });

    $('download').addEventListener('click', () => {
      if (!out.textContent) return;
      const blob = new Blob([out.textContent], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'unicode-chaos.txt';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    });

    $('clear').addEventListener('click', () => { lastResult = null; out.textContent = ''; stats.textContent = ''; seedEl.textContent = '—'; seedEl.dataset.full = ''; });
    out.addEventListener('click', () => {
      if (!out.textContent) return;
      const r = document.createRange(); r.selectNodeContents(out);
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    });

    function flash(id, msg) {
      const b = $(id); const old = b.textContent;
      b.textContent = msg; setTimeout(() => (b.textContent = old), 1200);
    }

    // Restore shared link or auto-generate fresh
    const shared = seedFromURL();
    if (shared) {
      seedInput.value = ''; // a shared link always wins over manual text
      refreshSeedPreview();
      try {
        const p = new URLSearchParams(location.search);
        if (p.get('len')) lenInput.value = Math.max(1, Math.min(100000, +p.get('len') || 2000));
        if (p.get('chaos')) { chaos.value = Math.max(0, Math.min(100, +p.get('chaos') || 100)); refreshChaosLabel(); }
      } catch (e) { /* ignore */ }
      doGenerate(shared);
    } else {
      doGenerate();
    }
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
