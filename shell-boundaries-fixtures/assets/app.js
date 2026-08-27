/* Packet B portal — unguided live-like shell. Visual: B2 chrome. Tokens/interaction: spine.css. */
(function () {
  var t = function (path, v) { return NCRP.t(path, v); };
  var p = function (path, v) { return NCRP.pair(path, v); };
  var SESS = 'ncrp-packet-b-session';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function session() {
    try { return JSON.parse(sessionStorage.getItem(SESS) || '{}'); } catch (e) { return {}; }
  }
  function saveSession(patch) {
    var cur = session();
    Object.keys(patch).forEach(function (k) { cur[k] = patch[k]; });
    sessionStorage.setItem(SESS, JSON.stringify(cur));
    return cur;
  }
  function go(path) { location.hash = path; }
  function parseRoute() {
    var h = (location.hash || '#/').replace(/^#/, '') || '/';
    if (h.charAt(0) !== '/') h = '/' + h;
    var q = {}, qi = h.indexOf('?');
    if (qi >= 0) {
      h.slice(qi + 1).split('&').forEach(function (p) {
        if (!p) return;
        var kv = p.split('=');
        q[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || '').replace(/\+/g, ' '));
      });
      h = h.slice(0, qi);
    }
    h = h.replace(/\/+$/, '') || '/';
    return { path: h, q: q };
  }
  function digits(s) { return String(s || '').replace(/\D/g, ''); }

  /* ---------- OTP toast: displayed code is the only valid code ---------- */
  function makeOtp() {
    return String(100000 + Math.floor(Math.random() * 900000));
  }
  function showToast(from, body) {
    var el = document.getElementById('toast');
    el.hidden = false;
    el.innerHTML = '<div class="from">' + esc(from) + '</div><div class="body">' + body + '</div>';
  }
  function sendLoginOtp(mobile) {
    var code = makeOtp();
    saveSession({ lastOtp: { purpose: 'login', code: code, mobile: mobile, at: Date.now() } });
    var body = t('otpToast.loginBody', { code: code }).replace(code, '<b>' + esc(code) + '</b>');
    showToast(t('otpToast.from'), body);
    return code;
  }
  function sendTrackOtp(mobile, ack) {
    var code = makeOtp();
    saveSession({ lastOtp: { purpose: 'track', code: code, mobile: mobile, ack: ack, at: Date.now() } });
    var body = t('otpToast.trackBody', { code: code, ack: ack }).replace(code, '<b>' + esc(code) + '</b>');
    showToast(t('otpToast.from'), body);
    return code;
  }
  function toastOtp() {
    var o = session().lastOtp;
    return o && o.code;
  }

  function wireOtp(root, onComplete) {
    var row = root.querySelector('.otp-row');
    var inputs = Array.prototype.slice.call(root.querySelectorAll('.otp-row input'));
    var verify = root.querySelector('[data-verify-otp]');
    function value() { return inputs.map(function (i) { return i.value; }).join(''); }
    function refresh() {
      if (verify) verify.disabled = value().length !== 6;
      if (value().length === 6 && onComplete) onComplete(value());
    }
    inputs.forEach(function (inp, i) {
      inp.addEventListener('input', function () {
        inp.value = inp.value.replace(/\D/g, '').slice(0, 1);
        if (inp.value && i < inputs.length - 1) inputs[i + 1].focus();
        refresh();
      });
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !inp.value && i > 0) inputs[i - 1].focus();
      });
      inp.addEventListener('paste', function (e) {
        var txt = digits((e.clipboardData || window.clipboardData).getData('text')).slice(0, 6);
        if (txt.length < 2) return;
        e.preventDefault();
        txt.split('').forEach(function (d, j) { if (inputs[j]) inputs[j].value = d; });
        inputs[Math.min(txt.length, 5)].focus();
        refresh();
      });
    });
    var fill = root.querySelector('[data-fill-otp]');
    if (fill) {
      fill.addEventListener('click', function () {
        var code = toastOtp();
        if (!code) return;
        code.split('').forEach(function (d, i) { if (inputs[i]) inputs[i].value = d; });
        refresh();
      });
    }
    return { row: row, inputs: inputs, value: value };
  }

  /* ---------- chrome ---------- */
  function emblemSvg() {
    return '<svg width="38" height="38" viewBox="0 0 40 40" aria-hidden="true">' +
      '<circle cx="20" cy="20" r="18" fill="none" stroke="oklch(24% 0.018 255)" stroke-width="1.4"/>' +
      '<path d="M10 26 L20 10 L30 26 Z" fill="none" stroke="oklch(24% 0.018 255)" stroke-width="1.4"/>' +
      '<circle cx="20" cy="18" r="3" fill="oklch(24% 0.018 255)"/>' +
      '<path d="M12 26h16" stroke="oklch(24% 0.018 255)" stroke-width="1.4"/>' +
      '</svg>';
  }
  function i4cSvg() {
    return '<svg width="38" height="38" viewBox="0 0 40 40" aria-hidden="true">' +
      '<circle cx="20" cy="20" r="18" fill="none" stroke="oklch(50% 0.085 235)" stroke-width="1.6"/>' +
      '<text x="20" y="24" text-anchor="middle" font-size="11" font-weight="800" fill="oklch(42% 0.08 235)" font-family="ui-sans-serif,system-ui,sans-serif">I4C</text>' +
      '</svg>';
  }

  function navItems(route) {
    var viewed = session().viewedAck;
    var items = [
      { href: '#/', key: 'chrome.navHome', match: '/' },
      { href: '#/register', key: 'chrome.navRegister', match: '/register' },
      { href: '#/track', key: 'chrome.navTrack', match: '/track' }
    ];
    if (viewed) {
      items.push({
        href: '#/status?ack=' + encodeURIComponent(viewed),
        key: 'chrome.navYourCase',
        match: '/status'
      });
    }
    items.push({ href: '#/suspect', key: 'chrome.navSuspect', match: '/suspect' });
    items.push({ href: '#/learn', key: 'chrome.navLearn', match: '/learn' });
    items.push({ href: '#/contact', key: 'chrome.navContact', match: '/contact' });
    return items.map(function (it) {
      var cur = route.path === it.match || (it.match !== '/' && route.path.indexOf(it.match) === 0);
      return '<li><a href="' + it.href + '"' + (cur ? ' aria-current="page"' : '') + '>' +
        p(it.key) + '</a></li>';
    }).join('');
  }

  function langOptions() {
    var order = ['hi','kn','bn','ta','te','mr','gu','pa','ml','ur','as','or','ne','kok','mai','doi','brx','sa','ks','sd','sat','mni'];
    return order.map(function (code) {
      var m = NCRP.LANGS[code];
      if (!m) return '';
      return '<option value="' + code + '" lang="' + code + '"' +
        (NCRP.RTL[code] ? ' dir="rtl"' : '') +
        (NCRP.locale === code ? ' selected' : '') + '>' + m.native + '</option>';
    }).join('');
  }

  function crumbs(items) {
    return items.map(function (c, i) {
      var lab = c.key ? p(c.key) : esc(c.label);
      if (i === items.length - 1) return '<span class="here">' + lab + '</span>';
      return '<a href="' + c.href + '">' + lab + '</a> <span aria-hidden="true">›</span> ';
    }).join('');
  }

  function chromeTop(route, crumbItems, caseMeta) {
    var s = session();
    var signed = s.citizen
      ? '<div class="signed">' + p('chrome.signedIn') +
        '<b>' + esc(s.citizen.name.toUpperCase()) + ' · ••' + esc(s.citizen.mobile.slice(-4)) + '</b></div>'
      : '';
    var fs = s.font || 'm';
    var primaryName = NCRP.regionalPrimary
      ? (NCRP.LANGS[NCRP.locale] ? NCRP.LANGS[NCRP.locale].native : NCRP.locale)
      : 'English';
    return (
      '<a class="skip" href="#main">' + p('chrome.skip') + '</a>' +
      '<div class="gov-band"><div class="inner">' +
        '<span class="hi">' + t('chrome.govIndiaHi') + '</span>' +
        '<span class="sep">|</span><span class="en">' + t('chrome.govIndia') + '</span>' +
        '<span class="sep">|</span><span class="hi">' + t('chrome.mhaHi') + '</span>' +
        '<span class="sep">|</span><span class="en">' + t('chrome.mha') + '</span>' +
        '<span class="spacer"></span>' +
        '<a class="skip-inline" href="#main">' + t('chrome.skip') + '</a>' +
        '<div class="font-btns" role="group" aria-label="Text size">' +
          '<button type="button" data-font="s" aria-pressed="' + (fs === 's') + '">' + t('chrome.fontSmall') + '</button>' +
          '<button type="button" data-font="m" aria-pressed="' + (fs === 'm') + '">' + t('chrome.fontNormal') + '</button>' +
          '<button type="button" data-font="l" aria-pressed="' + (fs === 'l') + '">' + t('chrome.fontLarge') + '</button>' +
        '</div>' +
      '</div></div>' +
      '<header class="mast"><div class="inner">' +
        '<div class="marks">' +
          '<div class="mark-box" title="' + t('chrome.emblemLabel') + '">' + emblemSvg() + '</div>' +
          '<div class="mark-box" title="' + t('chrome.i4cLabel') + '">' + i4cSvg() + '</div>' +
        '</div>' +
        '<div class="portal-titles">' + p('chrome.title') + '</div>' + signed +
      '</div></header>' +
      '<nav class="gov-nav" aria-label="Portal"><ul>' + navItems(route) + '</ul></nav>' +
      '<div class="bhashini"><div class="inner">' +
        '<label class="lab" for="langPicker">' + p('chrome.bhashini') + '</label>' +
        '<select id="langPicker" aria-label="Language">' + langOptions() + '</select>' +
        '<label class="switch-wrap" title="Swap which line is primary. Both stay visible.">' +
          '<span>Primary: <strong id="primaryLabel">' + primaryName + '</strong></span>' +
          '<input type="checkbox" id="swapSwitch" class="switch-checkbox"' +
            (NCRP.regionalPrimary ? ' checked' : '') + '>' +
          '<span class="switch-ui" aria-hidden="true"></span>' +
        '</label>' +
        '<span class="note">' + p('chrome.bhashiniNote') + '</span>' +
      '</div></div>' +
      '<div class="crumb-row">' +
        '<div class="crumbs">' + crumbs(crumbItems) + '</div>' +
        (caseMeta ? '<div class="case-meta tnum">' + caseMeta + '</div>' : '') +
      '</div>' +
      '<p class="mock-strip">' + p('chrome.mockBanner') + '</p>'
    );
  }

  function chromeFoot() {
    return '<footer class="site-footer">' +
      '<div class="inner"><nav>' +
        '<a href="#/feedback">' + p('chrome.footerFeedback') + '</a>' +
        '<a href="#/faq">' + p('chrome.footerFaq') + '</a>' +
        '<a href="#/contact">' + p('chrome.footerContact') + '</a>' +
        '<a href="#/policies">' + p('chrome.footerPolicies') + '</a>' +
        '<a href="#/privacy">' + p('chrome.footerPrivacy') + '</a>' +
        '<a href="#/disclaimer">' + p('chrome.footerDisclaimer') + '</a>' +
        '<a href="#/accessibility">' + p('chrome.footerA11y') + '</a>' +
      '</nav><div class="helpline tnum">' + t('chrome.helpline') + '</div></div>' +
      '<div class="colo">' + p('chrome.colophon') + '</div>' +
      '</footer>';
  }

  function page(route, crumbItems, inner, opts) {
    opts = opts || {};
    var root = document.getElementById('portal');
    root.innerHTML = chromeTop(route, crumbItems, opts.meta) +
      '<main id="main" tabindex="-1"' + (opts.narrow ? ' class="narrow"' : '') + '>' + inner + '</main>' +
      chromeFoot();
    document.getElementById('main').focus({ preventScroll: true });
    bindChrome();
  }

  function bindChrome() {
    document.querySelectorAll('[data-font]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        saveSession({ font: btn.getAttribute('data-font') });
        applyFont();
        render();
      });
    });
    var picker = document.getElementById('langPicker');
    if (picker) {
      picker.addEventListener('change', function () {
        saveSession({ locale: picker.value });
        NCRP.setLocale(picker.value).then(function () { render(); });
      });
    }
    var sw = document.getElementById('swapSwitch');
    if (sw) {
      sw.addEventListener('change', function () {
        NCRP.regionalPrimary = sw.checked;
        saveSession({ regionalPrimary: sw.checked });
        NCRP.applyLocaleChrome();
        render();
      });
    }
  }
  function applyFont() {
    var fs = session().font || 'm';
    document.documentElement.classList.remove('fs-s', 'fs-l');
    if (fs === 's') document.documentElement.classList.add('fs-s');
    if (fs === 'l') document.documentElement.classList.add('fs-l');
  }

  function trackLabel(track) {
    if (track === 'anonymous') return t('ack.trackAnonymous');
    if (track === 'wc') return t('ack.trackWc');
    if (track === 'other') return t('ack.trackOther');
    return t('ack.trackFinancial');
  }

  /* ---------- pages ---------- */
  function home(route) {
    page(route, [{ key: 'chrome.crumbHome' }],
      '<section class="hero-band">' +
        '<div><p class="dateline">' + t('chrome.mha') + '</p>' +
        '<h1>' + p('home.title') + '</h1>' +
        '<p style="margin-top:12px;max-width:62ch">' + p('home.lede') + '</p></div>' +
        '<aside class="helpline-card">' +
          '<div class="num tnum">1930</div>' +
          '<p>' + p('home.helplineKicker') + ' <b class="tnum">1930</b>. ' + p('home.helplineHint') + '</p>' +
        '</aside>' +
      '</section>' +
      '<section class="track-grid" aria-label="' + t('chrome.navRegister') + '">' +
        '<article class="track-card wc">' +
          '<div class="mark-line">SPECIAL FOCUS</div>' +
          '<h2>' + p('home.cardWcTitle') + '</h2>' +
          '<p>' + p('home.cardWcBody') + '</p>' +
          '<div class="ctas">' +
            '<a class="btn ghost" href="#/acknowledge?track=anonymous">' + p('home.cardWcAnon') + '</a>' +
            '<a class="btn" href="#/acknowledge?track=wc">' + p('home.cardWcTrack') + '</a>' +
          '</div>' +
        '</article>' +
        '<article class="track-card fin">' +
          '<div class="mark-line">1930 + PORTAL</div>' +
          '<h2>' + p('home.cardFinTitle') + '</h2>' +
          '<p>' + p('home.cardFinBody') + '</p>' +
          '<div class="ctas"><a class="btn" href="#/acknowledge?track=financial">' + p('home.cardFinCta') + '</a></div>' +
        '</article>' +
        '<article class="track-card">' +
          '<div class="mark-line">OTHER</div>' +
          '<h2>' + p('home.cardOtherTitle') + '</h2>' +
          '<p>' + p('home.cardOtherBody') + '</p>' +
          '<div class="ctas"><a class="btn" href="#/acknowledge?track=other">' + p('home.cardOtherCta') + '</a></div>' +
        '</article>' +
      '</section>' +
      '<aside class="ticker"><h2>' + p('home.updatesTitle') + '</h2>' +
        '<ul><li>' + p('home.ticker1') + '</li><li>' + p('home.ticker2') + '</li><li>' + p('home.ticker3') + '</li></ul>' +
      '</aside>' +
      '<section class="blk"><div class="sec-h"><h2>' + p('home.learnTitle') + '</h2></div>' +
        '<div class="learn-grid">' +
          learnTile('manual', 'home.learnManual', 'home.learnManualBody') +
          learnTile('safety', 'home.learnSafety', 'home.learnSafetyBody') +
          learnTile('awareness', 'home.learnAwareness', 'home.learnAwarenessBody') +
          learnTile('digest', 'home.learnDigest', 'home.learnDigestBody') +
        '</div></section>',
      {});
  }
  function learnTile(slug, titleKey, bodyKey) {
    return '<a class="learn-item" href="#/learn/' + slug + '"><h3>' + p(titleKey) + '</h3><p>' + p(bodyKey) + '</p></a>';
  }

  function acknowledge(route) {
    var track = route.q.track || 'financial';
    saveSession({ track: track });
    page(route, [
      { href: '#/', key: 'chrome.crumbHome' },
      { href: '#/register', key: 'chrome.navRegister' },
      { key: 'ack.title' }
    ],
      '<div class="ack-card">' +
        '<p class="kicker">' + p('ack.kicker') + '</p>' +
        '<h1>' + p('ack.title') + '</h1>' +
        '<p class="ack-track">' + p('ack.youAreFiling') + ': <b>' + p(track === 'anonymous' ? 'ack.trackAnonymous' : track === 'wc' ? 'ack.trackWc' : track === 'other' ? 'ack.trackOther' : 'ack.trackFinancial') + '</b></p>' +
        '<div class="ack-body"><p>' + p('ack.p1') + '</p><p>' + p('ack.p2') + '</p></div>' +
        '<label class="check sign-row" style="margin-top:18px">' +
          '<input type="checkbox" id="ackChk">' +
          '<span>' + p('ack.check') + '</span>' +
        '</label>' +
        '<div class="ack-actions">' +
          '<button class="btn big" type="button" id="ackGo" disabled>' + p('ack.continue') + '</button>' +
          '<a class="link" href="#/">' + t('ack.back') + '</a>' +
        '</div>' +
      '</div>',
      { narrow: true });
    var chk = document.getElementById('ackChk');
    var goBtn = document.getElementById('ackGo');
    chk.addEventListener('change', function () { goBtn.disabled = !chk.checked; });
    goBtn.addEventListener('click', function () {
      if (track === 'anonymous') go('#/anonymous');
      else go('#/login?track=' + encodeURIComponent(track));
    });
  }

  function login(route) {
    var track = route.q.track || session().track || 'financial';
    saveSession({ track: track });
    page(route, [
      { href: '#/', label: t('chrome.crumbHome') },
      { href: '#/acknowledge?track=' + encodeURIComponent(track), label: t('ack.title') },
      { key: 'login.title' }
    ],
      '<p class="dateline">' + esc(trackLabel(track)) + '</p>' +
      '<h1>' + p('login.title') + '</h1>' +
      '<p class="hi-line">' + p('login.lede') + '</p>' +
      '<div class="panel" style="margin-top:18px;max-width:520px">' +
        '<p style="margin-top:8px;font-size:13.5px"><a class="link" href="#/login?track=' + encodeURIComponent(track) + '">' + p('login.newUser') + '</a></p>' +
        '<div class="field"><label for="nm">' + p('login.name') + '</label>' +
          '<input id="nm" autocomplete="name" placeholder="' + t('login.namePh') + '"></div>' +
        '<div class="field"><label for="mob">' + p('login.mobile') + '</label>' +
          '<input id="mob" inputmode="numeric" maxlength="10" autocomplete="tel" placeholder="' + t('login.mobilePh') + '"></div>' +
        '<div class="actions-row" style="margin-top:16px">' +
          '<button class="btn" type="button" id="getOtp">' + p('login.getOtp') + '</button>' +
        '</div>' +
        '<div class="otp-row" id="otpRow">' +
          otpInputs() +
          '<button class="btn ghost" type="button" data-fill-otp style="padding:10px 14px;font-size:13.5px">Use the SMS code</button>' +
        '</div>' +
        '<p class="error" id="loginErr" hidden></p>' +
        '<div class="actions-row" style="margin-top:16px">' +
          '<button class="btn big" type="button" data-verify-otp disabled>' + p('login.submit') + '</button>' +
          '<button class="btn ghost" type="button" id="clearLogin">' + t('login.clear') + '</button>' +
        '</div>' +
      '</div>',
      { narrow: true });

    var otp = wireOtp(document.getElementById('main'));
    document.getElementById('getOtp').addEventListener('click', function () {
      var name = document.getElementById('nm').value.trim();
      var mob = digits(document.getElementById('mob').value);
      var err = document.getElementById('loginErr');
      if (name.length < 2) { showErr(err, t('login.needName')); return; }
      if (mob.length !== 10) { showErr(err, t('login.needMobile')); return; }
      err.hidden = true;
      sendLoginOtp(mob);
      otp.row.classList.add('show');
      otp.inputs[0].focus();
    });
    document.querySelector('[data-verify-otp]').addEventListener('click', function () {
      var name = document.getElementById('nm').value.trim();
      var mob = digits(document.getElementById('mob').value);
      var err = document.getElementById('loginErr');
      var last = session().lastOtp;
      if (!last || last.purpose !== 'login') { showErr(err, t('login.otpMissing')); return; }
      if (otp.value() !== last.code) { showErr(err, t('login.otpWrong')); return; }
      saveSession({ citizen: { name: name, mobile: mob } });
      go('#/checklist?track=' + encodeURIComponent(track));
    });
    document.getElementById('clearLogin').addEventListener('click', function () {
      document.getElementById('nm').value = '';
      document.getElementById('mob').value = '';
      otp.inputs.forEach(function (i) { i.value = ''; });
    });
  }
  function showErr(el, msg) { el.hidden = false; el.textContent = msg; }
  function otpInputs() {
    return [1, 2, 3, 4, 5, 6].map(function (n) {
      return '<input maxlength="1" inputmode="numeric" aria-label="OTP digit ' + n + '">';
    }).join('');
  }

  function checklist(route) {
    var track = route.q.track || session().track || 'financial';
    if (!session().citizen) { go('#/login?track=' + encodeURIComponent(track)); return; }
    page(route, [
      { href: '#/', label: t('chrome.crumbHome') },
      { href: '#/login?track=' + encodeURIComponent(track), label: t('login.title') },
      { label: t('checklist.title') }
    ],
      '<div class="panel" style="margin-top:18px">' +
        '<div class="rule-title">— ' + t('checklist.titleExact') + ' —</div>' +
        '<p class="warn-pink">' + t('checklist.intro') + '</p>' +
        '<div class="check-list">' +
          '<h3>' + t('checklist.mandatoryTitle') + '</h3>' +
          '<ol>' +
            '<li>' + t('checklist.m1') + '</li>' +
            '<li>' + t('checklist.m2') + '</li>' +
            '<li>' + t('checklist.m3') + '</li>' +
            '<li>' + t('checklist.m4') +
              '<ol type="i"><li>' + t('checklist.m4i') + '</li><li>' + t('checklist.m4ii') + '</li>' +
              '<li>' + t('checklist.m4iii') + '</li><li>' + t('checklist.m4iv') + '</li></ol></li>' +
            '<li>' + t('checklist.m5') + '</li>' +
          '</ol>' +
          '<h3>' + t('checklist.optionalTitle') + '</h3>' +
          '<ol>' +
            '<li>' + t('checklist.o1') + '</li>' +
            '<li>' + t('checklist.o2') +
              '<ol type="i"><li>' + t('checklist.o2i') + '</li><li>' + t('checklist.o2ii') + '</li>' +
              '<li>' + t('checklist.o2iii') + '</li><li>' + t('checklist.o2iv') + '</li>' +
              '<li>' + t('checklist.o2v') + '</li><li>' + t('checklist.o2vi') + '</li></ol></li>' +
          '</ol>' +
        '</div>' +
        '<p class="basis" style="margin-top:16px"><span class="clk clk-deadline">DEADLINE · 24 hrs from first report</span> ' +
          t('checklist.deadline') + '</p>' +
        '<div class="actions-row"><a class="btn big" href="#/complaint?track=' + encodeURIComponent(track) + '">' +
          t('checklist.continue') + '</a></div>' +
      '</div>',
      { narrow: true });
  }

  var BLOCKED = /[#$@*^"~!\]`|{}<>]/;

  function stateOptions(selected) {
    var states = NCRP.strings.geo.states;
    var html = '<option value="">' + t('common.select') + '</option>';
    Object.keys(states).forEach(function (k) {
      html += '<option value="' + k + '"' + (selected === k ? ' selected' : '') + '>' + esc(states[k]) + '</option>';
    });
    return html;
  }
  function districtOptions(st, selected) {
    var d = (NCRP.strings.geo.districts[st] || {});
    var html = '<option value="">' + t('common.select') + '</option>';
    Object.keys(d).forEach(function (k) {
      html += '<option value="' + esc(d[k]) + '"' + (selected === d[k] ? ' selected' : '') + '>' + esc(d[k]) + '</option>';
    });
    return html;
  }

  function complaint(route) {
    var track = route.q.track || session().track || 'financial';
    if (!session().citizen) { go('#/login?track=' + encodeURIComponent(track)); return; }
    var draft = session().draft || { step: 0 };
    page(route, [
      { href: '#/', label: t('chrome.crumbHome') },
      { href: '#/checklist?track=' + encodeURIComponent(track), label: t('checklist.title') },
      { label: t('complaint.title') }
    ],
      '<h1>' + t('complaint.title') + '</h1>' +
      '<p class="hi-line">' + esc(trackLabel(track)) + ' · ' + esc(session().citizen.name) + '</p>' +
      '<div class="form-tabs" role="tablist">' +
        tabBtn(0, t('complaint.stepIncident'), draft.step) +
        tabBtn(1, t('complaint.stepSuspect'), draft.step) +
        tabBtn(2, t('complaint.stepPreview'), draft.step) +
      '</div>' +
      '<div class="form-body" id="formBody"></div>',
      { narrow: true });
    paintComplaintStep(track, draft);
    document.querySelectorAll('.form-tabs button').forEach(function (b) {
      b.addEventListener('click', function () {
        draft.step = Number(b.getAttribute('data-step'));
        saveSession({ draft: draft });
        paintComplaintStep(track, draft);
        document.querySelectorAll('.form-tabs button').forEach(function (x) {
          x.setAttribute('aria-selected', x === b ? 'true' : 'false');
        });
      });
    });
  }
  function tabBtn(n, label, cur) {
    return '<button type="button" role="tab" data-step="' + n + '" aria-selected="' + (cur === n) + '">' + label + '</button>';
  }
  function catOptions(track, selected) {
    if (track === 'wc') {
      return '<option selected>' + t('categories.wc') + '</option>';
    }
    var keys = track === 'other'
      ? ['hacking', 'impersonation', 'phishing', 'harassment']
      : ['upi', 'wallet', 'netbanking', 'card', 'investment'];
    var html = '<option value="">' + t('anonForm.catPlaceholder') + '</option>';
    keys.forEach(function (k) {
      var lab = t('categories.' + k);
      html += '<option' + (selected === lab ? ' selected' : '') + '>' + lab + '</option>';
    });
    return html;
  }
  function paintComplaintStep(track, draft) {
    var body = document.getElementById('formBody');
    var d = draft;
    if (d.step === 0) {
      body.innerHTML =
        (track === 'financial' ? smsBox(d) : '') +
        '<div class="field"><label>' + t('complaint.category') + ' <small>*</small></label>' +
          '<select id="fCat">' + catOptions(track, d.category) + '</select></div>' +
        '<div class="two-fields">' +
          '<div class="field"><label>' + t('complaint.date') + ' <small>*</small></label>' +
            '<input id="fDate" type="date" value="' + esc(d.date || '2026-08-27') + '"></div>' +
          '<div class="field"><label>' + t('complaint.approxWhen') + '</label>' +
            '<div class="time-row">' +
              '<input id="fHh" inputmode="numeric" maxlength="2" placeholder="' + t('complaint.hh') + '" value="' + esc(d.hh || '21') + '" style="width:70px">' +
              '<input id="fMm" inputmode="numeric" maxlength="2" placeholder="' + t('complaint.mm') + '" value="' + esc(d.mm || '12') + '" style="width:70px">' +
              '<select id="fAp" style="width:90px"><option' + (d.ap !== 'AM' ? ' selected' : '') + '>PM</option><option' + (d.ap === 'AM' ? ' selected' : '') + '>AM</option></select>' +
            '</div></div>' +
        '</div>' +
        '<div class="field"><label>' + t('complaint.delay') + '</label>' +
          '<input id="fDelay" value="' + esc(d.delay || '') + '"></div>' +
        '<div class="two-fields">' +
          '<div class="field"><label>' + t('complaint.state') + ' <small>*</small></label>' +
            '<select id="fState">' + stateOptions(d.state) + '</select></div>' +
          '<div class="field"><label>' + t('complaint.district') + ' <small>*</small></label>' +
            '<select id="fDist">' + districtOptions(d.state || '', d.district) + '</select></div>' +
        '</div>' +
        '<div class="field"><label>' + t('complaint.ps') + '</label>' +
          '<input id="fPs" value="' + esc(d.ps || '') + '" placeholder="Sector-21 Cyber PS (mock)"></div>' +
        '<div class="field"><label>' + t('complaint.where') + ' <small>*</small></label>' +
          '<select id="fWhere"><option value="">' + t('common.select') + '</option>' +
          '<option' + (d.where === t('complaint.whereOnline') ? ' selected' : '') + '>' + t('complaint.whereOnline') + '</option>' +
          '<option' + (d.where === t('complaint.whereOffline') ? ' selected' : '') + '>' + t('complaint.whereOffline') + '</option></select></div>' +
        (track === 'financial' ? (
          '<div class="two-fields">' +
            '<div class="field"><label>' + t('complaint.amount') + ' <small>*</small></label>' +
              '<input id="fAmt" inputmode="numeric" value="' + esc(d.amount || '') + '"></div>' +
            '<div class="field"><label>' + t('complaint.bank') + ' <small>*</small></label>' +
              '<input id="fBank" value="' + esc(d.bank || '') + '"></div>' +
          '</div>' +
          '<div class="two-fields">' +
            '<div class="field"><label>' + t('complaint.utr') + ' <small>*</small></label>' +
              '<input id="fUtr" maxlength="12" value="' + esc(d.utr || '') + '"></div>' +
            '<div class="field"><label>' + t('complaint.account') + '</label>' +
              '<input id="fAc" maxlength="4" value="' + esc(d.ac || '') + '"></div>' +
          '</div>'
        ) : '') +
        '<div class="field"><label>' + t('complaint.details') + ' <small>*</small></label>' +
          '<textarea id="fDet" maxlength="1500">' + esc(d.details || '') + '</textarea>' +
          '<div class="char-meta"><span>' + t('complaint.detailsHint') + '</span>' +
          '<span>' + t('complaint.detailsMax', { n: '<b class="n" id="left">1500</b>' }) + '</span></div></div>' +
        '<div class="field"><label>' + t('complaint.idLabel') + '</label>' +
          '<input id="fId" type="file" accept=".jpg,.jpeg,.png"><p style="font-size:13px;color:var(--muted);margin-top:6px">' + t('complaint.idNote') + '</p></div>' +
        '<p class="error" id="cErr" hidden></p>' +
        '<div class="form-nav"><button class="btn" type="button" id="next0">' + t('complaint.saveNext') + '</button></div>';
      wireComplaintDraft(track, d);
      document.getElementById('next0').addEventListener('click', function () {
        if (!readIncident(track, d)) return;
        d.step = 1; saveSession({ draft: d }); complaint(parseRoute());
      });
    } else if (d.step === 1) {
      body.innerHTML =
        '<p style="color:var(--muted);font-size:14.5px">' + t('complaint.suspectNote') + '</p>' +
        '<div class="field"><label>' + t('complaint.suspectName') + '</label><input id="sNm" value="' + esc(d.sName || '') + '"></div>' +
        '<div class="two-fields">' +
          '<div class="field"><label>' + t('complaint.suspectMobile') + '</label><input id="sMob" value="' + esc(d.sMob || '') + '"></div>' +
          '<div class="field"><label>' + t('complaint.suspectEmail') + '</label><input id="sEm" value="' + esc(d.sEm || '') + '"></div>' +
        '</div>' +
        '<div class="field"><label>' + t('complaint.suspectUpi') + '</label><input id="sUpi" value="' + esc(d.sUpi || '') + '"></div>' +
        '<div class="field"><label>' + t('complaint.evidenceLabel') + '</label><input id="sEv" type="file" multiple accept=".jpg,.jpeg,.png,.pdf"></div>' +
        '<div class="form-nav">' +
          '<button class="btn ghost" type="button" id="back1">' + t('complaint.back') + '</button>' +
          '<button class="btn" type="button" id="next1">' + t('complaint.saveNext') + '</button>' +
        '</div>';
      document.getElementById('back1').addEventListener('click', function () {
        d.step = 0; saveSession({ draft: d }); complaint(parseRoute());
      });
      document.getElementById('next1').addEventListener('click', function () {
        d.sName = document.getElementById('sNm').value.trim();
        d.sMob = document.getElementById('sMob').value.trim();
        d.sEm = document.getElementById('sEm').value.trim();
        d.sUpi = document.getElementById('sUpi').value.trim();
        d.evidence = document.getElementById('sEv').files.length ? t('complaint.attached') : t('complaint.none');
        d.step = 2; saveSession({ draft: d }); complaint(parseRoute());
      });
    } else {
      body.innerHTML =
        '<p>' + t('complaint.previewLead') + '</p>' +
        '<dl class="preview-dl" style="margin-top:16px">' +
          row(t('login.name'), session().citizen.name) +
          row(t('login.mobile'), session().citizen.mobile) +
          row(t('complaint.category'), d.category) +
          row(t('complaint.approxWhen'), (d.date || '') + ' ' + (d.hh || '') + ':' + (d.mm || '') + ' ' + (d.ap || '')) +
          row(t('complaint.state'), (NCRP.strings.geo.states[d.state] || d.state || '')) +
          row(t('complaint.district'), d.district) +
          row(t('complaint.where'), d.where) +
          (track === 'financial' ? row(t('complaint.amount'), d.amount) + row(t('complaint.bank'), d.bank) + row(t('complaint.utr'), d.utr) : '') +
          row(t('complaint.details'), d.details) +
          row(t('complaint.suspectName'), d.sName || t('complaint.none')) +
        '</dl>' +
        '<p class="error" id="cErr" hidden></p>' +
        '<div class="form-nav">' +
          '<button class="btn ghost" type="button" id="back2">' + t('complaint.back') + '</button>' +
          '<button class="btn big" type="button" id="submitC">' + t('complaint.submit') + '</button>' +
        '</div>';
      document.getElementById('back2').addEventListener('click', function () {
        d.step = 1; saveSession({ draft: d }); complaint(parseRoute());
      });
      document.getElementById('submitC').addEventListener('click', function () {
        if (!readIncident(track, d, true)) {
          d.step = 0; saveSession({ draft: d }); complaint(parseRoute());
          return;
        }
        var ack = NCRP.issueAck(NCRP.store.now);
        var amtPaise = track === 'financial' ? Math.round(Number(String(d.amount).replace(/[^\d.]/g, '')) * 100) : 0;
        if (!isFinite(amtPaise)) amtPaise = 0;
        var rec = {
          id: 'filed-' + ack,
          ack: ack,
          boundary: 'TRACKABLE',
          categoryTrack: track,
          categoryLabel: d.category,
          complainant: session().citizen.name,
          mobile: session().citizen.mobile,
          state: d.state,
          district: d.district,
          policeStation: d.ps || '',
          day: 0,
          status: 'REPORTED',
          totalPaise: amtPaise,
          theftAt: isoFromDraft(d),
          firstReportAt: NCRP.store.now,
          filedAt: NCRP.store.now,
          lastConfirmedAt: NCRP.store.now,
          narrative: d.details,
          split: track === 'financial' ? { held: 0, requested: 0, unlocated: amtPaise, returned: 0, leak: 0 } : null,
          events: [{
            at: NCRP.store.now,
            author: 'NCRP intake',
            code: 'COMPLAINT_FILED',
            provenance: 'CONFIRMED',
            text: 'Acknowledgement ' + ack + ' issued.',
            band: 'confirmed'
          }]
        };
        NCRP.addFiled(rec);
        saveSession({ viewedAck: ack, draft: { step: 0 } });
        go('#/filed?ack=' + encodeURIComponent(ack));
      });
    }
  }
  function row(k, v) { return '<dt>' + esc(k) + '</dt><dd>' + esc(v || '—') + '</dd>'; }
  function smsBox(d) {
    return '<div class="paste-box">' +
      '<label for="smsPaste">' + t('complaint.smsPaste') + '</label>' +
      '<p style="font-size:13px;color:var(--muted);margin-top:3px">' + t('complaint.smsPasteHi') + '</p>' +
      '<textarea id="smsPaste" placeholder="' + t('complaint.smsPh') + '">' + esc(d.sms || '') + '</textarea>' +
      '<div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap">' +
        '<button class="btn ghost" type="button" id="sampleBtn" style="padding:10px 16px;font-size:14px">' + t('complaint.smsSample') + '</button>' +
        '<button class="btn ghost" type="button" id="fillBtn" style="padding:10px 16px;font-size:14px">' + t('complaint.smsFill') + '</button>' +
      '</div>' +
      '<div class="extract-ok" id="extractOk" role="status">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M4 12l6 6L20 6"/></svg> ' +
        t('complaint.smsOk') +
      '</div></div>';
  }
  function wireComplaintDraft(track, d) {
    var st = document.getElementById('fState');
    st.addEventListener('change', function () {
      document.getElementById('fDist').innerHTML = districtOptions(st.value, '');
    });
    var det = document.getElementById('fDet');
    function count() {
      var left = 1500 - (det.value || '').length;
      var el = document.getElementById('left');
      if (el) el.textContent = String(left);
    }
    det.addEventListener('input', count); count();
    var sample = document.getElementById('sampleBtn');
    if (sample) {
      var SAMPLE = 'Dear Customer, Rs.98,500 debited from A/c XX4821 on 25-08-26 at 21:12 towards UPI/CRM/kubertraders@dvb. If not done by you, call 1930 or report on cybercrime.gov.in -Saral Bank';
      sample.addEventListener('click', function () {
        document.getElementById('smsPaste').value = SAMPLE;
        document.getElementById('fillBtn').click();
      });
      document.getElementById('fillBtn').addEventListener('click', function () {
        var parsed = NCRP.parseSms(document.getElementById('smsPaste').value || '');
        if (parsed.amount && document.getElementById('fAmt')) document.getElementById('fAmt').value = parsed.amount;
        if (parsed.when) {
          var parts = parsed.when.split('T');
          document.getElementById('fDate').value = parts[0];
          var hm = parts[1].split(':');
          var h = Number(hm[0]);
          var ap = h >= 12 ? 'PM' : 'AM';
          var h12 = h % 12; if (!h12) h12 = 12;
          document.getElementById('fHh').value = String(h12).padStart(2, '0');
          document.getElementById('fMm').value = hm[1];
          document.getElementById('fAp').value = ap;
        }
        document.getElementById('extractOk').classList.add('show');
      });
    }
  }
  function readIncident(track, d, silent) {
    var err = document.getElementById('cErr');
    function fail(msg) { if (!silent && err) showErr(err, msg); return false; }
    if (document.getElementById('fCat')) {
      d.category = document.getElementById('fCat').value;
      d.date = document.getElementById('fDate').value;
      d.hh = document.getElementById('fHh').value;
      d.mm = document.getElementById('fMm').value;
      d.ap = document.getElementById('fAp').value;
      d.delay = document.getElementById('fDelay').value;
      d.state = document.getElementById('fState').value;
      d.district = document.getElementById('fDist').value;
      d.ps = document.getElementById('fPs').value;
      d.where = document.getElementById('fWhere').value;
      d.details = document.getElementById('fDet').value.trim();
      if (track === 'financial') {
        d.amount = document.getElementById('fAmt').value.trim();
        d.bank = document.getElementById('fBank').value.trim();
        d.utr = document.getElementById('fUtr').value.trim();
        d.ac = document.getElementById('fAc').value.trim();
      }
      var idf = document.getElementById('fId');
      d.idFile = idf && idf.files.length ? t('complaint.attached') : '';
    }
    if (!d.category) return fail(t('complaint.needCategory'));
    if (!d.date || !d.hh || !d.mm) return fail(t('complaint.needWhen'));
    if (!d.state) return fail(t('complaint.needState'));
    if (!d.district) return fail(t('complaint.needDistrict'));
    if (!d.where) return fail(t('complaint.needWhere'));
    if (!d.details || d.details.length < 200 || BLOCKED.test(d.details)) return fail(t('complaint.needDetails'));
    if (track === 'financial') {
      if (!d.amount) return fail(t('complaint.needAmount'));
      if (!d.bank) return fail(t('complaint.needBank'));
      if (!d.utr || digits(d.utr).length < 12) return fail(t('complaint.needUtr'));
    }
    saveSession({ draft: d });
    return true;
  }
  function isoFromDraft(d) {
    var h = Number(d.hh);
    if (d.ap === 'PM' && h < 12) h += 12;
    if (d.ap === 'AM' && h === 12) h = 0;
    return d.date + 'T' + String(h).padStart(2, '0') + ':' + String(d.mm).padStart(2, '0') + ':00+05:30';
  }

  function anonymous(route) {
    var d = session().anonDraft || { step: 0 };
    page(route, [
      { href: '#/', label: t('chrome.crumbHome') },
      { href: '#/acknowledge?track=anonymous', label: t('ack.title') },
      { label: t('anonForm.title') }
    ],
      '<p class="dateline">' + t('anonForm.kicker') + '</p>' +
      '<h1>' + t('anonForm.title') + '</h1>' +
      '<p class="hi-line">' + t('anonForm.lede') + '</p>' +
      '<div class="form-tabs" role="tablist" style="margin-top:18px">' +
        tabBtn(0, t('complaint.stepIncident'), d.step) +
        tabBtn(1, t('complaint.stepSuspect'), d.step) +
        tabBtn(2, t('complaint.stepPreview'), d.step) +
      '</div><div class="form-body" id="formBody"></div>',
      { narrow: true });
    paintAnon(d);
    document.querySelectorAll('.form-tabs button').forEach(function (b) {
      b.addEventListener('click', function () {
        d.step = Number(b.getAttribute('data-step'));
        saveSession({ anonDraft: d });
        paintAnon(d);
        document.querySelectorAll('.form-tabs button').forEach(function (x) {
          x.setAttribute('aria-selected', x === b ? 'true' : 'false');
        });
      });
    });
  }
  function anonCats(selected) {
    var keys = ['catRgr', 'catObscene', 'catExplicit', 'catCseam'];
    var html = '<option value="">' + t('anonForm.catPlaceholder') + '</option>';
    keys.forEach(function (k) {
      var lab = t('anonForm.' + k);
      html += '<option' + (selected === lab ? ' selected' : '') + '>' + lab + '</option>';
    });
    return html;
  }
  function paintAnon(d) {
    var body = document.getElementById('formBody');
    if (d.step === 0) {
      body.innerHTML =
        '<div class="field"><label>' + t('anonForm.category') + ' <small>*</small></label>' +
          '<select id="fCat">' + anonCats(d.category) + '</select></div>' +
        '<div class="banner-proposed" style="margin-top:12px">' + t('anonForm.kindly') + '</div>' +
        '<div class="two-fields">' +
          '<div class="field"><label>' + t('complaint.date') + ' <small>*</small></label>' +
            '<input id="fDate" type="date" value="' + esc(d.date || '') + '"></div>' +
          '<div class="field"><label>' + t('complaint.approxWhen') + ' <small>*</small></label>' +
            '<div class="time-row">' +
              '<input id="fHh" maxlength="2" placeholder="' + t('complaint.hh') + '" value="' + esc(d.hh || '') + '" style="width:70px">' +
              '<input id="fMm" maxlength="2" placeholder="' + t('complaint.mm') + '" value="' + esc(d.mm || '') + '" style="width:70px">' +
              '<select id="fAp" style="width:90px"><option>AM</option><option>PM</option></select>' +
            '</div></div></div>' +
        '<div class="field"><label>' + t('complaint.delay') + '</label><input id="fDelay" value="' + esc(d.delay || '') + '"></div>' +
        '<div class="two-fields">' +
          '<div class="field"><label>' + t('complaint.state') + ' <small>*</small></label><select id="fState">' + stateOptions(d.state) + '</select></div>' +
          '<div class="field"><label>' + t('complaint.district') + ' <small>*</small></label><select id="fDist">' + districtOptions(d.state || '', d.district) + '</select></div>' +
        '</div>' +
        '<div class="field"><label>' + t('complaint.ps') + '</label><input id="fPs" value="' + esc(d.ps || '') + '"></div>' +
        '<div class="field"><label>' + t('complaint.where') + ' <small>*</small></label>' +
          '<select id="fWhere"><option value="">' + t('common.select') + '</option>' +
          '<option>' + t('complaint.whereOnline') + '</option><option>' + t('complaint.whereOffline') + '</option></select></div>' +
        '<div class="field"><label>' + t('complaint.details') + ' <small>*</small></label>' +
          '<textarea id="fDet" maxlength="1500">' + esc(d.details || '') + '</textarea>' +
          '<div class="char-meta"><span>' + t('complaint.detailsHint') + '</span>' +
          '<span>' + t('complaint.detailsMax', { n: '<b class="n" id="left">1500</b>' }) + '</span></div></div>' +
        '<p class="error" id="cErr" hidden></p>' +
        '<div class="form-nav"><button class="btn" type="button" id="next0">' + t('complaint.saveNext') + '</button></div>';
      if (d.ap) document.getElementById('fAp').value = d.ap;
      if (d.where) document.getElementById('fWhere').value = d.where;
      document.getElementById('fState').addEventListener('change', function () {
        document.getElementById('fDist').innerHTML = districtOptions(this.value, '');
      });
      var det = document.getElementById('fDet');
      function count() { var el = document.getElementById('left'); if (el) el.textContent = String(1500 - det.value.length); }
      det.addEventListener('input', count); count();
      document.getElementById('next0').addEventListener('click', function () {
        if (!readAnonIncident(d)) return;
        d.step = 1; saveSession({ anonDraft: d }); anonymous(parseRoute());
      });
    } else if (d.step === 1) {
      body.innerHTML =
        '<p style="color:var(--muted)">' + t('complaint.suspectNote') + '</p>' +
        '<div class="field"><label>' + t('complaint.suspectName') + '</label><input id="sNm" value="' + esc(d.sName || '') + '"></div>' +
        '<div class="field"><label>' + t('complaint.suspectUpi') + '</label><input id="sUpi" value="' + esc(d.sUpi || '') + '" placeholder="URL / handle / number"></div>' +
        '<div class="form-nav">' +
          '<button class="btn ghost" type="button" id="back1">' + t('complaint.back') + '</button>' +
          '<button class="btn" type="button" id="next1">' + t('complaint.saveNext') + '</button></div>';
      document.getElementById('back1').addEventListener('click', function () { d.step = 0; saveSession({ anonDraft: d }); anonymous(parseRoute()); });
      document.getElementById('next1').addEventListener('click', function () {
        d.sName = document.getElementById('sNm').value.trim();
        d.sUpi = document.getElementById('sUpi').value.trim();
        d.step = 2; saveSession({ anonDraft: d }); anonymous(parseRoute());
      });
    } else {
      body.innerHTML =
        '<p>' + t('anonFiled.lede') + '</p>' +
        '<dl class="preview-dl" style="margin-top:16px">' +
          row(t('anonFiled.categoryLabel'), d.category) +
          row(t('complaint.approxWhen'), (d.date || '') + ' ' + (d.hh || '') + ':' + (d.mm || '') + ' ' + (d.ap || '')) +
          row(t('complaint.state'), (NCRP.strings.geo.states[d.state] || '') ) +
          row(t('complaint.details'), d.details) +
        '</dl>' +
        '<div class="form-nav">' +
          '<button class="btn ghost" type="button" id="back2">' + t('complaint.back') + '</button>' +
          '<button class="btn big" type="button" id="submitA">' + t('complaint.submit') + '</button></div>';
      document.getElementById('back2').addEventListener('click', function () { d.step = 1; saveSession({ anonDraft: d }); anonymous(parseRoute()); });
      document.getElementById('submitA').addEventListener('click', function () {
        if (!readAnonIncident(d, true)) { d.step = 0; saveSession({ anonDraft: d }); anonymous(parseRoute()); return; }
        var now = new Date(NCRP.store.now);
        var ymd = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).replace(/-/g, '').slice(2);
        var hhmm = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).replace(':', '');
        var ref = 'REF-' + ymd + '-' + hhmm;
        NCRP.addFiled({
          id: 'anon-' + ref,
          ack: ref,
          boundary: 'CONFIRMATION_ONLY',
          categoryTrack: 'anonymous',
          categoryLabel: d.category,
          complainant: null,
          mobile: null,
          filedAt: NCRP.store.now,
          status: 'ANONYMOUS_RECEIVED',
          narrative: d.details,
          events: [{ at: NCRP.store.now, author: 'NCRP anonymous intake', code: 'ANONYMOUS_RECEIVED', provenance: 'CONFIRMED',
            text: 'Anonymous report received under ' + d.category + '. Confirmation reference ' + ref + '.', band: 'confirmed' }]
        });
        saveSession({ anonDraft: { step: 0 } });
        go('#/anonymous-filed?ref=' + encodeURIComponent(ref));
      });
    }
  }
  function readAnonIncident(d, silent) {
    var err = document.getElementById('cErr');
    function fail(msg) { if (!silent && err) showErr(err, msg); return false; }
    if (document.getElementById('fCat')) {
      d.category = document.getElementById('fCat').value;
      d.date = document.getElementById('fDate').value;
      d.hh = document.getElementById('fHh').value;
      d.mm = document.getElementById('fMm').value;
      d.ap = document.getElementById('fAp').value;
      d.delay = document.getElementById('fDelay').value;
      d.state = document.getElementById('fState').value;
      d.district = document.getElementById('fDist').value;
      d.ps = document.getElementById('fPs').value;
      d.where = document.getElementById('fWhere').value;
      d.details = document.getElementById('fDet').value.trim();
    }
    if (!d.category) return fail(t('complaint.needCategory'));
    if (!d.date || !d.hh || !d.mm) return fail(t('complaint.needWhen'));
    if (!d.state) return fail(t('complaint.needState'));
    if (!d.district) return fail(t('complaint.needDistrict'));
    if (!d.where) return fail(t('complaint.needWhere'));
    if (!d.details || d.details.length < 200 || BLOCKED.test(d.details)) return fail(t('complaint.needDetails'));
    saveSession({ anonDraft: d });
    return true;
  }

  function filed(route) {
    var ack = route.q.ack;
    var rec = NCRP.findByAck(ack);
    if (!rec) { go('#/track'); return; }
    page(route, [
      { href: '#/', label: t('chrome.crumbHome') },
      { label: t('filed.title') }
    ],
      '<div class="ack-hero">' +
        '<div class="print-head">' +
          '<div><div class="ph-title">' + t('filed.title') + '</div>' +
          '<div class="ph-ref">' + esc(rec.ack) + '</div>' +
          '<div class="ph-meta">' + t('filed.ackHint') + '<br>' +
            t('status.filedAt') + ' <b>' + esc(NCRP.formatStamp(rec.filedAt)) + '</b> · ' +
            t('status.complainant') + ' <b>' + esc(rec.complainant) + '</b></div></div>' +
          '<div class="ph-qr" aria-hidden="true"></div>' +
          '<div class="ph-valid">' + t('filed.smsNote') + '</div>' +
        '</div>' +
        '<p style="margin-top:16px">' + t('filed.lede') + '</p>' +
        '<div class="actions-row">' +
          '<a class="btn" href="#/track">' + t('filed.trackCta') + '</a>' +
          '<a class="btn ghost" href="#/">' + t('filed.homeCta') + '</a>' +
        '</div>' +
      '</div>',
      { narrow: true });
  }

  function anonFiled(route) {
    var ref = route.q.ref;
    var rec = NCRP.findByAck(ref);
    page(route, [
      { href: '#/', label: t('chrome.crumbHome') },
      { label: t('anonFiled.title') }
    ],
      '<div class="ack-hero">' +
        '<h1>' + t('anonFiled.title') + '</h1>' +
        '<p class="hi-line" style="margin-top:8px">' + t('anonFiled.lede') + '</p>' +
        '<div class="print-head" style="margin-top:18px">' +
          '<div><div class="ph-title">' + t('anonFiled.refLabel') + '</div>' +
          '<div class="ph-ref">' + esc(ref) + '</div>' +
          '<div class="ph-meta">' + t('anonFiled.categoryLabel') + ': <b>' +
            esc(rec ? rec.categoryLabel : '') + '</b></div></div>' +
          '<div class="ph-qr" aria-hidden="true"></div>' +
          '<div class="ph-valid">' + t('anonFiled.boundary') + '</div>' +
        '</div>' +
        '<div class="boundary-note">' + t('anonFiled.boundary') + '</div>' +
        '<div class="actions-row"><a class="btn" href="#/">' + t('anonFiled.homeCta') + '</a></div>' +
      '</div>',
      { narrow: true });
  }

  function track(route) {
    page(route, [
      { href: '#/', label: t('chrome.crumbHome') },
      { key: 'track.title' }
    ],
      '<h1>' + p('track.title') + '</h1>' +
      '<p class="hi-line">' + p('track.lede') + '</p>' +
      '<div class="panel" style="margin-top:18px;max-width:540px">' +
        '<div class="field"><label>' + t('track.ack') + '</label>' +
          '<input id="ackIn" inputmode="numeric" placeholder="' + t('track.ackPh') + '"></div>' +
        '<div class="field"><label>' + t('track.mobile') + '</label>' +
          '<input id="mobIn" inputmode="numeric" maxlength="10"></div>' +
        '<div class="actions-row" style="margin-top:14px">' +
          '<button class="btn" type="button" id="getOtp">' + t('track.getOtp') + '</button></div>' +
        '<div class="otp-row" id="otpRow">' + otpInputs() +
          '<button class="btn ghost" type="button" data-fill-otp style="padding:10px 14px;font-size:13.5px">Use the SMS code</button></div>' +
        '<p class="error" id="trErr" hidden></p>' +
        '<div class="actions-row" style="margin-top:14px">' +
          '<button class="btn big" type="button" data-verify-otp disabled>' + t('track.submit') + '</button></div>' +
        '<p style="margin-top:18px;font-size:13px;color:var(--muted)">Mock ledger in this prototype: 25082026000147 · 27082026000101 · 18082026000109 · 15082026000112 · REF-260826-0413</p>' +
      '</div>',
      { narrow: true });
    var otp = wireOtp(document.getElementById('main'));
    document.getElementById('getOtp').addEventListener('click', function () {
      var ack = document.getElementById('ackIn').value.trim();
      var mob = digits(document.getElementById('mobIn').value);
      var err = document.getElementById('trErr');
      if (!ack) { showErr(err, t('track.needAck')); return; }
      var rec = NCRP.findByAck(ack);
      if (!rec) { showErr(err, t('track.noRecord')); return; }
      if (rec.boundary === 'CONFIRMATION_ONLY') { showErr(err, t('track.anonBoundary')); return; }
      if (mob.length !== 10) { showErr(err, t('track.needMobile')); return; }
      if (rec.mobile && rec.mobile !== mob) { showErr(err, t('track.mobileMismatch')); return; }
      err.hidden = true;
      sendTrackOtp(mob, ack);
      otp.row.classList.add('show');
      otp.inputs[0].focus();
    });
    document.querySelector('[data-verify-otp]').addEventListener('click', function () {
      var ack = document.getElementById('ackIn').value.trim();
      var err = document.getElementById('trErr');
      var last = session().lastOtp;
      if (!last || last.purpose !== 'track' || last.ack !== ack) { showErr(err, t('login.otpMissing')); return; }
      if (otp.value() !== last.code) { showErr(err, t('track.otpWrong')); return; }
      saveSession({ viewedAck: ack });
      go('#/status?ack=' + encodeURIComponent(ack));
    });
  }

  function status(route) {
    var ack = route.q.ack || session().viewedAck;
    var rec = NCRP.findByAck(ack);
    if (!rec) { go('#/track'); return; }
    if (rec.boundary === 'CONFIRMATION_ONLY') {
      page(route, [{ href: '#/', label: t('chrome.crumbHome') }, { label: t('track.title') }],
        '<div class="boundary-note">' + t('track.anonBoundary') + '</div>' +
        '<div class="actions-row"><a class="btn" href="#/track">' + t('track.title') + '</a></div>',
        { narrow: true });
      return;
    }
    saveSession({ viewedAck: rec.ack });
    var now = NCRP.store.now;
    var day = NCRP.dayIndex(rec.filedAt, now);
    var elapsedFrom = rec.theftAt || rec.filedAt;
    var elapsed = NCRP.clockDiff(elapsedFrom, now);
    var cons = NCRP.conservation(rec);
    var meta = 'ACK ' + rec.ack + ' · DAY ' + day + ' · THU 27 AUG 09:48';

    var money = '';
    if (rec.split) {
      money = '<section class="blk"><div class="sec-h"><h2>' + p('status.moneyTitle') + '</h2></div>' +
        '<div class="money-strip">' +
          stat('s-held', 'status.held', rec.split.held) +
          stat('s-pend', 'status.requested', rec.split.requested) +
          stat('s-unloc', 'status.unlocated', rec.split.unlocated) +
          stat('s-ret', 'status.returned', rec.split.returned) +
        '</div>' +
        '<p class="strip-note">' + p('status.conservation') + ': <span class="tnum">' +
          NCRP.inr(rec.split.held) + ' + ' + NCRP.inr(rec.split.requested) + ' + ' + NCRP.inr(rec.split.unlocated) +
          (rec.split.returned ? ' + ' + NCRP.inr(rec.split.returned) : '') +
          ' = ' + NCRP.inr(cons.sum) +
          '</span>' +
          (cons.ok ? '' : ' · mismatch') +
          (rec.split.leak ? ' · ' + p('status.leakNote') : '') +
        '</p></section>';
    }

    var holds = '';
    if (rec.holds) {
      holds = '<section class="blk"><h2>' + 'Two holds — states do not merge' + '</h2><div class="holds-grid">' +
        rec.holds.map(function (h) {
          var released = h.state === 'HOLD_RELEASED';
          return '<article class="hold-card ' + (released ? 'released' : 'standing') + '">' +
            '<h3>Hold ' + esc(h.id) + ' · ' + (released ? 'released' : 'still standing') + '</h3>' +
            '<div class="amt tnum">' + NCRP.inr(h.amount) + '</div>' +
            '<div class="meta" style="margin-top:8px"><span class="code-chip">' + h.state + '</span>' +
            (h.slip ? ' <span class="code-chip">' + esc(h.slip) + '</span>' : '') + '</div>' +
            '<p>' + esc(h.note) + '</p>' +
            (released
              ? '<span class="clk clk-done">released ' + esc(NCRP.formatStamp(h.releasedAt)) + '</span>'
              : '<span class="clk clk-age">AGE · ' + esc(NCRP.clockDiff(h.placedAt, now)) + '</span>') +
            '</article>';
        }).join('') + '</div></section>';
    }

    var flags = '';
    var inst = (rec.institutions || []).filter(function (i) { return i.flags; })[0];
    if (inst) {
      flags = '<section class="blk"><h2>' + t('status.flags') + '</h2><div class="flags-card">' +
        flagRow(t('status.flagHold'), t('status.flagHoldHi'), inst.flags.amountHold.on, 'ON · ' + NCRP.inr(inst.flags.amountHold.amount), inst.flags.amountHold.since) +
        flagRow(t('status.flagDigital'), t('status.flagDigitalHi'), inst.flags.digitalBanking.on, 'ON', inst.flags.digitalBanking.since) +
        flagRow(t('status.flagSeizure'), t('status.flagSeizureHi'), false, 'NONE', null) +
        '</div></section>';
    }

    var gated = '';
    if (rec.closeGated && !rec.citizenConfirmedAt) {
      gated = '<div class="needs" style="margin-top:22px"><div class="top"><div><h3>' + t('status.closeGated') + '</h3></div>' +
        '<span class="clk clk-target">TARGET · OURS [PROPOSED]</span></div>' +
        '<div class="actions-row"><button class="btn big" type="button" id="confirmRet">' + t('status.confirmReturn') + '</button></div></div>';
    } else if (rec.citizenConfirmedAt) {
      gated = '<p class="extract-ok show" style="display:flex;margin-top:18px">' + t('status.confirmedReturn') + '</p>';
    }

    var events = (rec.events || []);
    var conf = events.filter(function (e) { return e.band !== 'reconstructed'; });
    var recn = events.filter(function (e) { return e.band === 'reconstructed'; });

    page(route, [
      { href: '#/', label: t('chrome.crumbHome') },
      { href: '#/track', label: t('chrome.navTrack') },
      { label: rec.ack }
    ],
      '<p class="dateline">' + t('status.category') + ': ' + esc(rec.categoryLabel) + ' · ' +
        t('status.complainant') + ' ' + esc(rec.complainant || '—') + '</p>' +
      '<h1>' + p('status.title') + '</h1>' +
      '<p class="hi-line">' + p('status.day', { n: day }) + '</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">' +
        '<span class="clk">ELAPSED · ' + esc(elapsed) + ' ' + p('status.sinceTheft') + '</span>' +
        (rec.lastConfirmedAt ? '<span class="clk clk-age">AGE · ' + esc(NCRP.clockDiff(rec.lastConfirmedAt, now)) + '</span>' : '') +
        deadlineChips(rec, now) +
      '</div>' +
      money + holds + flags + gated +
      eventBand(t('status.events'), conf, false) +
      (recn.length ? eventBand(t('status.reconstructed'), recn, true) : '') +
      '<p class="colophon">' + t('status.nothingElse') + '</p>',
      { meta: meta });

    var btn = document.getElementById('confirmRet');
    if (btn) {
      btn.addEventListener('click', function () {
        NCRP.confirmReturn(rec.ack, NCRP.store.now);
        render();
      });
    }
  }
  function stat(cls, key, paise) {
    return '<div class="stat ' + cls + '"><div class="lbl"><i></i>' + p(key) + '</div>' +
      '<div class="amt tnum">' + NCRP.inr(paise || 0) + '</div></div>';
  }
  function flagRow(en, hi, on, pill, since) {
    return '<div class="flagrow"><div class="name">' + esc(en) + '<small>' + esc(hi) + '</small></div>' +
      '<span class="st-pill ' + (on ? 'st-on' : 'st-off') + '">' + esc(pill) + '</span>' +
      '<p class="meaning"></p>' +
      '<span class="since">' + (since ? t('common.since') + ' ' + esc(NCRP.formatStamp(since)) : '—') + '</span></div>';
  }
  function deadlineChips(rec, now) {
    return (rec.deadlines || []).map(function (d) {
      var left = Date.parse(d.dueAt) - Date.parse(now);
      if (d.met) return '<span class="clk clk-done">DEADLINE met · ' + esc(d.citation) + '</span>';
      var label = left < 0 ? 'lapsed' : NCRP.clockDiff(now, d.dueAt) + ' left';
      return '<span class="clk clk-deadline">DEADLINE · ' + esc(label) + ' · ' + esc(d.citation) + '</span>';
    }).join('');
  }
  function eventBand(title, events, reconstructed) {
    if (!events.length) return '';
    return '<section class="blk"><div class="sec-h"><h2>' + esc(title) + '</h2></div>' +
      '<div class="band' + (reconstructed ? ' reconstructed' : '') + '">' +
      events.map(function (e) {
        var prov = e.provenance === 'ASSUMPTION' ? '<span class="prov prov-a">[ASSUMPTION]</span>'
          : e.provenance === 'PROPOSED' ? '<span class="prov prov-p">[PROPOSED]</span>'
          : '<span class="prov prov-p">CONFIRMED</span>';
        return '<article class="ev"><span class="t">' + esc(NCRP.formatWhenShort(e.at)) + '</span>' +
          '<div class="body"><p class="p">' + esc(e.text) + '</p>' +
          '<div class="meta"><span class="author-chip">● ' + esc(e.author) + '</span>' +
          '<span class="code-chip">' + esc(e.code) + '</span>' + prov + '</div></div></article>';
      }).join('') + '</div></section>';
  }

  function register(route) {
    page(route, [
      { href: '#/', label: t('chrome.crumbHome') },
      { label: t('chrome.navRegister') }
    ],
      '<h1>' + t('chrome.navRegister') + '</h1>' +
      '<p class="hi-line">' + t('home.lede') + '</p>' +
      '<section class="track-grid">' +
        '<article class="track-card wc"><h2>' + t('home.cardWcTitle') + '</h2><p>' + t('home.cardWcBody') + '</p>' +
          '<div class="ctas"><a class="btn ghost" href="#/acknowledge?track=anonymous">' + t('home.cardWcAnon') + '</a>' +
          '<a class="btn" href="#/acknowledge?track=wc">' + t('home.cardWcTrack') + '</a></div></article>' +
        '<article class="track-card"><h2>' + t('home.cardFinTitle') + '</h2><p>' + t('home.cardFinBody') + '</p>' +
          '<div class="ctas"><a class="btn" href="#/acknowledge?track=financial">' + t('home.cardFinCta') + '</a></div></article>' +
        '<article class="track-card"><h2>' + t('home.cardOtherTitle') + '</h2><p>' + t('home.cardOtherBody') + '</p>' +
          '<div class="ctas"><a class="btn" href="#/acknowledge?track=other">' + t('home.cardOtherCta') + '</a></div></article>' +
      '</section>');
  }

  function stub(route, titleKey, bodyKey, extra) {
    page(route, [
      { href: '#/', label: t('chrome.crumbHome') },
      { label: t(titleKey) }
    ],
      '<article class="stub-page"><h1>' + t(titleKey) + '</h1><p>' + t(bodyKey) + '</p>' + (extra || '') + '</article>',
      { narrow: true });
  }
  function learnIndex(route) {
    page(route, [{ href: '#/', label: t('chrome.crumbHome') }, { label: t('learn.title') }],
      '<h1>' + t('learn.title') + '</h1><p class="hi-line">' + t('learn.lede') + '</p>' +
      '<div class="learn-grid" style="margin-top:22px">' +
        learnTile('manual', 'home.learnManual', 'home.learnManualBody') +
        learnTile('safety', 'home.learnSafety', 'home.learnSafetyBody') +
        learnTile('awareness', 'home.learnAwareness', 'home.learnAwarenessBody') +
        learnTile('digest', 'home.learnDigest', 'home.learnDigestBody') +
      '</div>');
  }
  function learnNote(route, titleKey, bodyKey) {
    page(route, [
      { href: '#/', label: t('chrome.crumbHome') },
      { href: '#/learn', label: t('learn.title') },
      { label: t(titleKey) }
    ],
      '<article class="stub-page"><h1>' + t(titleKey) + '</h1><p>' + t(bodyKey) + '</p>' +
        '<p style="margin-top:18px"><a class="link" href="#/learn">← ' + t('learn.title') + '</a></p></article>',
      { narrow: true });
  }
  function faq(route) {
    page(route, [{ href: '#/', label: t('chrome.crumbHome') }, { label: t('faq.title') }],
      '<article class="stub-page"><h1>' + t('faq.title') + '</h1><p>' + t('faq.lede') + '</p>' +
        '<div class="faq-list">' +
          '<div><h2>' + t('faq.q1') + '</h2><p>' + t('faq.a1') + '</p></div>' +
          '<div><h2>' + t('faq.q2') + '</h2><p>' + t('faq.a2') + '</p></div>' +
          '<div><h2>' + t('faq.q3') + '</h2><p>' + t('faq.a3') + '</p></div>' +
          '<div><h2>' + t('faq.q4') + '</h2><p>' + t('faq.a4') + '</p></div>' +
          '<div><h2>' + t('faq.q5') + '</h2><p>' + t('faq.a5') + '</p></div>' +
        '</div></article>',
      { narrow: true });
  }

  function hideToast() {
    var el = document.getElementById('toast');
    if (el) el.hidden = true;
  }

  function render() {
    applyFont();
    hideToast();
    var route = parseRoute();
    var p = route.path;
    if (p === '/') return home(route);
    if (p === '/acknowledge') return acknowledge(route);
    if (p === '/login') return login(route);
    if (p === '/checklist') return checklist(route);
    if (p === '/complaint') return complaint(route);
    if (p === '/anonymous') return anonymous(route);
    if (p === '/filed') return filed(route);
    if (p === '/anonymous-filed') return anonFiled(route);
    if (p === '/track') return track(route);
    if (p === '/status') return status(route);
    if (p === '/register') return register(route);
    if (p === '/suspect') return stub(route, 'suspect.title', 'suspect.lede',
      '<p>' + t('suspect.body') + '</p><p style="margin-top:16px"><a class="btn" href="#/register">' + t('suspect.cta') + '</a></p>');
    if (p === '/learn') return learnIndex(route);
    if (p === '/learn/manual') return learnNote(route, 'learn.manualTitle', 'learn.manualBody');
    if (p === '/learn/safety') return learnNote(route, 'learn.safetyTitle', 'learn.safetyBody');
    if (p === '/learn/awareness') return learnNote(route, 'learn.awarenessTitle', 'learn.awarenessBody');
    if (p === '/learn/digest') return learnNote(route, 'learn.digestTitle', 'learn.digestBody');
    if (p === '/faq') return faq(route);
    if (p === '/contact') return stub(route, 'stubs.contactTitle', 'stubs.contactBody');
    if (p === '/feedback') return stub(route, 'stubs.feedbackTitle', 'stubs.feedbackBody');
    if (p === '/policies') return stub(route, 'stubs.policiesTitle', 'stubs.policiesBody');
    if (p === '/privacy') return stub(route, 'stubs.privacyTitle', 'stubs.privacyBody');
    if (p === '/disclaimer') return stub(route, 'stubs.disclaimerTitle', 'stubs.disclaimerBody');
    if (p === '/accessibility') return stub(route, 'stubs.a11yTitle', 'stubs.a11yBody');
    go('#/');
  }

  window.addEventListener('hashchange', render);

  Promise.all([NCRP.loadStrings(), NCRP.loadLedger()]).then(function () {
    applyFont();
    if (!location.hash) location.hash = '#/';
    else render();
  }).catch(function (err) {
    document.getElementById('portal').innerHTML =
      '<div class="boot-fail"><h1>Could not load the portal.</h1><p>Serve this folder over HTTP so <code>data/strings.en.json</code> and <code>data/ledger.json</code> can be fetched. ' +
      esc(err.message) + '</p></div>';
  });
})();
