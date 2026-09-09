// weights.js — category weights per chaos level (tunable)
(function (global) {
  const BASE = { scripts: 50, symbols: 15, emoji: 10, numbers: 8, punctuation: 7, currency: 5, other: 5 };

  const LEVELS = {
    low:     { scripts: 78, symbols: 4,  emoji: 2,  numbers: 6, punctuation: 6, currency: 2, other: 2, ancient: false, emojiOn: true },
    medium:  { scripts: 62, symbols: 10, emoji: 6,  numbers: 8, punctuation: 7, currency: 4, other: 3, ancient: false, emojiOn: true },
    high:    { scripts: 52, symbols: 14, emoji: 9,  numbers: 8, punctuation: 7, currency: 5, other: 5, ancient: true,  emojiOn: true },
    maximum: { scripts: 50, symbols: 15, emoji: 10, numbers: 8, punctuation: 7, currency: 5, other: 5, ancient: true,  emojiOn: true }
  };

  function forChaos(chaos01) {
    // chaos01 in [0,1]; map to named levels, interpolate near boundaries by blending
    if (chaos01 <= 0.25) return { name: 'low', ...LEVELS.low };
    if (chaos01 <= 0.5) return { name: 'medium', ...LEVELS.medium };
    if (chaos01 <= 0.8) return { name: 'high', ...LEVELS.high };
    return { name: 'maximum', ...LEVELS.maximum };
  }

  function categoryEntries(weightObj) {
    return [
      { key: 'scripts', weight: weightObj.scripts },
      { key: 'symbols', weight: weightObj.symbols },
      { key: 'emoji', weight: weightObj.emojiOn ? weightObj.emoji : 0 },
      { key: 'numbers', weight: weightObj.numbers },
      { key: 'punctuation', weight: weightObj.punctuation },
      { key: 'currency', weight: weightObj.currency },
      { key: 'other', weight: weightObj.other }
    ].filter(e => e.weight > 0);
  }

  global.ChaosWeights = { BASE, LEVELS, forChaos, categoryEntries };
})(typeof window !== 'undefined' ? window : globalThis);
