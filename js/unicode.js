// unicode.js — Unicode is the source of truth. Loads data/*.json with embedded fallback.
(function (global) {
  async function loadJSON(path) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error('bad status');
      return await res.json();
    } catch (e) {
      return null; // caller falls back to embedded
    }
  }

  function flatten(obj) {
    const out = [];
    for (const k of Object.keys(obj)) for (const c of obj[k]) out.push(c);
    return out;
  }

  function flattenNumbers(numObj) {
    const out = [];
    for (const k of Object.keys(numObj)) for (const c of numObj[k]) out.push(c);
    return out;
  }

  const R = global.ChaosRandom;

  // Invisible / merging code points: combining marks (M) merge into the
  // previous grapheme and format/control/surrogate/unassigned (C) can be
  // invisible or tofu — both read as "lost characters". Never emit them.
  const BAD_CP = /[\p{M}\p{C}]/u;

  // Emoji=Yes per the Unicode tables (engine's UCD). ASCII digits, # and *
  // are technically Emoji=Yes but they are ordinary text — never emoji.
  const EMOJI_TEXT_OK = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#', '*']);
  const EMOJI_CP = /\p{Emoji}/u;
  function isEmojiChar(s) {
    for (const c of s) {
      if (!EMOJI_TEXT_OK.has(c) && EMOJI_CP.test(c)) return true;
    }
    return false;
  }

  function randomCharFromScript(script, emojiOff) {
    // pick a random range weighted by range size, then random code point
    const ranges = script.ranges;
    let total = 0;
    const sizes = ranges.map(([a, b]) => { const s = b - a + 1; total += s; return s; });
    for (let attempt = 0; attempt < 25; attempt++) {
      let r = R.float() * total;
      let cp = ranges[ranges.length - 1][0];
      for (let i = 0; i < ranges.length; i++) {
        r -= sizes[i];
        if (r <= 0) {
          const [a, b] = ranges[i];
          cp = R.int(a, b);
          break;
        }
      }
      if (cp >= 0xD800 && cp <= 0xDFFF) continue; // skip surrogates
      const ch = String.fromCodePoint(cp);
      if (BAD_CP.test(ch)) continue; // skip marks + invisible + unassigned
      if (emojiOff && isEmojiChar(ch)) continue; // strict emoji-off (audit: 0 hits today, defense in depth)
      return ch;
    }
    return '·'; // astronomically rare fallback (visible, countable)
  }

  // Embedded fallback = same content as data/*.json (kept small, loaded if fetch fails on file://)
  const FALLBACK = { __filled: false };

  async function loadAll() {
    const [scripts, symbols, emoji, unicode] = await Promise.all([
      loadJSON('data/scripts.json'),
      loadJSON('data/symbols.json'),
      loadJSON('data/emoji.json'),
      loadJSON('data/unicode.json')
    ]);
    const data = {
      scripts: scripts || FALLBACK.scripts,
      symbols: symbols || FALLBACK.symbols,
      emoji: emoji || FALLBACK.emoji,
      unicode: unicode || FALLBACK.unicode
    };
    if (!data.scripts) throw new Error('Unicode data missing. Serve over http or keep data/*.json next to index.html.');
    data.symbolList = sanitizeList(flatten(data.symbols));
    data.numberList = sanitizeList(flattenNumbers(data.unicode.numbers));
    data.unicode.punctuation = sanitizeList(data.unicode.punctuation);
    data.unicode.currency = sanitizeList(data.unicode.currency);
    data.unicode.other = sanitizeList(data.unicode.other);
    data.emoji = data.emoji.filter(s => s && s.length > 0);
    return data;
  }

  function setFallback(fb) { Object.assign(FALLBACK, fb); }

  // Drop single invisible/merging chars from curated lists (keeps emoji
  // sequences like ✈️ intact — only lone M/C code points are removed).
  function sanitizeList(arr) {
    return arr.filter(s => !(Array.from(s).length === 1 && BAD_CP.test(s)));
  }

  global.ChaosUnicode = { loadAll, setFallback, randomCharFromScript, isEmojiChar, flatten, flattenNumbers, sanitizeList, BAD_CP, FALLBACK };
})(typeof window !== 'undefined' ? window : globalThis);
