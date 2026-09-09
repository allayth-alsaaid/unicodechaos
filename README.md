<div align="center">
  <img src="favicon.svg" width="96" height="96" alt="Unicode Chaos mark — a U dissolving into chaos" />
  <h1>Unicode Chaos</h1>
  <p><b>Every script on Earth in one text.</b> A pure-random text generator mixing 170 writing systems, symbols, numerals and emoji — with reproducible seeds and zero backend.</p>
  <p>
    <img src="https://img.shields.io/badge/Unicode-16.0-0f766e" alt="Unicode 16.0" />
    <img src="https://img.shields.io/badge/scripts-170-0f766e" alt="170 scripts" />
    <img src="https://img.shields.io/badge/backend-zero-0f766e" alt="zero backend" />
    <img src="https://img.shields.io/badge/lang-EN_%7C_%D8%B9%D8%B1%D8%A8%D9%8A-0f766e" alt="English and Arabic" />
    <img src="https://img.shields.io/badge/license-MIT-0f766e" alt="MIT license" />
  </p>
  <p>文あア한글 عЖΩשअবกကဟཀᚠᐃⴰꋅ𐌀𓀀𒀭</p>
</div>

> **Live demo:** https://unicodechaos.netlify.app/
>
> العربية: [README.ar.md](README.ar.md)

## What this is

Unicode Chaos builds text for **pure randomness, never meaning**. Letters from 170 scripts collide with symbols, numerals and emoji through a tiered random engine: familiar scripts first (≈2.4% each), list-categories in the middle (≈1.2% each, emoji boosted to ≈6% as the only color), rare scripts still present (≈0.08% each) — every draw independent.

It is **not readable on purpose**. It is a stress-test, a toy, and an entropy playground.

## Use it for

- **Font stress-testing** — throw 170 scripts at a typeface and watch what survives
- **Multilingual rendering previews** — RTL, CJK, Indic clusters, historic scripts in one paste
- **Glitch art and visuals** — raw material with real variety, not lorem ipsum
- **Playing with real entropy** — every output carries a reproducible cryptographic seed

## Features

- **170 scripts** — every Unicode 16.0 script with real letters, derived from the official UCD tables (nothing hand-picked)
- **Bilingual UI** — full English / Arabic with true RTL layout, remembered across visits
- **Custom seeds** — random by default; type anything (even keyboard mashing) to forge your own
- **Share links** — `?seed=` reproduces your exact text byte for byte
- **Advanced selection** — enable any exact subset of scripts and categories
- **Strict emoji off-switch** — removes every `Emoji=Yes` character, verified with zero leaks
- **Static and offline-friendly** — no backend, no account, no tracking, no dependencies
- **Dark / light themes** with a hand-drawn crescent toggle

## How it works

```
OS randomness (256-bit) + jitter + microsecond stamp + counter
        │  SHA-256
        ▼
   seed (64 hex chars)
        │  Hash-DRBG: SHA-256(seed ‖ n), ratcheted per block
        ▼
Category → Script/Block → Character   (tiered pool: 32 core scripts + 6 lists + 138 rare scripts)
        │
        ▼
  visible text (length counted in graphemes — emoji counts as 1)
```

- **Three-stage draw:** one tiered pick from 176 entries (familiar scripts weighed up so output renders instead of tofu-boxing, rare scripts kept at a low rate), then a uniform code point from the winning script — or a uniform item from the winning list. No anti-repeat rules — chance decides within each tier.
- **Never emitted:** combining marks and invisible/control code points (they corrupt counting and rendering).
- **Repeats allowed:** true randomness clumps — the same script or character may appear back-to-back. Only marks/invisibles are filtered, for correctness, never for distribution.
- **Backtracking-resistant stream:** the working key ratchets forward every block, so a leaked live state cannot reveal earlier outputs — while replaying from the published seed still reproduces everything.

## Coverage

| Group | Scripts |
|---|---|
| Modern | 90 |
| CJK (incl. Tangut, Khitan, Nushu) | 12 |
| Ancient & historic | 68 |
| **Total** | **170** |

Plus 143 symbols, 71 emoji, 12 numeral systems (incl. Kaktovik), 48 punctuation marks and 36 currencies.

<details>
<summary><b>Full script list (170)</b></summary>

| Script | Group | Characters |
|---|---|---|
| Ahom | Ancient | 46 |
| Anatolian Hieroglyphs | Ancient | 583 |
| Avestan | Ancient | 54 |
| Bhaiksuki | Ancient | 76 |
| Brahmi | Ancient | 128 |
| Carian | Ancient | 64 |
| Caucasian Albanian | Ancient | 52 |
| Chorasmian | Ancient | 28 |
| Coptic | Ancient | 111 |
| Cuneiform | Ancient | 1,229 |
| Cypriot Syllabary | Ancient | 55 |
| Cypro-Minoan | Ancient | 97 |
| Dogra | Ancient | 44 |
| Egyptian Hieroglyphs | Ancient | 5,073 |
| Elymaic | Ancient | 23 |
| Glagolitic | Ancient | 47 |
| Gothic | Ancient | 27 |
| Grantha | Ancient | 117 |
| Gunjala Gondi | Ancient | 51 |
| Hatran | Ancient | 32 |
| Imperial Aramaic | Ancient | 32 |
| Inscr. Pahlavi | Ancient | 27 |
| Inscr. Parthian | Ancient | 30 |
| Kaithi | Ancient | 66 |
| Kawi | Ancient | 58 |
| Kharoshthi | Ancient | 96 |
| Khojki | Ancient | 45 |
| Khudawadi | Ancient | 57 |
| Linear A | Ancient | 341 |
| Linear B Syllabary | Ancient | 128 |
| Lycian | Ancient | 29 |
| Lydian | Ancient | 26 |
| Mahajani | Ancient | 36 |
| Makasar | Ancient | 19 |
| Manichaean | Ancient | 41 |
| Marchen | Ancient | 80 |
| Masaram Gondi | Ancient | 58 |
| Meroitic Cursive | Ancient | 96 |
| Meroitic Hieroglyphs | Ancient | 32 |
| Modi | Ancient | 69 |
| Multani | Ancient | 37 |
| Nabataean | Ancient | 32 |
| Nandinagari | Ancient | 49 |
| Newa | Ancient | 96 |
| Ogham | Ancient | 28 |
| Old Hungarian | Ancient | 128 |
| Old Italic | Ancient | 32 |
| Old North Arabian | Ancient | 32 |
| Old Permic | Ancient | 38 |
| Old Persian | Ancient | 64 |
| Old Sogdian | Ancient | 40 |
| Old South Arabian | Ancient | 31 |
| Old Turkic | Ancient | 73 |
| Old Uyghur | Ancient | 18 |
| Palmyrene | Ancient | 19 |
| Phags-pa | Ancient | 52 |
| Phoenician | Ancient | 32 |
| Psalter Pahlavi | Ancient | 25 |
| Runic | Ancient | 89 |
| Sharada | Ancient | 96 |
| Siddham | Ancient | 51 |
| Sogdian | Ancient | 26 |
| Soyombo | Ancient | 96 |
| Takri | Ancient | 80 |
| Tirhuta | Ancient | 72 |
| Tulu-Tigalari | Ancient | 53 |
| Ugaritic | Ancient | 30 |
| Zanabazar Square | Ancient | 80 |
| Bopomofo | Cjk | 48 |
| CJK Ext. A | Cjk | 6,592 |
| CJK Ext. B–I | Cjk | 71,114 |
| CJK Unified Ideographs | Cjk | 20,992 |
| Hangul Jamo | Cjk | 256 |
| Hangul Syllables | Cjk | 11,172 |
| Hiragana | Cjk | 86 |
| Katakana | Cjk | 90 |
| Katakana Phonetic Ext. | Cjk | 16 |
| Khitan Small | Cjk | 471 |
| Nushu | Cjk | 397 |
| Tangut | Cjk | 6,914 |
| Adlam | Modern | 75 |
| Arabic | Modern | 70 |
| Armenian | Modern | 77 |
| Balinese | Modern | 128 |
| Bamum | Modern | 80 |
| Bamum Supplement | Modern | 569 |
| Bassa Vah | Modern | 48 |
| Batak | Modern | 64 |
| Bengali | Modern | 53 |
| Buginese | Modern | 32 |
| Buhid | Modern | 18 |
| Canadian Aboriginal | Modern | 640 |
| Chakma | Modern | 48 |
| Cham | Modern | 96 |
| Cherokee | Modern | 86 |
| Cherokee Supplement | Modern | 80 |
| Cyrillic | Modern | 144 |
| Deseret | Modern | 80 |
| Devanagari | Modern | 53 |
| Duployan | Modern | 139 |
| Elbasan | Modern | 40 |
| Ethiopic | Modern | 504 |
| Garay | Modern | 61 |
| Georgian | Modern | 81 |
| Greek | Modern | 57 |
| Gujarati | Modern | 53 |
| Gurmukhi | Modern | 53 |
| Gurung Khema | Modern | 40 |
| Hanifi Rohingya | Modern | 58 |
| Hanunoo | Modern | 18 |
| Hebrew | Modern | 27 |
| Javanese | Modern | 96 |
| Kannada | Modern | 53 |
| Kayah Li | Modern | 38 |
| Khmer | Modern | 104 |
| Kirat Rai | Modern | 55 |
| Lao | Modern | 45 |
| Latin | Modern | 450 |
| Lepcha | Modern | 80 |
| Limbu | Modern | 80 |
| Lisu | Modern | 49 |
| Malayalam | Modern | 53 |
| Mandaic | Modern | 25 |
| Medefaidrin | Modern | 64 |
| Meetei Mayek | Modern | 64 |
| Mende Kikakui | Modern | 224 |
| Miao (Pollard) | Modern | 144 |
| Mongolian | Modern | 139 |
| Mro | Modern | 48 |
| Myanmar | Modern | 170 |
| Nag Mundari | Modern | 38 |
| New Tai Lue | Modern | 96 |
| Nko | Modern | 30 |
| Nyiakeng Puachue | Modern | 63 |
| Ol Chiki | Modern | 48 |
| Ol Onal | Modern | 41 |
| Oriya | Modern | 53 |
| Osage | Modern | 76 |
| Osmanya | Modern | 40 |
| Pahawh Hmong | Modern | 144 |
| Pau Cin Hau | Modern | 57 |
| Rejang | Modern | 48 |
| Samaritan | Modern | 25 |
| Saurashtra | Modern | 60 |
| Shavian | Modern | 48 |
| Sinhala | Modern | 45 |
| Sora Sompeng | Modern | 35 |
| Sundanese | Modern | 64 |
| Sunuwar | Modern | 43 |
| Syloti Nagri | Modern | 44 |
| Syriac | Modern | 32 |
| Tagalog | Modern | 19 |
| Tagbanwa | Modern | 16 |
| Tai Le | Modern | 37 |
| Tai Tham | Modern | 144 |
| Tai Viet | Modern | 96 |
| Tamil | Modern | 53 |
| Tangsa | Modern | 64 |
| Telugu | Modern | 53 |
| Thaana | Modern | 49 |
| Thai | Modern | 50 |
| Tibetan | Modern | 45 |
| Tifinagh | Modern | 48 |
| Todhri | Modern | 52 |
| Toto | Modern | 30 |
| Vai | Modern | 300 |
| Vithkuqi | Modern | 70 |
| Warang Citi | Modern | 96 |
| Yezidi | Modern | 44 |
| Yi Syllables | Modern | 1,165 |
</details>

## Reproducibility

Every generation mints a fresh 256-bit seed and shows it. A link carries everything needed to rebuild the text:

```
generator.html?seed=<64-hex>&len=2000&chaos=100&lang=en
```

Same seed + same settings = the same text, on any machine, forever. Custom text is hashed (`SHA-256`) into the same seed space, so `asdf jkl; qwerpoi` always rebuilds its own chaos.

## Verified behavior

Measured with the Node harness (no browser needed), not claimed on faith:

| Check | Result |
|---|---|
| Tiered draw, length 17600 | core 78% · lists 12% (emoji ≈ 6%) · obscure 10% · 176/176 entries appear |
| Per-script isolation (single-enable + scripts-only) | 100% pure, correct labels |
| Per-category isolate (emoji-only) | pure |
| Empty selection | falls back to all, never breaks |
| Emoji off, length 2000 | **0 leaks** (checked with the engine's own filter) |
| Same seed twice | byte-identical output |
| Two fresh generations | different output |

## Project structure

```
index.html          landing page (bilingual intro)
generator.html      the generator itself
landing.css         landing styles (same teal tokens)
style.css           generator theme (dark/light via data-theme)
data/               Unicode tables: scripts, symbols, emoji, numbers…
js/entropy.js       sync SHA-256 + Hash-DRBG + jitter collector
js/generator.js     Category → Script → Character engine (uniform random)
js/unicode.js       data loading + filters (marks, invisibles, emoji-off)
js/app.js           generator UI (selection, seeds, share links, i18n)
js/site.js          shared theme + EN/AR dictionary + RTL
js/landing.js       landing motion (glyph rain, marquee, counters)
js/fallback-data.js embedded data copy (works over file://)
favicon.svg         the mark · logo.svg  full lockup
```

## Run locally

```bash
python3 -m http.server 8811
# open http://localhost:8811/index.html
```

No install step. No build step. No dependencies.

## Deploy

Any static host works. Examples:

```bash
npx vercel --prod        # Vercel
netlify deploy --prod    # Netlify
# or drag the folder into Cloudflare Pages
```

## Constraints (deliberate)

- Zero runtime dependencies — CDN libraries were rejected on purpose
- Synchronous SHA-256 (no `crypto.subtle`) so the engine stays dependency-free and deterministic
- `data/` is the source of truth — the engine never hard-codes a language
- Arabic survives in the repo **only** as user-facing strings and Unicode data (the bilingual UI is a feature); all code, comments and docs are English

## Browser support

Any modern browser with `Intl.Segmenter` (grapheme counting) and Unicode property escapes in RegExp (`\p{…}`) — i.e. everything current. Older browsers still generate, with code-point fallback counting.

## Contributing

Issues and pull requests are welcome. If Unicode encodes a new script, add its letter ranges to `data/scripts.json` (letters/numbers only — never combining marks), mirror it in `js/fallback-data.js`, and extend the coverage table above.

## License

MIT — see [LICENSE](LICENSE).

---

> **Note:** This project was created using artificial intelligence.
