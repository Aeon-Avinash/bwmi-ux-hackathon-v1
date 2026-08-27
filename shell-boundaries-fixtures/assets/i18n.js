/* Locale loader + bilingual pair. codes[] never pass through t(). */
(function (global) {
  var NCRP = global.NCRP || (global.NCRP = {});

  NCRP.LANGS = {
    hi:  { name: "Hindi", native: "हिन्दी", script: "Devanagari", dir: "ltr" },
    as:  { name: "Assamese", native: "অসমীয়া", script: "Bengali", dir: "ltr" },
    bn:  { name: "Bengali", native: "বাংলা", script: "Bengali", dir: "ltr" },
    brx: { name: "Bodo", native: "बर'", script: "Devanagari", dir: "ltr" },
    doi: { name: "Dogri", native: "डोगरी", script: "Devanagari", dir: "ltr" },
    gu:  { name: "Gujarati", native: "ગુજરાતી", script: "Gujarati", dir: "ltr" },
    kn:  { name: "Kannada", native: "ಕನ್ನಡ", script: "Kannada", dir: "ltr" },
    ks:  { name: "Kashmiri", native: "کٲشُر", script: "Perso-Arabic", dir: "rtl" },
    kok: { name: "Konkani", native: "कोंकणी", script: "Devanagari", dir: "ltr" },
    mai: { name: "Maithili", native: "मैथिली", script: "Devanagari", dir: "ltr" },
    ml:  { name: "Malayalam", native: "മലയാളം", script: "Malayalam", dir: "ltr" },
    mni: { name: "Manipuri", native: "ꯃꯤꯇꯩꯂꯣꯟ", script: "Meetei Mayek", dir: "ltr" },
    mr:  { name: "Marathi", native: "मराठी", script: "Devanagari", dir: "ltr" },
    ne:  { name: "Nepali", native: "नेपाली", script: "Devanagari", dir: "ltr" },
    or:  { name: "Odia", native: "ଓଡ଼ିଆ", script: "Odia", dir: "ltr" },
    pa:  { name: "Punjabi", native: "ਪੰਜਾਬੀ", script: "Gurmukhi", dir: "ltr" },
    sa:  { name: "Sanskrit", native: "संस्कृतम्", script: "Devanagari", dir: "ltr" },
    sat: { name: "Santali", native: "ᱥᱟᱱᱛᱟᱲᱤ", script: "Ol Chiki", dir: "ltr" },
    sd:  { name: "Sindhi", native: "سنڌي", script: "Perso-Arabic", dir: "rtl" },
    ta:  { name: "Tamil", native: "தமிழ்", script: "Tamil", dir: "ltr" },
    te:  { name: "Telugu", native: "తెలుగు", script: "Telugu", dir: "ltr" },
    ur:  { name: "Urdu", native: "اردو", script: "Perso-Arabic", dir: "rtl" }
  };
  NCRP.RTL = { ur: true, ks: true, sd: true };
  NCRP.locale = "hi";
  NCRP.regionalPrimary = true;
  NCRP.stringsEn = null;
  NCRP.stringsHi = null;
  NCRP.strings = null;
  NCRP.fallbacks = {};

  function get(obj, path) {
    if (!obj) return undefined;
    var cur = obj;
    var parts = path.split(".");
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function interp(val, vars) {
    if (val == null) return val;
    if (typeof val !== "string") return val;
    if (!vars) return val;
    return val.replace(/\{(\w+)\}/g, function (_, k) {
      return vars[k] != null ? String(vars[k]) : "";
    });
  }

  function fetchJson(urls) {
    var chain = Promise.reject(new Error("no urls"));
    urls.forEach(function (u) {
      chain = chain.catch(function () {
        return fetch(u, { cache: "no-store" }).then(function (r) {
          if (!r.ok) throw new Error(u + " " + r.status);
          return r.json();
        });
      });
    });
    return chain;
  }

  function packUrls(file) {
    return [
      "../multilingual-packs/i18n/" + file,
      "data/i18n/" + file,
      "data/" + file
    ];
  }

  NCRP.isFallback = function (path) {
    var list = NCRP.fallbacks[NCRP.locale] || [];
    return list.indexOf(path) >= 0;
  };

  NCRP.tEn = function (path, vars) {
    return interp(get(NCRP.stringsEn, path), vars);
  };

  NCRP.lookup = function (path, vars) {
    var raw = get(NCRP.strings, path);
    var usedFallback = false;
    if (raw == null || NCRP.isFallback(path)) {
      raw = get(NCRP.stringsHi, path);
      usedFallback = raw != null;
    }
    if (raw == null) {
      raw = get(NCRP.stringsEn, path);
      usedFallback = false;
    }
    return { text: interp(raw, vars), fallback: usedFallback && raw != null };
  };

  /* Primary line only — attributes, options, errors. */
  NCRP.t = function (path, vars) {
    if (NCRP.regionalPrimary) {
      var hit = NCRP.lookup(path, vars);
      if (hit.text != null) return hit.text;
    }
    var en = NCRP.tEn(path, vars);
    return en != null ? en : path;
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* Two-line / two-weight pair. Both always visible. Switch swaps primacy. */
  NCRP.pair = function (path, vars) {
    var en = NCRP.tEn(path, vars);
    if (en == null) en = path;
    var hit = NCRP.lookup(path, vars);
    var regional = hit.text != null ? hit.text : en;
    var lang = hit.fallback ? "hi" : NCRP.locale;
    var dir = NCRP.RTL[lang] ? "rtl" : "ltr";
    var regInner = esc(regional);
    if (hit.fallback) {
      regInner = '<span class="i18n-fallback" title="Hindi fallback">' + regInner + "</span>";
    }
    var reg = '<span class="regional-line" lang="' + lang + '" dir="' + dir + '">' + regInner + "</span>";
    var eng = '<span class="line-en">' + esc(en) + "</span>";
    if (NCRP.regionalPrimary) {
      return '<span class="bilingual-pair"><span class="line-primary">' + reg +
        '</span><span class="line-secondary">' + eng + "</span></span>";
    }
    return '<span class="bilingual-pair"><span class="line-primary">' + eng +
      '</span><span class="line-secondary">' + reg + "</span></span>";
  };

  NCRP.applyLocaleChrome = function () {
    var html = document.documentElement;
    html.setAttribute("lang", NCRP.locale);
    html.setAttribute("data-locale", NCRP.locale);
    html.classList.toggle("primary-regional", NCRP.regionalPrimary);
    html.classList.toggle("primary-en", !NCRP.regionalPrimary);
    html.classList.toggle("locale-rtl-regional", !!NCRP.RTL[NCRP.locale]);
  };

  NCRP.setLocale = function (code) {
    if (!NCRP.LANGS[code]) return Promise.resolve();
    NCRP.locale = code;
    return fetchJson(packUrls("strings." + code + ".json")).then(function (json) {
      NCRP.strings = json;
      NCRP.applyLocaleChrome();
    });
  };

  NCRP.loadStrings = function () {
    return Promise.all([
      fetchJson(packUrls("strings.en.json")),
      fetchJson(packUrls("strings.hi.json")),
      fetchJson(packUrls("fallbacks.json")).catch(function () { return {}; })
    ]).then(function (res) {
      NCRP.stringsEn = res[0];
      NCRP.stringsHi = res[1];
      NCRP.fallbacks = res[2] || {};
      var stored = {};
      try { stored = JSON.parse(sessionStorage.getItem("ncrp-packet-b-session") || "{}"); } catch (e) {}
      var loc = stored.locale && NCRP.LANGS[stored.locale] ? stored.locale : "hi";
      if (typeof stored.regionalPrimary === "boolean") NCRP.regionalPrimary = stored.regionalPrimary;
      return NCRP.setLocale(loc);
    });
  };
})(window);
