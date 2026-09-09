// generator.js — multi-stage: Category -> Script/Block -> Character + diversity
(function (global) {
  const R = () => global.ChaosRandom;
  const W = () => global.ChaosWeights;
  const D = () => global.ChaosDiversity;
  const U = () => global.ChaosUnicode;

  function pickScript(data, weights, state, chaos01, enabledScripts) {
    let pool = data.scripts;
    if (enabledScripts) {
      const sub = pool.filter(s => enabledScripts.has(s.id));
      if (sub.length) pool = sub; // empty selection falls back to all (never break)
    }
    if (!weights.ancient) pool = pool.filter(s => s.type !== 'ancient');
    if (weights.name === 'low') pool = pool.filter(s => s.type !== 'ancient' && !s.rare).length ? pool.filter(s => s.type !== 'ancient' && !s.rare) : pool;
    if (!pool.length) {
      // Explicit user choice beats level defaults (e.g. ancient script alone at Low).
      // Never crash on an empty pool.
      const fb = enabledScripts ? data.scripts.filter(s => enabledScripts.has(s.id)) : [];
      pool = fb.length ? fb : data.scripts;
    }
    const entries = pool.map(s => ({
      key: s.id,
      script: s,
      weight: (1 + Math.log10(1 + rangeSize(s))) * D().rareBoost(s, chaos01) * D().scriptWeightMultiplier(s.id, state, chaos01)
    }));
    const won = R().weightedPick(entries);
    return { script: won.script, lone: pool.length <= 1 };
  }

  function rangeSize(s) {
    return s.ranges.reduce((a, [x, y]) => a + (y - x + 1), 0);
  }

  function generate(data, opts) {
    const length = Math.max(1, Math.min(100000, opts.length | 0 || 2000));
    const chaos01 = Math.max(0, Math.min(1, (opts.chaos == null ? 100 : opts.chaos) / 100));
    const weights = W().forChaos(chaos01);
    if (opts.emojiOn === false) weights.emojiOn = false; // explicit outside toggle
    const state = D().createState();
    // Custom selection (advanced settings). Null = everything enabled.
    const enabledScripts = opts.enabledScripts ? new Set(opts.enabledScripts) : null;
    const enabledCats = opts.enabledCats || null;
    // Strict emoji-off: exclude every Emoji=Yes char (Unicode tables) from
    // ALL curated lists — symbols, numbers, punctuation, currency, other —
    // plus scripts (audited clean, filtered anyway). ASCII 0-9/#/∗ stay.
    const emojiOff = weights.emojiOn === false;
    const noEmoji = ch => !U().isEmojiChar(ch);
    const symbolList = emojiOff ? data.symbolList.filter(noEmoji) : data.symbolList;
    const numberList = emojiOff ? data.numberList.filter(noEmoji) : data.numberList;
    const punctList = emojiOff ? data.unicode.punctuation.filter(noEmoji) : data.unicode.punctuation;
    const currList = emojiOff ? data.unicode.currency.filter(noEmoji) : data.unicode.currency;
    const otherList = emojiOff ? data.unicode.other.filter(noEmoji) : data.unicode.other;

    // Forced combined entropy: every draw of this generation flows from
    // SHA256(OS_crypto || microsecond_time || counter). A ?seed= link restores
    // the exact stream to reproduce the same text.
    let stream = null;
    if (opts.restoreSeed && global.ChaosEntropy) {
      stream = global.ChaosEntropy.streamFromHex(opts.restoreSeed);
    }
    if (!stream && global.ChaosEntropy) {
      stream = global.ChaosEntropy.createStream(length + ':' + Math.round(chaos01 * 100));
    }
    if (stream) R().useEntropyStream(stream);
    try {

    const out = [];         // grapheme units (emoji = 1 unit)
    const meta = [];        // parallel category/script labels for stats

    // One pipeline step. Returns true when a unit was appended,
    // 'retry' when the pick was soft-rejected (don't consume guard).
    function step() {
      // dynamic category weights with anti-repeat multiplier
      let liveCats = W().categoryEntries(weights).map(e => ({
        ...e,
        weight: e.weight * D().categoryWeightMultiplier(e.key, state, chaos01)
      }));
      if (enabledCats) {
        const sub = liveCats.filter(e => enabledCats[e.key] !== false);
        if (sub.length) liveCats = sub; // empty selection falls back to all
      }
      let cat = R().weightedPick(liveCats).key;
      // hard-ban 3x same category in a row: re-roll once.
      // Skipped when a single category is enabled — the ban assumes alternatives exist.
      if (liveCats.length > 1 && !D().categoryAllowed(cat, state, chaos01)) {
        cat = R().weightedPick(liveCats).key;
        if (!D().categoryAllowed(cat, state, chaos01)) return 'retry';
      }
      let ch = '', label = cat;

      if (cat === 'scripts') {
        // retry loop enforces the same-script hard ban.
        // Skipped when the pool is a single script — the ban assumes alternatives exist.
        const first = pickScript(data, weights, state, chaos01, enabledScripts);
        let script = first.script;
        if (!first.lone) {
          for (let t = 0; t < 12; t++) {
            const cand = pickScript(data, weights, state, chaos01, enabledScripts).script;
            if (D().scriptAllowed(cand.id, state, chaos01)) { script = cand; break; }
            script = cand;
          }
          if (!D().scriptAllowed(script.id, state, chaos01)) return false;
        }
        // retry a few times to avoid immediate char repeat
        for (let t = 0; t < 8; t++) {
          ch = U().randomCharFromScript(script, emojiOff);
          if (!D().isRepeatChar(state, ch)) break;
        }
        label = script.id;
        D().recordScript(state, script.id);
      } else if (cat === 'symbols') {
        for (let t = 0; t < 8; t++) { ch = R().pick(symbolList); if (!D().isRepeatChar(state, ch)) break; }
      } else if (cat === 'emoji') {
        ch = R().pick(data.emoji);
        // emoji sequences count as ONE unit — never split
      } else if (cat === 'numbers') {
        for (let t = 0; t < 8; t++) { ch = R().pick(numberList); if (!D().isRepeatChar(state, ch)) break; }
      } else if (cat === 'punctuation') {
        for (let t = 0; t < 8; t++) { ch = R().pick(punctList); if (!D().isRepeatChar(state, ch)) break; }
      } else if (cat === 'currency') {
        for (let t = 0; t < 8; t++) { ch = R().pick(currList); if (!D().isRepeatChar(state, ch)) break; }
      } else {
        for (let t = 0; t < 8; t++) { ch = R().pick(otherList); if (!D().isRepeatChar(state, ch)) break; }
      }

      if (!ch) return false;
      if (D().isRepeatChar(state, ch)) return false; // hard diversity guarantee
      const BAD = U().BAD_CP;
      if (BAD && BAD.test(ch) && Array.from(ch).length === 1) return false; // never emit lone marks/invisibles
      out.push(ch);
      meta.push(label);
      D().recordChar(state, ch);
      D().recordCat(state, cat);
      return true;
    }

    let guard = 0;
    while (out.length < length && guard < length * 40 + 2000) {
      guard++;
      if (step() === 'retry') guard--;
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
    return { text, units: out, meta, weights, seedHex: stream ? stream.seedHex : null };
    } finally {
      R().clearEntropyStream();
    }
  }

  global.ChaosGenerator = { generate };
})(typeof window !== 'undefined' ? window : globalThis);
