// entropy.js — forced combined entropy for every generation.
// seed = SHA256( OS_crypto_bytes || microsecond_time || monotonic_counter || context )
// Draws come from a Hash-DRBG: SHA256(seed || n), n = 0,1,2...
// Strength >= strongest input source (OS crypto); microsecond time adds a
// unique fingerprint per generation. Fully synchronous (no crypto.subtle).
(function (global) {
  'use strict';

  // ---- minimal sync SHA-256 (bytes in -> 32 bytes out) ----
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  function sha256(bytes) {
    const l = bytes.length;
    const bitLenHi = Math.floor((l * 8) / 4294967296);
    const bitLenLo = (l * 8) >>> 0;
    const paddedLen = (((l + 8) >> 6) + 1) << 6;
    const m = new Uint8Array(paddedLen);
    m.set(bytes);
    m[l] = 0x80;
    const dv = new DataView(m.buffer);
    dv.setUint32(paddedLen - 8, bitLenHi);
    dv.setUint32(paddedLen - 4, bitLenLo);

    let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
    let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
    const w = new Uint32Array(64);

    for (let off = 0; off < paddedLen; off += 64) {
      for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
      for (let i = 16; i < 64; i++) {
        const s0 = ((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^ ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^ (w[i - 15] >>> 3);
        const s1 = ((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^ ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
      for (let i = 0; i < 64; i++) {
        const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        const ch = (e & f) ^ (~e & g);
        const t1 = (h + S1 + ch + K[i] + w[i]) | 0;
        const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        const mj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + mj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
      h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
    }
    const out = new Uint8Array(32);
    const od = new DataView(out.buffer);
    od.setUint32(0, h0); od.setUint32(4, h1); od.setUint32(8, h2); od.setUint32(12, h3);
    od.setUint32(16, h4); od.setUint32(20, h5); od.setUint32(24, h6); od.setUint32(28, h7);
    return out;
  }

  function toHex(bytes) {
    let s = '';
    for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, '0');
    return s;
  }

  function fromHex(hex) {
    const clean = String(hex).toLowerCase().replace(/[^0-9a-f]/g, '');
    if (clean.length !== 64) return null;
    const out = new Uint8Array(32);
    for (let i = 0; i < 32; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
    return out;
  }

  // ---- entropy sources ----
  let monotonic = 0;

  function cryptoBytes(n) {
    const out = new Uint8Array(n);
    try {
      const c = global.crypto;
      if (c && c.getRandomValues) {
        c.getRandomValues(out);
        return out;
      }
    } catch (e) { /* fall through */ }
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      try {
        // eslint-disable-next-line no-eval
        const nc = eval('require')('crypto');
        return new Uint8Array(nc.randomBytes(n));
      } catch (e) { /* fall through */ }
    }
    for (let i = 0; i < n; i++) out[i] = Math.floor(Math.random() * 256);
    return out;
  }

  // Microsecond-resolution stamp: ms wall clock + fractional-ms perf counter + counter.
  function microStamp() {
    monotonic = (monotonic + 1) % 1000000000;
    let perf = '';
    try {
      if (global.performance && typeof global.performance.now === 'function') {
        perf = global.performance.now().toFixed(3); // 1µs digits
      }
    } catch (e) { /* ignore */ }
    return Date.now() + '.' + perf + '.' + monotonic;
  }

  // ---- jitter collector (auxiliary timing noise) ----
  // Samples deltas of tiny busy-work slices through the highest-resolution
  // timer available. Content: scheduling/GC/interrupt noise at whatever
  // granularity the platform allows (browsers deliberately coarsen timers).
  // This is AUXILIARY input only — secrecy always comes from cryptoBytes().
  // Synchronous by design (the whole engine is sync); costs microseconds.
  function jitterBytes(n) {
    const out = new Uint8Array(n);
    let prev = 0;
    try { prev = global.performance && global.performance.now ? global.performance.now() : Date.now(); }
    catch (e) { prev = Date.now(); }
    let acc = 0;
    for (let i = 0; i < n; i++) {
      let x = (Math.imul(i + 1, 2654435761) ^ acc) | 0;
      for (let k = 0; k < 48; k++) { x = Math.imul(x ^ (x >>> 15), 2246822519); x = (x + Math.imul(k + 1, 97)) | 0; }
      acc = (acc + x) | 0;
      let now = 0;
      try { now = global.performance && global.performance.now ? global.performance.now() : Date.now(); }
      catch (e) { now = Date.now(); }
      const d = Math.abs(now - prev);
      prev = now;
      let mr = 0;
      try { mr = Math.floor(Math.random() * 256); } catch (e) { /* ignore */ }
      out[i] = (Math.floor(d * 1048576) ^ (acc & 0xff) ^ mr) & 0xff;
    }
    return out;
  }

  function strBytes(s) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s);
    const out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0xff;
    return out;
  }

  function concat() {
    let total = 0;
    for (let i = 0; i < arguments.length; i++) total += arguments[i].length;
    const out = new Uint8Array(total);
    let p = 0;
    for (let i = 0; i < arguments.length; i++) { out.set(arguments[i], p); p += arguments[i].length; }
    return out;
  }

  // ---- Hash-DRBG stream ----
  // Deterministic replay from seedBytes (share links depend on it).
  // The working key ratchets forward every refill: if the live state ever
  // leaks, earlier outputs stay protected (backtracking resistance) while
  // replaying from the original seed yields the identical sequence.
  function openStream(seedBytes) {
    const seedHex = toHex(seedBytes);
    let key = seedBytes.slice();
    let n = 0;
    let buf = new Uint8Array(0);
    let pos = 0;
    function refill() {
      const ctr = new Uint8Array(4);
      ctr[0] = (n >>> 24) & 0xff; ctr[1] = (n >>> 16) & 0xff; ctr[2] = (n >>> 8) & 0xff; ctr[3] = n & 0xff;
      n = (n + 1) >>> 0;
      buf = sha256(concat(key, ctr));
      key = sha256(concat(key, buf));
      pos = 0;
    }
    function nextFloat() {
      if (pos + 4 > buf.length) refill();
      const v = ((buf[pos] * 16777216) + (buf[pos + 1] << 16) + (buf[pos + 2] << 8) + buf[pos + 3]) / 4294967296;
      pos += 4;
      return v;
    }
    return { seedHex, nextFloat };
  }

  function createStream(context) {
    // Unpredictability = 256 fresh OS-CSPRNG bits (unguessable even open-source:
    // Kerckhoffs's principle — secrecy lives in the key, not the code).
    // microStamp + counter + jitter add uniqueness (never repeat a seed,
    // even across VM snapshots or a weak-RNG boot); they are NOT the secret.
    const seed = sha256(concat(
      cryptoBytes(32),
      jitterBytes(32),
      strBytes(microStamp() + '|' + String(context == null ? '' : context))
    ));
    return openStream(seed);
  }

  function streamFromHex(hex) {
    const seed = fromHex(hex);
    return seed ? openStream(seed) : null;
  }

  global.ChaosEntropy = { sha256, toHex, fromHex, microStamp, cryptoBytes, createStream, streamFromHex };
})(typeof window !== 'undefined' ? window : globalThis);
