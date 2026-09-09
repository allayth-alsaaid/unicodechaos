// random.js — logical randomness sources (seedable + crypto)
(function (global) {
  const store = { useCrypto: true, seed: null, _s: 0 };

  function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return function () { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return (h ^= h >>> 16) >>> 0; };
  }
  function mulberry32(a) {
    return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  function setSeed(seedStr) {
    store.seed = seedStr;
    store._s = xmur3(String(seedStr))();
    store._rand = mulberry32(store._s);
  }
  function clearSeed() { store.seed = null; store._rand = null; }

  // Forced combined-entropy stream (ChaosEntropy Hash-DRBG). Takes precedence
  // over everything when installed; cleared automatically per generation.
  function useEntropyStream(stream) { store._stream = stream || null; }
  function clearEntropyStream() { store._stream = null; }

  function float() {
    if (store._stream) return store._stream.nextFloat();
    if (store._rand) return store._rand();
    if (store.useCrypto && global.crypto && crypto.getRandomValues) {
      const a = new Uint32Array(1);
      crypto.getRandomValues(a);
      return a[0] / 4294967296;
    }
    return Math.random();
  }
  function int(min, max) { // [min, max]
    return min + Math.floor(float() * (max - min + 1));
  }
  function pick(arr) {
    if (!arr || arr.length === 0) return undefined;
    return arr[int(0, arr.length - 1)];
  }

  global.ChaosRandom = { float, int, pick, setSeed, clearSeed, useEntropyStream, clearEntropyStream, store };
})(typeof window !== 'undefined' ? window : globalThis);
