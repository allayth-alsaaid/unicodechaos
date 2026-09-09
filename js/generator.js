// generator.js — tiered uniform pool: familiar scripts first, everything else
// still present. Core scripts (universal system-font support) are drawn far
// more often; rare/historic scripts stay in the pool at a low rate so the
// output keeps its chaos without drowning in tofu boxes.
(function (global) {
  const R = () => global.ChaosRandom;
  const U = () => global.ChaosUnicode;

  const LIST_KEYS = ['symbols', 'emoji', 'numbers', 'punctuation', 'currency', 'other'];

  // Entry weights (expectations, not quotas — every draw stays independent):
  // core script ≈ 2.4% each (77% together), list-category ≈ 1.2% each
  // except emoji ≈ 6% (the only color — ~3 per visual line on average),
  // other script ≈ 0.08% each (~10% together: present, never flooding).
  const CORE_W = 16, LIST_W = 8, EMOJI_W = 40, RARE_W = 0.5;

  // One entry per script plus one per list-category.
  // User selection filters the pool; an explicitly-emptied pool falls back
  // to everything (never break, never crash).
  function buildPool(data, opts, emojiOn, lists) {
    const enabledScripts = opts.enabledScripts ? new Set(opts.enabledScripts) : null;
    const enabledCats = opts.enabledCats || null;
    const catsOn = k => !enabledCats || enabledCats[k] !== false;
    const pool = [];
    if (catsOn('scripts')) {
      let scripts = data.scripts;
      if (enabledScripts) {
        const sub = scripts.filter(s => enabledScripts.has(s.id));
        if (sub.length) scripts = sub; // empty selection falls back to all
      }
      for (const s of scripts) pool.push({ kind: 'script', script: s, w: s.core ? CORE_W : RARE_W });
    }
    for (const k of LIST_KEYS) {
      if (k === 'emoji' && !emojiOn) continue;
      if (!catsOn(k)) continue;
      if (!lists[k] || !lists[k].length) continue;
      pool.push({ kind: 'list', key: k, w: k === 'emoji' ? EMOJI_W : LIST_W });
    }
    if (!pool.length) {
      for (const s of data.scripts) pool.push({ kind: 'script', script: s, w: s.core ? CORE_W : RARE_W });
      for (const k of LIST_KEYS) {
        if (k === 'emoji' && !emojiOn) continue;
        if (lists[k] && lists[k].length) pool.push({ kind: 'list', key: k, w: k === 'emoji' ? EMOJI_W : LIST_W });
      }
    }
    return pool;
  }

  // Weighted pick over entries with a numeric w field.
  function weightedPick(entries) {
    let total = 0;
    for (const e of entries) total += Math.max(0, e.w);
    if (total <= 0) return entries[entries.length - 1];
    let r = R().float() * total;
    for (const e of entries) { r -= Math.max(0, e.w); if (r <= 0) return e; }
    return entries[entries.length - 1];
  }

  function generate(data, opts) {
    const length = Math.max(1, Math.min(100000, opts.length | 0 || 2000));
    const emojiOn = opts.emojiOn !== false; // explicit outside toggle
    // Strict emoji-off: exclude every Emoji=Yes char (Unicode tables) from
    // ALL curated lists — symbols, numbers, punctuation, currency, other —
    // plus scripts (audited clean, filtered anyway). ASCII 0-9/#/∗ stay.
    const emojiOff = !emojiOn;
    const noEmoji = ch => !U().isEmojiChar(ch);
    const lists = {
      symbols: emojiOff ? data.symbolList.filter(noEmoji) : data.symbolList,
      emoji: data.emoji,
      numbers: emojiOff ? data.numberList.filter(noEmoji) : data.numberList,
      punctuation: emojiOff ? data.unicode.punctuation.filter(noEmoji) : data.unicode.punctuation,
      currency: emojiOff ? data.unicode.currency.filter(noEmoji) : data.unicode.currency,
      other: emojiOff ? data.unicode.other.filter(noEmoji) : data.unicode.other
    };
    const pool = buildPool(data, opts, emojiOn, lists);

    // Forced combined entropy: every draw of this generation flows from
    // SHA256(OS_crypto || microsecond_time || counter). A ?seed= link restores
    // the exact stream to reproduce the same text.
    let stream = null;
    if (opts.restoreSeed && global.ChaosEntropy) {
      stream = global.ChaosEntropy.streamFromHex(opts.restoreSeed);
    }
    if (!stream && global.ChaosEntropy) {
      stream = global.ChaosEntropy.createStream('uniform:' + length);
    }
    if (stream) R().useEntropyStream(stream);
    try {

    const out = [];         // grapheme units (emoji = 1 unit)
    const meta = [];        // parallel script/list labels for stats

    // One pipeline step: tiered entry -> uniform char.
    // Returns true when a unit was appended.
    function step() {
      const e = weightedPick(pool);
      let ch = '', label;
      if (e.kind === 'script') {
        ch = U().randomCharFromScript(e.script, emojiOff);
        label = e.script.id;
      } else {
        ch = R().pick(lists[e.key]);
        label = e.key;
        // emoji sequences count as ONE unit — never split
      }

      if (!ch) return false;
      const BAD = U().BAD_CP;
      if (BAD && BAD.test(ch) && Array.from(ch).length === 1) return false; // never emit lone marks/invisibles
      out.push(ch);
      meta.push(label);
      return true;
    }

    let guard = 0;
    while (out.length < length && guard < length * 40 + 2000) {
      guard++;
      step();
    }

    let text = out.join('');
    // Exact-length guarantee: top up until the VISIBLE grapheme count
    // (Intl.Segmenter, same counter the UI uses) equals the request.
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const seg = new Intl.Segmenter();
      let g = 0;
      const count = () => { g = 0; for (const _ of seg.segment(text)) g++; };
      count();
      let tGuard = 0;
      while (g < length && tGuard < length * 5 + 100) {
        tGuard++;
        if (step() === true) { text += out[out.length - 1]; count(); }
      }
    }
    return { text, units: out, meta, seedHex: stream ? stream.seedHex : null };
    } finally {
      R().clearEntropyStream();
    }
  }

  global.ChaosGenerator = { generate };
})(typeof window !== 'undefined' ? window : globalThis);
