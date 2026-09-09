// diversity.js — prevents staying inside one script, boosts rare scripts
(function (global) {
  const HISTORY = 6;

  function createState() {
    return { recentScripts: [], recentChars: [], recentCats: [] };
  }

  // Penalty: if same script appeared in last N picks, reduce its weight.
  function scriptWeightMultiplier(scriptId, state, chaos01) {
    const strength = 0.3 + chaos01 * 0.7; // higher chaos = stronger anti-repeat
    const recent = state.recentScripts.slice(-HISTORY);
    let count = 0;
    for (const s of recent) if (s === scriptId) count++;
    if (count === 0) return 1;
    if (count === 1) return 1 - 0.7 * strength;
    if (count === 2) return 1 - 0.9 * strength;
    return Math.max(0.03, 1 - 0.97 * strength);
  }

  // Rare scripts get a boost so famous scripts don't dominate.
  function rareBoost(script, chaos01) {
    if (!script.rare) return 1;
    return 1 + 0.4 + chaos01 * 1.4; // up to ~2.8x at maximum
  }

  function recordScript(state, scriptId) {
    state.recentScripts.push(scriptId);
    if (state.recentScripts.length > 12) state.recentScripts.shift();
  }

  function recordChar(state, ch) {
    state.recentChars.push(ch);
    if (state.recentChars.length > 6) state.recentChars.shift();
  }

  // Category-level anti-repeat: penalize picking the same category twice in a row,
  // hard-ban 3x in a row at high chaos.
  function categoryAllowed(cat, state, chaos01) {
    const n = state.recentCats.length;
    if (n >= 2 && state.recentCats[n - 1] === cat && state.recentCats[n - 2] === cat) return false;
    if (chaos01 >= 0.5 && n >= 1 && state.recentCats[n - 1] === cat && cat === 'scripts') {
      // still allowed but caller should prefer a different script (handled by script ban below)
    }
    return true;
  }

  function categoryWeightMultiplier(cat, state, chaos01) {
    const n = state.recentCats.length;
    if (n >= 1 && state.recentCats[n - 1] === cat) return 1 - (0.55 + 0.4 * chaos01);
    if (n >= 2 && state.recentCats[n - 2] === cat) return 1 - (0.25 + 0.3 * chaos01);
    return 1;
  }

  // Hard ban: same script never twice in a row (all levels), and at high
  // chaos never twice inside the last 3 script picks.
  function scriptAllowed(scriptId, state, chaos01) {
    const n = state.recentScripts.length;
    if (n >= 1 && state.recentScripts[n - 1] === scriptId) return false;
    if (chaos01 >= 0.5 && n >= 2) {
      const last3 = state.recentScripts.slice(-3);
      let count = 0;
      for (const s of last3) if (s === scriptId) count++;
      if (count >= 2) return false;
    }
    return true;
  }

  function recordCat(state, cat) {
    state.recentCats.push(cat);
    if (state.recentCats.length > 8) state.recentCats.shift();
  }

  function isRepeatChar(state, ch) {
    // reject if ch appears anywhere in the last 2 emitted units
    // (kills ЖЖ and ЖЖЖ cases, plus tighter ABAB-style churn)
    const tail = state.recentChars.slice(-2);
    for (const c of tail) if (c === ch) return true;
    return false;
  }

  global.ChaosDiversity = { createState, scriptWeightMultiplier, rareBoost, recordScript, recordChar, isRepeatChar, categoryAllowed, categoryWeightMultiplier, scriptAllowed, recordCat };
})(typeof window !== 'undefined' ? window : globalThis);
