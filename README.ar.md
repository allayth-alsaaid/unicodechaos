<div align="center">
  <img src="favicon.svg" width="96" height="96" alt="شعار Unicode Chaos — حرف U يتفكك إلى فوضى" />
  <h1>Unicode Chaos</h1>
  <p><b>كل حروف العالم في نص واحد.</b> مولّد نصوص عشوائية خالصة يمزج 170 نظام كتابة ورموزاً وأرقاماً وإيموجي — ببذور قابلة لإعادة الإنتاج وبدون أي باك-إند.</p>
  <p>
    <img src="https://img.shields.io/badge/Unicode-16.0-0f766e" alt="Unicode 16.0" />
    <img src="https://img.shields.io/badge/scripts-170-0f766e" alt="170 scripts" />
    <img src="https://img.shields.io/badge/backend-zero-0f766e" alt="zero backend" />
    <img src="https://img.shields.io/badge/lang-EN_%7C_%D8%B9%D8%B1%D8%A8%D9%8A-0f766e" alt="English and Arabic" />
    <img src="https://img.shields.io/badge/license-MIT-0f766e" alt="MIT license" />
  </p>
  <p>文あア한글 عЖΩשअবกကဟཀᚠᐃⴰꋅ𐌀𓀀𒀭</p>
</div>

> **العرض الحي:** https://unicodechaos.netlify.app/
>
> English: [README.md](README.md)

## ما هذا؟

يبني Unicode Chaos نصاً **لعشوائية خالصة لا لأي معنى**. حروف من 170 سكريبت تصطدم بالرموز والأرقام والإيموجي عبر محرك عشوائي مُدرَّج: السكريبتات المألوفة أولًا (≈2.4% لكل منها)، ثم فئات القوائم (≈1.2%، والإيموجي مُعزَّز إلى ≈6% كلون وحيد)، والنادرة حاضرة بنسبة منخفضة (≈0.08%) — وكل سحبة مستقلة.

إنه **غير مقروء عن قصد**. إنه اختبار تحمّل، ولعبة، وملعب إنتروبيا.

## استخدمه لـ

- **اختبار تحمّل الخطوط** — ارمِ 170 سكريبت على خط واحد وشاهد ما ينجو
- **معاينة العرض متعدد اللغات** — RTL وCJK وعناقيد الهند والسكريبتات التاريخية بلصقة واحدة
- **فن الغليتش والمرئيات** — مادة خام بتنوع حقيقي لا نص لوريم
- **اللعب بالإنتروبيا الحقيقية** — كل ناتج يحمل بذرة تشفيرية قابلة لإعادة الإنتاج

## المزايا

- **170 سكريبت** — كل سكريبتات Unicode 16.0 ذات الحروف الحقيقية، مشتقة من جداول UCD الرسمية (لا شيء منتقى يدوياً)
- **واجهة ثنائية** — إنجليزية / عربية كاملة بتخطيط RTL حقيقي يُحفظ بين الزيارات
- **بذور مخصصة** — عشوائية افتراضياً؛ اكتب أي شيء (حتى خبطاً عشوائياً) لتصنع بذرتك
- **روابط مشاركة** — `?seed=` يعيد إنتاج نصك حرفاً بحرف
- **اختيار متقدم** — فعّل أي subset دقيق من السكريبتات والفئات
- **مفتاح إيقاف إيموجي صارم** — يزيل كل حرف بخاصية `Emoji=Yes`، ومُتحقق بصفر تسريب
- **ثابت ويعمل دون اتصال** — لا باك-إند ولا حساب ولا تتبع ولا اعتماديات
- **وضع ليلي / نهاري** بزر هلال مرسوم يدوياً

## كيف يعمل؟

```
عشوائية النظام (256 بت) + jitter + طابع ميكروثاني + عدّاد
        │  SHA-256
        ▼
   البذرة (64 خانة ست عشرية)
        │  Hash-DRBG ‏: SHA-256(seed ‖ n) ‏ مع ratchet كل block
        ▼
فئة ← سكريبت ← حرف   (pool مُدرَّج: 32 سكريبت أساسي + 6 قوائم + 138 نادر)
        │
        ▼
  نص مرئي (الطول يُحسب بالـgraphemes — الإيموجي = 1)
```

- **سحب بثلاث مراحل:** سحبة مُدرَّجة واحدة من 176 مدخلًا (المألوفة مُرجَّحة ليُعرض الناتج بدل صناديق الـtofu، والنادرة بنسبة منخفضة)، ثم code point منتظم من السكريبت الفائز — أو عنصر منتظم من القائمة الفائزة. بلا قواعد ضد التكرار — الصدفة تقرر داخل كل طبقة.
- **لا يُخرَج أبداً:** علامات التشكيل والحروف الخفية/التحكم (تفسد العد والعرض).
- **التكرار مسموح:** العشوائية الحقيقية تتكتل — قد يظهر نفس السكريبت أو الحرف متتالياً. يُرشَّح التشكيل/الخفي فقط، للسلامة لا للتوزيع.
- **تدفق مقاوم للتتبع العكسي:** المفتاح يتطور كل block، فتسريب الحالة الحية لا يكشف المخرجات السابقة — وإعادة التشغيل من البذرة المنشورة تعيد كل شيء.

## التغطية

| المجموعة | السكريبتات |
|---|---|
| حديثة | 90 |
| CJK (تشمل التانغوت والخيطان ونوشو) | 12 |
| قديمة وتاريخية | 68 |
| **المجموع** | **170** |

زائد 143 رمزاً و71 إيموجي و12 نظام أرقام (تشمل Kaktovik) و48 علامة ترقيم و36 عملة.

<details>
<summary><b>القائمة الكاملة (170)</b></summary>

| السكريبت | المجموعة | الحروف |
|---|---|---|
| Ahom | قديم | 46 |
| Anatolian Hieroglyphs | قديم | 583 |
| Avestan | قديم | 54 |
| Bhaiksuki | قديم | 76 |
| Brahmi | قديم | 128 |
| Carian | قديم | 64 |
| Caucasian Albanian | قديم | 52 |
| Chorasmian | قديم | 28 |
| Coptic | قديم | 111 |
| Cuneiform | قديم | 1,229 |
| Cypriot Syllabary | قديم | 55 |
| Cypro-Minoan | قديم | 97 |
| Dogra | قديم | 44 |
| Egyptian Hieroglyphs | قديم | 5,073 |
| Elymaic | قديم | 23 |
| Glagolitic | قديم | 47 |
| Gothic | قديم | 27 |
| Grantha | قديم | 117 |
| Gunjala Gondi | قديم | 51 |
| Hatran | قديم | 32 |
| Imperial Aramaic | قديم | 32 |
| Inscr. Pahlavi | قديم | 27 |
| Inscr. Parthian | قديم | 30 |
| Kaithi | قديم | 66 |
| Kawi | قديم | 58 |
| Kharoshthi | قديم | 96 |
| Khojki | قديم | 45 |
| Khudawadi | قديم | 57 |
| Linear A | قديم | 341 |
| Linear B Syllabary | قديم | 128 |
| Lycian | قديم | 29 |
| Lydian | قديم | 26 |
| Mahajani | قديم | 36 |
| Makasar | قديم | 19 |
| Manichaean | قديم | 41 |
| Marchen | قديم | 80 |
| Masaram Gondi | قديم | 58 |
| Meroitic Cursive | قديم | 96 |
| Meroitic Hieroglyphs | قديم | 32 |
| Modi | قديم | 69 |
| Multani | قديم | 37 |
| Nabataean | قديم | 32 |
| Nandinagari | قديم | 49 |
| Newa | قديم | 96 |
| Ogham | قديم | 28 |
| Old Hungarian | قديم | 128 |
| Old Italic | قديم | 32 |
| Old North Arabian | قديم | 32 |
| Old Permic | قديم | 38 |
| Old Persian | قديم | 64 |
| Old Sogdian | قديم | 40 |
| Old South Arabian | قديم | 31 |
| Old Turkic | قديم | 73 |
| Old Uyghur | قديم | 18 |
| Palmyrene | قديم | 19 |
| Phags-pa | قديم | 52 |
| Phoenician | قديم | 32 |
| Psalter Pahlavi | قديم | 25 |
| Runic | قديم | 89 |
| Sharada | قديم | 96 |
| Siddham | قديم | 51 |
| Sogdian | قديم | 26 |
| Soyombo | قديم | 96 |
| Takri | قديم | 80 |
| Tirhuta | قديم | 72 |
| Tulu-Tigalari | قديم | 53 |
| Ugaritic | قديم | 30 |
| Zanabazar Square | قديم | 80 |
| Bopomofo | CJK | 48 |
| CJK Ext. A | CJK | 6,592 |
| CJK Ext. B–I | CJK | 71,114 |
| CJK Unified Ideographs | CJK | 20,992 |
| Hangul Jamo | CJK | 256 |
| Hangul Syllables | CJK | 11,172 |
| Hiragana | CJK | 86 |
| Katakana | CJK | 90 |
| Katakana Phonetic Ext. | CJK | 16 |
| Khitan Small | CJK | 471 |
| Nushu | CJK | 397 |
| Tangut | CJK | 6,914 |
| Adlam | حديث | 75 |
| Arabic | حديث | 70 |
| Armenian | حديث | 77 |
| Balinese | حديث | 128 |
| Bamum | حديث | 80 |
| Bamum Supplement | حديث | 569 |
| Bassa Vah | حديث | 48 |
| Batak | حديث | 64 |
| Bengali | حديث | 53 |
| Buginese | حديث | 32 |
| Buhid | حديث | 18 |
| Canadian Aboriginal | حديث | 640 |
| Chakma | حديث | 48 |
| Cham | حديث | 96 |
| Cherokee | حديث | 86 |
| Cherokee Supplement | حديث | 80 |
| Cyrillic | حديث | 144 |
| Deseret | حديث | 80 |
| Devanagari | حديث | 53 |
| Duployan | حديث | 139 |
| Elbasan | حديث | 40 |
| Ethiopic | حديث | 504 |
| Garay | حديث | 61 |
| Georgian | حديث | 81 |
| Greek | حديث | 57 |
| Gujarati | حديث | 53 |
| Gurmukhi | حديث | 53 |
| Gurung Khema | حديث | 40 |
| Hanifi Rohingya | حديث | 58 |
| Hanunoo | حديث | 18 |
| Hebrew | حديث | 27 |
| Javanese | حديث | 96 |
| Kannada | حديث | 53 |
| Kayah Li | حديث | 38 |
| Khmer | حديث | 104 |
| Kirat Rai | حديث | 55 |
| Lao | حديث | 45 |
| Latin | حديث | 450 |
| Lepcha | حديث | 80 |
| Limbu | حديث | 80 |
| Lisu | حديث | 49 |
| Malayalam | حديث | 53 |
| Mandaic | حديث | 25 |
| Medefaidrin | حديث | 64 |
| Meetei Mayek | حديث | 64 |
| Mende Kikakui | حديث | 224 |
| Miao (Pollard) | حديث | 144 |
| Mongolian | حديث | 139 |
| Mro | حديث | 48 |
| Myanmar | حديث | 170 |
| Nag Mundari | حديث | 38 |
| New Tai Lue | حديث | 96 |
| Nko | حديث | 30 |
| Nyiakeng Puachue | حديث | 63 |
| Ol Chiki | حديث | 48 |
| Ol Onal | حديث | 41 |
| Oriya | حديث | 53 |
| Osage | حديث | 76 |
| Osmanya | حديث | 40 |
| Pahawh Hmong | حديث | 144 |
| Pau Cin Hau | حديث | 57 |
| Rejang | حديث | 48 |
| Samaritan | حديث | 25 |
| Saurashtra | حديث | 60 |
| Shavian | حديث | 48 |
| Sinhala | حديث | 45 |
| Sora Sompeng | حديث | 35 |
| Sundanese | حديث | 64 |
| Sunuwar | حديث | 43 |
| Syloti Nagri | حديث | 44 |
| Syriac | حديث | 32 |
| Tagalog | حديث | 19 |
| Tagbanwa | حديث | 16 |
| Tai Le | حديث | 37 |
| Tai Tham | حديث | 144 |
| Tai Viet | حديث | 96 |
| Tamil | حديث | 53 |
| Tangsa | حديث | 64 |
| Telugu | حديث | 53 |
| Thaana | حديث | 49 |
| Thai | حديث | 50 |
| Tibetan | حديث | 45 |
| Tifinagh | حديث | 48 |
| Todhri | حديث | 52 |
| Toto | حديث | 30 |
| Vai | حديث | 300 |
| Vithkuqi | حديث | 70 |
| Warang Citi | حديث | 96 |
| Yezidi | حديث | 44 |
| Yi Syllables | حديث | 1,165 |
</details>

## قابلية إعادة الإنتاج

كل توليد يسك بذرة جديدة من 256 بت ويعرضها. الرابط يحمل كل ما يلزم لإعادة بناء النص:

```
generator.html?seed=<64-hex>&len=2000&chaos=100&lang=en
```

نفس البذرة + نفس الإعدادات = نفس النص، على أي جهاز، للأبد. النص المخصص يُشفَّر (`SHA-256`) في فضاء البذور نفسه.

## سلوك مُتحقق منه

مقاس فعلياً لا ادعاءً:

| الفحص | النتيجة |
|---|---|
| سحب مُدرَّج، طول 17600 | أساسي 78% · قوائم 12% (إيموجي ≈ 6%) · نادر 10% · 176/176 مدخلًا تظهر |
| عزل سكريبت وحده (+ فئة السكريبتات فقط) | نقي 100% بتسميات صحيحة |
| عزل فئة الإيموجي وحدها | نقي |
| اختيار فارغ | يعود للكل ولا ينكسر |
| إيقاف الإيموجي، طول 2000 | **صفر تسريب** |
| نفس البذرة مرتين | ناتج متطابق حرفاً بحرف |
| توليدان جديدان متتاليان | مختلفان |

## بنية المشروع

```
index.html          صفحة الهبوط (تعريفية ثنائية اللغة)
generator.html      المولد نفسه
landing.css         ستايل الهبوط (نفس توكنز التيفاني)
style.css           ثيم المولد (ليلي/نهاري عبر data-theme)
data/               جداول Unicode ‏: سكريبتات، رموز، إيموجي، أرقام…
js/entropy.js       ‏SHA-256‏ متزامن + Hash-DRBG + جامع jitter
js/generator.js     محرك فئة ← سكريبت ← حرف (عشوائية منتظمة)
js/unicode.js       تحميل البيانات + فلاتر (تشكيل، خفي، إيقاف إيموجي)
js/app.js           واجهة المولد (اختيار، بذور، مشاركة، لغة)
js/site.js          الثيم المشترك + قاموس EN/AR ‏+ RTL
js/landing.js       حركة الهبوط (مطر حروف، شريط، عدّادات)
js/fallback-data.js نسخة مضمنة من البيانات (يعمل عبر file://)
favicon.svg         العلامة · logo.svg  الشعار الكامل
```

## التشغيل محلياً

```bash
python3 -m http.server 8811
# افتح http://localhost:8811/index.html
```

لا تثبيت. لا بناء. لا اعتماديات.

## النشر

أي استضافة ثابتة تصلح:

```bash
npx vercel --prod        # Vercel
netlify deploy --prod    # Netlify
# أو اسحب المجلد إلى Cloudflare Pages
```

## قيود مقصودة

- صفر اعتماديات تشغيلية — مكتبات CDN مرفوضة عمداً
- SHA-256 متزامن (لا `crypto.subtle`) ليبقى المحرك حتمياً بلا اعتماديات
- `data/` هي مصدر الحقيقة — المحرك لا ي hard-code أي لغة
- العربية باقية في المستودع **فقط** كواجهة وبيانات Unicode (الثنائية ميزة)؛ كل الكود والتعليقات والتوثيق إنجليزية

## دعم المتصفحات

أي متصفح حديث فيه `Intl.Segmenter` وUnicode property escapes (`\p{…}`) — أي كل الحالي. الأقدم يولّد بعدّ احتياطي بالـcode points.

## المساهمة

الـissues والـpull requests مرحب بها. إذا رمّز Unicode سكريبتاً جديداً: أضف مديات حروفه إلى `data/scripts.json` (حروف/أرقام فقط — أبداً تشكيل)، وطابقه في `js/fallback-data.js`، ومدّد جدول التغطية أعلاه.

## الرخصة

MIT — انظر [LICENSE](LICENSE).
