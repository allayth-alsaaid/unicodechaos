// site.js — shared across landing + generator: theme (SVG icons) + bilingual AR/EN + RTL.
(function (global) {
  'use strict';

  var STR = {
    en: {
      theme: 'Dark / light', language: 'Language', advanced: 'Advanced — choose scripts & categories', close: 'Close',
      length: 'Length', lenHint: 'visible units · emoji = 1',
      emoji: 'Emoji', emojiOn: 'included', emojiOff: 'off',
      filterPh: 'Filter scripts…',
      gModern: 'Modern scripts', gCjk: 'CJK', gAncient: 'Ancient & historic',
      cat_symbols: 'Symbols', cat_emoji: 'Emoji', cat_numbers: 'Numbers',
      cat_punctuation: 'Punctuation', cat_currency: 'Currency', cat_other: 'Other',
      all: 'All', none: 'None', counts: '{s}/{st} scripts · {c}/{ct} categories',
      seedPh: 'Type anything — even keyboard mashing…',
      seedHint: 'Latin letters only · same text gives same output',
      edit: 'Edit', apply: 'Use', random: 'Random',
      generate: 'Generate',
      seed: 'seed', share: 'Copy link', copy: 'Copy', clear: 'Clear',
      copied: 'Copied ✓', linkCopied: 'Link copied ✓',
      stats: '{g} units · {s} scripts/categories · {ms}ms',
      tiny: 'Same link + same seed always reproduces the same text · Enter regenerates',
      dataError: 'Could not load Unicode data. Serve locally: python3 -m http.server',
      home: 'Back to start',
      // landing
      navCta: 'Open generator', heroBadge: 'Open source · Unicode 16',
      heroH1: 'Every script on Earth in one text.',
      heroSub: 'A generator that mixes 170 writing systems into pure random text. Pick a length, share the seed.',
      liveTag: 'Live chaos', regen: 'regenerating…',
      stScripts: 'scripts', stUnits: 'units max', stEmoji: 'emoji', stBackend: 'backend', stZero: 'Zero',
      marqueeLabel: 'A sample of the covered writing systems',
      whatH: 'Not readable on purpose.',
      whatP1: 'Unicode Chaos builds text for maximum variety, never meaning. Letters from 170 scripts collide with symbols, numerals and emoji.',
      whatP2: 'Use it to stress-test fonts, preview multilingual rendering, make glitch art, or play with real entropy.',
      stepsH: 'Three moves, endless output.',
      specH: 'Fresh chaos, every visit.',
      specP: 'Live samples pulled from twelve writing systems.',
      labPh: 'Type anything…', labOut: 'output', labSeed: 'seed',
      usesH: 'What is it for?',
      u1h: 'Stress-test fonts', u1p: 'Fill any typeface with every script at once and watch where it breaks.',
      u2h: 'Glitch art', u2p: 'Export raw entropy as texture for posters and covers.',
      u3h: 'Entropy experiments', u3p: 'Watch randomness turn into structure, seed by seed.',
      u4h: 'Multilingual mockups', u4p: 'Preview how real interfaces feel in any script.',
      s1h: 'Set the length', s1p: 'Choose how many visible units appear in pure random mix.',
      s2h: 'Generate from real entropy', s2p: 'Every draw flows from OS randomness hashed with SHA-256.',
      s3h: 'Share the exact seed', s3p: 'One link reproduces your text byte for byte.',
      seedH: 'Your keyboard is the seed.',
      seedP: 'Type anything in Latin letters, even random mashing. It is hashed into a seed, so the same text always rebuilds the same chaos.',
      coverH: 'Full Unicode coverage.',
      coverP: 'Every encoded script with real letters, derived from the official Unicode tables. Nothing hand-picked.',
      covModern: 'modern', covCjk: 'CJK', covAncient: 'ancient',
      projH: 'Open source, offline-friendly.',
      projP1: 'No backend, no account, no tracking. A static page that runs anywhere.',
      projP2: 'Data: Unicode 16 tables. Code: yours to fork.',
      github: 'View on GitHub',
      footTag: 'Open-source chaos.', footSrc: 'Built from the Unicode 16 tables.',
      howLink: 'How it works'
    },
    ar: {
      theme: 'ليلي / نهاري', language: 'اللغة', advanced: 'متقدم — اختر السكريبتات والفئات', close: 'إغلاق',
      length: 'الطول', lenHint: 'وحدات مرئية · الإيموجي = 1',
      emoji: 'إيموجي', emojiOn: 'مشمول', emojiOff: 'مطفأ',
      filterPh: 'رشّح السكريبتات…',
      gModern: 'سكريبتات حديثة', gCjk: 'CJK', gAncient: 'قديمة وتاريخية',
      cat_symbols: 'رموز', cat_emoji: 'إيموجي', cat_numbers: 'أرقام',
      cat_punctuation: 'ترقيم', cat_currency: 'عملات', cat_other: 'أخرى',
      all: 'الكل', none: 'لا شيء', counts: '{s}/{st} سكريبت · {c}/{ct} فئات',
      seedPh: 'اكتب أي شيء — حتى خبط عشوائي…',
      seedHint: 'أحرف لاتينية فقط · نفس النص يعطي نفس الناتج',
      edit: 'تعديل', apply: 'استخدام', random: 'عشوائي',
      generate: 'ولّد',
      seed: 'البذرة', share: 'نسخ الرابط', copy: 'نسخ', clear: 'مسح',
      copied: 'تم النسخ ✓', linkCopied: 'تم نسخ الرابط ✓',
      stats: '{g} وحدة · {s} سكريبت/فئة · {ms}ms',
      tiny: 'نفس الرابط + نفس البذرة يعيدان نفس النص دائماً · Enter يعيد التوليد',
      dataError: 'تعذر تحميل بيانات Unicode. شغّل محلياً: python3 -m http.server',
      home: 'عودة للبداية',
      // landing
      navCta: 'افتح المولد', heroBadge: 'مفتوح المصدر · Unicode 16',
      heroH1: 'كل حروف العالم في نص واحد.',
      heroSub: 'مولّد يمزج 170 نظام كتابة في نص عشوائي خالص. اختر الطول وشارك البذرة.',
      liveTag: 'فوضى حيّة', regen: 'يتجدد…',
      stScripts: 'سكريبت', stUnits: 'وحدة كحد أقصى', stEmoji: 'إيموجي', stBackend: 'باك-إند', stZero: 'صفر',
      marqueeLabel: 'عينة من أنظمة الكتابة المغطاة',
      whatH: 'غير مقروء عن قصد.',
      whatP1: 'يبني Unicode Chaos نصاً لأقصى تنوع لا لأي معنى. حروف من 170 سكريبت تصطدم بالرموز والأرقام والإيموجي.',
      whatP2: 'استخدمه لاختبار الخطوط، ومعاينة العرض متعدد اللغات، وصناعة فن الغليتش، أو اللعب بالإنتروبيا الحقيقية.',
      stepsH: 'ثلاث خطوات وناتج لا نهائي.',
      specH: 'فوضى جديدة مع كل زيارة.',
      specP: 'عينات حية من اثنتي عشرة منظومة كتابة.',
      labPh: 'اكتب أي شيء…', labOut: 'الناتج', labSeed: 'البذرة',
      usesH: 'لأي شيء تصلح؟',
      u1h: 'اختبر الخطوط تحت الضغط', u1p: 'املأ أي خط بكل المنظومات دفعة واحدة وشاهد أين ينكسر.',
      u2h: 'فن الغليتش', u2p: 'صدّر الإنتروبيا الخام كخامة للملصقات والأغلفة.',
      u3h: 'تجارب الإنتروبيا', u3p: 'شاهد العشوائية تتحول إلى بنية، بذرة بعد بذرة.',
      u4h: 'نماذج متعددة اللغات', u4p: 'عاين إحساس الواجهات الحقيقية بأي منظومة كتابة.',
      s1h: 'حدد الطول', s1p: 'اختر عدد الوحدات المرئية في مزيج عشوائي خالص.',
      s2h: 'ولّد من إنتروبيا حقيقية', s2p: 'كل سحبة تتدفق من عشوائية النظام مشفّرة بـ SHA-256.',
      s3h: 'شارك البذرة نفسها', s3p: 'رابط واحد يعيد إنتاج نصك حرفاً بحرف.',
      seedH: 'لوحة مفاتيحك هي البذرة.',
      seedP: 'اكتب أي شيء بالأحرف اللاتينية حتى لو خبطاً عشوائياً. يُشفَّر إلى بذرة، فالنص نفسه يعيد بناء الفوضى نفسها دائماً.',
      coverH: 'تغطية Unicode كاملة.',
      coverP: 'كل سكريبت مرمّز فيه حروف حقيقية، مشتق من جداول Unicode الرسمية. لا شيء منتقى يدوياً.',
      covModern: 'حديث', covCjk: 'CJK', covAncient: 'قديم',
      projH: 'مفتوح المصدر ويعمل دون اتصال.',
      projP1: 'لا باك-إند ولا حساب ولا تتبع. صفحة ثابتة تعمل في أي مكان.',
      projP2: 'البيانات: جداول Unicode 16. الكود: لك لتفرّعه.',
      github: 'شاهد على GitHub',
      footTag: 'فوضى مفتوحة المصدر.', footSrc: 'مبني من جداول Unicode 16.',
      howLink: 'كيف يعمل'
    }
  };

  function getLang() {
    var l = null;
    try {
      l = new URLSearchParams(location.search).get('lang') || localStorage.getItem('chaos-lang');
    } catch (e) { /* ignore */ }
    if (l !== 'ar' && l !== 'en') {
      try {
        l = ((navigator.language || 'en').toLowerCase().indexOf('ar') === 0) ? 'ar' : 'en';
      } catch (e) { l = 'en'; }
    }
    return l;
  }

  function T(key, vars) {
    var lang = document.documentElement.lang === 'ar' ? 'ar' : 'en';
    var s = (STR[lang] && STR[lang][key]) || STR.en[key] || key;
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] == null ? m : vars[k]; });
    return s;
  }

  function applyI18n(root) {
    root = root || document;
    root.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = T(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-ph]').forEach(function (el) { el.placeholder = T(el.dataset.i18nPh); });
    root.querySelectorAll('[data-i18n-aria]').forEach(function (el) { el.setAttribute('aria-label', T(el.dataset.i18nAria)); });
  }

  function setLang(l, reload) {
    if (l !== 'ar' && l !== 'en') l = 'en';
    try { localStorage.setItem('chaos-lang', l); } catch (e) { /* ignore */ }
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    applyI18n(document);
    if (reload) {
      try {
        var u = new URL(location.href);
        u.searchParams.set('lang', l);
        location.href = u.toString();
      } catch (e) { location.reload(); }
    }
    return l;
  }

  // Theme toggle with crisp SVG icons (crescent that reads as a moon + sun).
  // Button must contain .ic-moon and .ic-sun SVGs; CSS shows the current one.
  function initTheme(btn) {
    if (!btn) return 'dark';
    var root = document.documentElement;
    var theme = null;
    try { theme = localStorage.getItem('chaos-theme'); } catch (e) { /* ignore */ }
    if (theme !== 'dark' && theme !== 'light') {
      theme = (window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
    }
    function apply(t) {
      root.dataset.theme = t;
      try { localStorage.setItem('chaos-theme', t); } catch (e) { /* ignore */ }
    }
    apply(theme);
    btn.addEventListener('click', function () {
      apply(root.dataset.theme === 'dark' ? 'light' : 'dark');
    });
    return theme;
  }

  // Keep ?lang= when moving between landing and generator.
  function keepLang() {
    var l = document.documentElement.lang === 'ar' ? 'ar' : 'en';
    document.querySelectorAll('a[data-keeplang]').forEach(function (a) {
      try {
        var u = new URL(a.getAttribute('href'), location.href);
        if (u.origin === location.origin) { u.searchParams.set('lang', l); a.href = u.toString(); }
      } catch (e) { /* ignore */ }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', keepLang);
  else keepLang();

  global.ChaosSite = { STR, getLang, setLang, applyI18n, initTheme, keepLang, T };
})(typeof window !== 'undefined' ? window : globalThis);
