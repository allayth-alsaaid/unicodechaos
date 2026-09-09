// generator.js — multi-stage: Category -> Script/Block -> Character, uniform random.
// Every draw is independent and equally likely: uniform category, uniform
// script, uniform code point. No weights, no boosts, no anti-repeat rules.
(function (global) {
  const R = () => global.ChaosRandom;
  const U = () => global.ChaosUnicode;

  const ALL_CATS = ['scripts', 'symbols', 'emoji', 'numbers', 'punctuation', 'currency', 'other'];

  function pickScript(data, enabledScripts) {
    let pool = data.scripts;
    if (enabledScripts) {
      const sub = pool.filter(s => enabledScripts.has(s.id));
      if (sub.length) pool = sub; // empty selection falls back to all (never break)
    }
    return R().pick(pool);
  }

  function generate(data, opts) {
    const length = Math.max(1, Math.min(100000, opts.length | 0 || 2000));
    const emojiOn = opts.emojiOn !== false; // explicit outside toggle
    // Custom selection (advanced settings). Null = everything enabled.
    const enabledScripts = opts.enabledScripts ? new Set(opts.enabledScripts) : null;
    const enabledCats = opts.enabledCats || null;
    // Strict emoji-off: exclude every Emoji=Yes char (Unicode tables) from
    // ALL curated lists — symbols, numbers, punctuation, currency, other —
    // plus scripts (audited clean, filtered anyway). ASCII 0-9/#/∗ stay.
    const emojiOff = !emojiOn;
    const noEmoji = ch => !U().isEmojiChar(ch);
    const symbolList = emojiOff ? data.symbolList.filter(noEmoji) : data.symbolList;
    const numberList = emojiOff ? data.numberList.filter(noEmoji) : data.numberList;
    const punctList = emojiOff ? data.unicode.punctuation.filter(noEmoji) : data.unicode.punctuation;
    const currList = emojiOff ? data.unicode.currency.filter(noEmoji) : data.unicode.currency;
    const otherList = emojiOff ? data.unicode.other.filter(noEmoji) : data.unicode.other;

    // Uniform category list: user selection respected, nothing else.
    let cats = ALL_CATS.filter(k => k !== 'emoji' || emojiOn);
    if (enabledCats) {
      const sub = cats.filter(k => enabledCats[k] !== false);
      if (sub.length) cats = sub; // empty selection falls back to all
    }

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
    const meta = [];        // parallel category/script labels for stats

    // One pipeline step: uniform category -> uniform script -> uniform char.
    // Returns true when a unit was appended.
    function step() {
      const cat = R().pick(cats);
      let ch = '', label = cat;

      if (cat === 'scripts') {
        const script = pickScript(data, enabledScripts);
        ch = U().randomCharFromScript(script, emojiOff);
        label = script.id;
      } else if (cat === 'symbols') {
        ch = R().pick(symbolList);
      } else if (cat === 'emoji') {
        ch = R().pick(data.emoji);
        // emoji sequences count as ONE unit — never split
      } else if (cat === 'numbers') {
        ch = R().pick(numberList);
      } else if (cat === 'punctuation') {
        ch = R().pick(punctList);
      } else if (cat === 'currency') {
        ch = R().pick(currList);
      } else {
        ch = R().pick(otherList);
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
