/* ============================================================
   OAP "See how it works" interactive demo
   Self-contained, fully scripted sandbox. No real engine, no
   network calls to any OSINT source, no real file downloads.
   Isolated from js/main.js so nothing collides.
   ============================================================ */
(function () {
  'use strict';

  // ---------------------------------------------------------
  // LEAD CAPTURE ENDPOINT
  // Dedicated Formspree form for demo signups. Swap this value to
  // change where leads are delivered without touching anything else.
  // ---------------------------------------------------------
  var LEAD_ENDPOINT = 'https://formspree.io/f/mqeolajp';

  var SS_FLAG = 'oap.demo.unlocked';   // session-scoped: unlocked THIS visit
  var LS_LEAD = 'oap.demo.lead';       // persisted: remembered lead (prefill)

  // The real OSINT App Platform logo, shown in a glowing green ring just like
  // the desktop app (gate, lock, login, in-app header).
  var LOGO_SRC = 'assets/brand/osint_logo.png';
  function logoRing(cls) {
    return '<div class="logo-ring ' + (cls || '') + '"><img src="' + LOGO_SRC +
      '" alt="OSINT App Platform logo" /></div>';
  }

  var frame = document.getElementById('demo-frame');
  if (!frame) return;

  // Bring the sandbox top into view so contained overlays (modals, lightbox,
  // info) are never hidden above the fold when the page is scrolled down.
  function scrollFrameIntoView() {
    try {
      var top = frame.getBoundingClientRect().top + window.pageYOffset - 110;
      if (window.pageYOffset > top + 8) {
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    } catch (e) {}
  }

  // App-wide state
  var state = {
    lead: null,
    caseSaved: false,
    collectionDone: false,
    analysisDone: false,
    investigateUnlocked: false,
    activeTab: 'setup'
  };

  // ============================================================
  // Small helpers
  // ============================================================
  function el(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function clear() { frame.innerHTML = ''; }
  var store = (window.oapStore || { local: { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} }, session: { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} } });
  function getLead() {
    try { return JSON.parse(store.local.getItem(LS_LEAD) || 'null'); } catch (e) { return null; }
  }
  function saveLead(lead) {
    try { store.local.setItem(LS_LEAD, JSON.stringify(lead)); } catch (e) {}
  }
  function markUnlocked() { try { store.session.setItem(SS_FLAG, '1'); } catch (e) {} }
  function isUnlocked() { try { return store.session.getItem(SS_FLAG) === '1'; } catch (e) { return false; } }

  function toast(msg) {
    var host = frame.querySelector('.toast-host');
    if (!host) { host = el('<div class="toast-host"></div>'); frame.appendChild(host); }
    var t = el('<div class="toast"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg><span>' + msg + '</span></div>');
    host.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; t.style.transition = 'opacity 0.4s ease'; }, 2200);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 2700);
  }

  function svg(paths, vb) {
    return '<svg viewBox="' + (vb || '0 0 24 24') + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>';
  }
  var ICON = {
    lock: '<path d="M5 11h14v10H5z"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    shield: '<path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    collect: '<path d="M21 12a9 9 0 1 1-9-9"/><path d="M21 3v6h-6"/>',
    report: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/>',
    graph: '<circle cx="6" cy="6" r="2.4"/><circle cx="18" cy="9" r="2.4"/><circle cx="9" cy="18" r="2.4"/><path d="M8 7l8 1M8 8l1 8"/>',
    monitor: '<path d="M3 12h4l2 6 4-14 2 8h6"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.7 1.25V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 7.5 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3.1 14.5a1.65 1.65 0 0 0-1.51-1H1.5a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 3.1 8.5a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.5 3.1h.09A2 2 0 1 1 12.6 3.1h-.09A1.65 1.65 0 0 0 13.5 4.6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
    dash: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    fit: '<path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
    restart: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    db: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    cloud: '<path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 1.5A3.5 3.5 0 0 0 6.5 19z"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>'
  };

  // ============================================================
  // CASE + REPORT + GRAPH DATA (fake but internally consistent)
  // ============================================================
  var CASE = {
    name: 'Vendor Risk - Northwind Logistics',
    code: 'CASE-2026-0418',
    requirement: 'Assess the ownership, regulatory standing, and reputational risk of Northwind Logistics LLC ahead of a proposed supplier contract. Identify beneficial owners, any litigation or enforcement actions, and material adverse media over the last 5 years. Establish how each finding ties back to the contracting decision.',
    reportType: 'Due-diligence brief',
    depth: 'Standard',
    sources: [
      'Public records & court filings',
      'Corporate registries',
      'News & media',
      'Sanctions & watchlists',
      'Domain & infrastructure',
      'Social & web presence'
    ]
  };

  // OSINT source TYPES only (never internal AI providers)
  var SOURCE_TYPES = {
    court: 'Court record', registry: 'Corporate registry', news: 'News & media',
    sanctions: 'Sanctions list', domain: 'Domain / WHOIS', social: 'Social / web',
    regfiling: 'Regulatory filing', press: 'Press release', biz: 'Business directory'
  };

  // ============================================================
  // RENDERERS for each gate / screen
  // ============================================================

  // ---- 0. Lead gate ----
  function renderLead() {
    state.activeTab = 'lead';
    clear();
    var lead = getLead() || { name: '', email: '', org: '' };
    var card = el(
      '<div class="gate">' +
        '<div class="gate-card gate-card--wide">' +
          logoRing('gate-ring') +
          '<span class="gate-eyebrow">Interactive demo</span>' +
          '<h2>See the OSINT App Platform in action.</h2>' +
          '<p>This is a guided, interactive demo with realistic sample data. Nothing here touches live sources and no real files are produced. Tell us where to send a follow-up and we will launch it.</p>' +
          '<form id="lead-form" novalidate>' +
            '<div class="gate-field"><label for="ld-name">Name</label><input id="ld-name" name="name" type="text" required autocomplete="name" placeholder="Your name" value="' + escAttr(lead.name) + '" /></div>' +
            '<div class="gate-field"><label for="ld-email">Work email</label><input id="ld-email" name="email" type="email" required autocomplete="email" placeholder="you@organization.com" value="' + escAttr(lead.email) + '" /></div>' +
            '<div class="gate-field"><label for="ld-org">Organization</label><input id="ld-org" name="organization" type="text" required autocomplete="organization" placeholder="Company or team" value="' + escAttr(lead.org) + '" /></div>' +
            '<input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true" />' +
            '<p class="gate-err" id="lead-err"></p>' +
            '<button class="dbtn dbtn--primary" type="submit">Launch the demo</button>' +
          '</form>' +
          '<p class="gate-foot">No spam, ever. We use your email only to follow up about the platform.</p>' +
        '</div>' +
      '</div>'
    );
    frame.appendChild(card);
    var form = card.querySelector('#lead-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var org = form.organization.value.trim();
      var err = card.querySelector('#lead-err');
      if (!name || !email || !org) { err.textContent = 'Please complete all three fields.'; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'Please enter a valid email address.'; return; }
      err.textContent = '';
      state.lead = { name: name, email: email, org: org };
      saveLead(state.lead);
      markUnlocked();
      fireLead(form); // fire-and-forget; never blocks
      renderPassphrase();
    });
  }

  function fireLead(form) {
    try {
      var fd = new FormData(form);
      fd.append('source', 'demo');
      fd.append('page', 'see-how-it-works');
      fd.append('_subject', 'New OAP demo signup');
      // Fire-and-forget. We never block or surface failures: the demo
      // unlocks regardless of whether the POST succeeds.
      fetch(LEAD_ENDPOINT, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
        .catch(function () {});
    } catch (e) {}
  }

  // ---- 1. Passphrase gate ----
  function renderPassphrase() {
    clear();
    var card = el(
      '<div class="gate">' +
        '<div class="gate-card">' +
          logoRing('gate-ring') +
          '<span class="gate-eyebrow">Master database</span>' +
          '<h2>Unlock your case database</h2>' +
          '<p>Your cases are stored encrypted on your machine, behind a passphrase only you hold. Enter it to open the workspace.</p>' +
          '<div class="gate-hint">For this demo, enter the passphrase: <b>Welcome</b></div>' +
          '<form id="pp-form">' +
            '<div class="gate-field"><label for="pp">Passphrase</label><input id="pp" type="password" autocomplete="off" placeholder="Enter passphrase" /></div>' +
            '<p class="gate-err" id="pp-err"></p>' +
            '<button class="dbtn dbtn--primary" type="submit">Unlock</button>' +
          '</form>' +
        '</div>' +
      '</div>'
    );
    frame.appendChild(card);
    var form = card.querySelector('#pp-form');
    var input = card.querySelector('#pp');
    input.focus();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = card.querySelector('#pp-err');
      if (input.value.trim() === 'Welcome') { renderAcknowledge(); }
      else {
        err.textContent = 'That is not the demo passphrase. Type: Welcome';
        card.querySelector('.gate-card').classList.remove('shake');
        void card.querySelector('.gate-card').offsetWidth;
        card.querySelector('.gate-card').classList.add('shake');
        input.select();
      }
    });
  }

  // ---- 2. Acknowledgment ----
  function renderAcknowledge() {
    clear();
    var card = el(
      '<div class="gate">' +
        '<div class="gate-card gate-card--wide">' +
          logoRing('gate-ring') +
          '<span class="gate-eyebrow">Authorized use only</span>' +
          '<h2>Responsible-use acknowledgment</h2>' +
          '<p>The platform produces intelligence products meant to inform real decisions. Before you continue, please acknowledge the following.</p>' +
          '<ul class="ack-list">' +
            '<li>' + svg(ICON.check) + '<span>I will use the platform only for lawful, authorized purposes within my role.</span></li>' +
            '<li>' + svg(ICON.check) + '<span>I understand findings are analytic judgments to be weighed, not automatic conclusions.</span></li>' +
            '<li>' + svg(ICON.check) + '<span>This session uses fabricated sample data for demonstration. It does not describe any real organization.</span></li>' +
          '</ul>' +
          '<label class="ack-check"><input type="checkbox" id="ack-cb" /> I understand and agree.</label>' +
          '<button class="dbtn dbtn--primary" id="ack-btn" disabled>Acknowledge and continue</button>' +
        '</div>' +
      '</div>'
    );
    frame.appendChild(card);
    var cb = card.querySelector('#ack-cb');
    var btn = card.querySelector('#ack-btn');
    cb.addEventListener('change', function () { btn.disabled = !cb.checked; });
    btn.addEventListener('click', function () { if (!btn.disabled) renderLogin(); });
  }

  // ---- 3. Login ----
  function renderLogin() {
    clear();
    var card = el(
      '<div class="gate">' +
        '<div class="gate-card">' +
          logoRing('gate-ring') +
          '<span class="gate-eyebrow">Sign in</span>' +
          '<h2>Welcome back</h2>' +
          '<p>Sign in to open the workspace.</p>' +
          '<div class="gate-hint">Demo credentials: <b>user123</b> / <b>OAP_is_Awesome</b></div>' +
          '<form id="lg-form">' +
            '<div class="gate-field"><label for="lg-u">Username</label><input id="lg-u" type="text" autocomplete="off" placeholder="Username" /></div>' +
            '<div class="gate-field"><label for="lg-p">Password</label><input id="lg-p" type="password" autocomplete="off" placeholder="Password" /></div>' +
            '<p class="gate-err" id="lg-err"></p>' +
            '<button class="dbtn dbtn--primary" type="submit">Sign in</button>' +
          '</form>' +
        '</div>' +
      '</div>'
    );
    frame.appendChild(card);
    var form = card.querySelector('#lg-form');
    form.querySelector('#lg-u').focus();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var u = form.querySelector('#lg-u').value.trim();
      var p = form.querySelector('#lg-p').value;
      var err = card.querySelector('#lg-err');
      if (u === 'user123' && p === 'OAP_is_Awesome') { renderShell('setup'); }
      else {
        err.textContent = 'Incorrect username or password. Check the demo credentials above.';
        card.querySelector('.gate-card').classList.remove('shake');
        void card.querySelector('.gate-card').offsetWidth;
        card.querySelector('.gate-card').classList.add('shake');
      }
    });
  }

  function escAttr(s) { return String(s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  // ============================================================
  // PLATFORM SHELL
  // ============================================================
  var NAV = [
    { id: 'dash', label: 'Dashboard', icon: ICON.dash, group: 'Workspace', kind: 'disabled', desc: 'Dashboard: an at-a-glance view of every case, recent activity, and alerts.' },
    { id: 'setup', label: 'Case Setup', icon: ICON.folder, group: 'Workspace', kind: 'seq' },
    { id: 'collection', label: 'Collection', icon: ICON.collect, group: 'Workspace', kind: 'seq' },
    { id: 'analysis', label: 'Analysis', icon: ICON.report, group: 'Workspace', kind: 'seq' },
    { id: 'investigate', label: 'Investigate', icon: ICON.graph, group: 'Workspace', kind: 'seq' },
    { id: 'monitoring', label: 'Monitoring', icon: ICON.monitor, group: 'System', kind: 'disabled', desc: 'Monitoring: standing watches that re-run a case on a schedule and alert on change.' },
    { id: 'settings', label: 'Settings', icon: ICON.settings, group: 'System', kind: 'disabled', desc: 'Settings: manage your sources, preferences, and storage.' }
  ];

  function tabUnlocked(id) {
    if (id === 'setup') return true;
    if (id === 'collection') return state.caseSaved;
    if (id === 'analysis') return state.collectionDone;
    if (id === 'investigate') return state.investigateUnlocked;
    return false;
  }

  function renderShell(tab) {
    state.activeTab = tab;
    clear();
    var initials = (state.lead && state.lead.name ? state.lead.name.trim()[0] : 'U').toUpperCase();
    var shell = el('<div class="shell"></div>');

    // Left nav
    var nav = el('<aside class="shell-nav"></aside>');
    nav.appendChild(el(
      '<div class="shell-brand">' + logoRing('') +
      '<div><div class="nm">OSINT App Platform<sup style="font-size:7px;font-weight:600;vertical-align:super;margin-left:1px;">TM</sup></div><div class="sub">by OAP Software &amp; Development</div></div></div>'
    ));
    var groups = ['Workspace', 'System'];
    groups.forEach(function (g) {
      nav.appendChild(el('<div class="nav-group-label">' + g + '</div>'));
      NAV.filter(function (n) { return n.group === g; }).forEach(function (n) {
        var item = buildNavItem(n, tab);
        nav.appendChild(item);
      });
    });
    nav.appendChild(el('<div class="nav-spacer"></div>'));
    var info = el('<button class="nav-item">' + svg(ICON.info) + '<span>Info</span></button>');
    info.addEventListener('click', renderInfoOverlay);
    nav.appendChild(info);

    // Main column
    var main = el('<div class="shell-main"></div>');
    var top = el(
      '<div class="topbar">' +
        '<div><div class="case-name">' + esc(CASE.name) + '</div><div class="case-sub">' + CASE.code + ' &middot; ' + CASE.reportType + '</div></div>' +
        '<span class="demo-pill">Demo</span>' +
        '<div class="topbar-right">' +
          '<button class="link-btn" id="tb-info">Info</button>' +
          '<button class="link-btn" id="tb-restart">' + restartIco() + ' Restart demo</button>' +
          '<div class="user-chip"><span class="avatar">' + initials + '</span><span>user123</span></div>' +
        '</div>' +
      '</div>'
    );
    var stage = el('<div class="stage" id="stage"></div>');
    main.appendChild(top);
    main.appendChild(stage);

    shell.appendChild(nav);
    shell.appendChild(main);
    frame.appendChild(shell);

    top.querySelector('#tb-info').addEventListener('click', renderInfoOverlay);
    top.querySelector('#tb-restart').addEventListener('click', restartDemo);

    renderStage(tab);
  }

  function restartIco() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;display:inline;vertical-align:-2px;margin-right:3px">' + ICON.restart + '</svg>'; }

  function buildNavItem(n, activeTab) {
    var cls = 'nav-item';
    var locked = false, disabled = false;
    if (n.kind === 'disabled') { cls += ' is-disabled'; disabled = true; }
    else if (!tabUnlocked(n.id)) { cls += ' is-locked'; locked = true; }
    if (n.id === activeTab) cls += ' is-active';
    var lockIco = (locked || disabled) ? '<span class="lock-ico">' + svg(ICON.lock) + '</span>' : '';
    var item = el('<button class="' + cls + '">' + svg(n.icon) + '<span>' + n.label + '</span>' + lockIco + '</button>');
    item.addEventListener('click', function () {
      if (disabled) { showDisabledPopup(n.label, n.desc); return; }
      if (locked) { showLockedPopup(n.label); return; }
      renderShell(n.id);
    });
    return item;
  }

  function showDisabledPopup(label, desc) {
    showModal(svg(ICON.lock), label, desc + ' Disabled in this demo.', [
      { label: 'Got it', primary: true, action: closeModal }
    ]);
  }
  function showLockedPopup(label) {
    showModal(svg(ICON.lock), label + ' is locked', 'Complete the previous step first. The workflow unlocks ' + label + ' once the prior stage finishes.', [
      { label: 'Got it', primary: true, action: closeModal }
    ]);
  }

  function restartDemo() {
    state.caseSaved = false; state.collectionDone = false;
    state.analysisDone = false; state.investigateUnlocked = false;
    if (cy) { try { cy.destroy(); } catch (e) {} cy = null; }
    renderShell('setup');
    toast('Demo reset to Case Setup');
  }

  // ============================================================
  // STAGE ROUTER
  // ============================================================
  function renderStage(tab) {
    var stage = frame.querySelector('#stage');
    if (!stage) return;
    stage.innerHTML = '';
    if (tab === 'setup') stageSetup(stage);
    else if (tab === 'collection') stageCollection(stage);
    else if (tab === 'analysis') stageAnalysis(stage);
    else if (tab === 'investigate') stageInvestigate(stage);
  }

  // ---- 5. Case Setup ----
  function stageSetup(stage) {
    var srcChecks = CASE.sources.map(function (s, i) {
      var on = i !== 5 ? 'on' : 'on'; // all pre-checked
      return '<label class="src-toggle ' + on + '"><input type="checkbox" checked /> <span>' + esc(s) + '</span></label>';
    }).join('');

    var head = el(
      '<div class="stage-head"><span class="eyebrow-a">Step 1 of 4 &middot; Case Setup</span>' +
      '<h2>Define the case and its requirement</h2>' +
      '<p>Everything downstream is governed by this requirement. Nothing is collected without it. Review the prefilled case and save to begin collection.</p></div>'
    );
    var grid = el('<div class="case-grid"></div>');
    var left = el(
      '<div class="case-panel">' +
        '<h3>Case details</h3>' +
        '<div class="df"><label for="cs-name">Case name</label><input id="cs-name" type="text" value="' + escAttr(CASE.name) + '" /></div>' +
        '<div class="df"><label for="cs-req">Intelligence requirement (IROC) <span class="sub">- what this case must answer</span></label>' +
          '<textarea id="cs-req" rows="5">' + esc(CASE.requirement) + '</textarea></div>' +
        '<div class="df-row">' +
          '<div class="df"><label for="cs-type">Report type</label><select id="cs-type">' +
            '<option selected>Due-diligence brief</option><option>Entity profile</option><option>Threat assessment</option><option>Network map</option></select></div>' +
          '<div class="df"><label for="cs-depth">Depth</label><select id="cs-depth">' +
            '<option>Quick</option><option selected>Standard</option><option>Deep</option></select></div>' +
        '</div>' +
        '<div class="df"><label>Source categories <span class="sub">- realistic OSINT categories, not providers</span></label>' +
          '<div class="src-grid">' + srcChecks + '</div></div>' +
        '<div class="case-actions"><button class="dbtn dbtn--primary" id="cs-save">Save case</button>' +
          '<button class="dbtn dbtn--ghost" id="cs-reset">Reset to sample</button></div>' +
      '</div>'
    );
    var side = el(
      '<div class="case-side">' +
        '<div class="case-panel">' +
          '<h3>At a glance</h3>' +
          '<div class="meta-row"><span>Case code</span><span>' + CASE.code + '</span></div>' +
          '<div class="meta-row"><span>Report type</span><span id="sg-type">' + CASE.reportType + '</span></div>' +
          '<div class="meta-row"><span>Depth</span><span id="sg-depth">' + CASE.depth + '</span></div>' +
          '<div class="meta-row"><span>Source categories</span><span id="sg-src">6 enabled</span></div>' +
          '<div class="meta-row"><span>Status</span><span id="sg-status" style="color:var(--md)">Draft</span></div>' +
        '</div>' +
        '<div class="case-panel" style="margin-top:1rem">' +
          '<h3>What happens next</h3>' +
          '<p style="font-size:0.85rem;color:var(--t-muted);line-height:1.6">On save, the engine locks in the requirement and opens Collection. It then works each enabled category, scores every item for relevance, and only promotes what relates to the requirement.</p>' +
        '</div>' +
      '</div>'
    );
    grid.appendChild(left); grid.appendChild(side);
    stage.appendChild(head); stage.appendChild(grid);

    // source toggle visual
    left.querySelectorAll('.src-toggle input').forEach(function (cb) {
      cb.addEventListener('change', function () {
        cb.closest('.src-toggle').classList.toggle('on', cb.checked);
        var n = left.querySelectorAll('.src-toggle input:checked').length;
        side.querySelector('#sg-src').textContent = n + ' enabled';
      });
    });
    left.querySelector('#cs-type').addEventListener('change', function (e) { side.querySelector('#sg-type').textContent = e.target.value; });
    left.querySelector('#cs-depth').addEventListener('change', function (e) { side.querySelector('#sg-depth').textContent = e.target.value; });
    left.querySelector('#cs-reset').addEventListener('click', function () { renderStage('setup'); toast('Restored sample case'); });
    left.querySelector('#cs-save').addEventListener('click', function () {
      state.caseSaved = true;
      side.querySelector('#sg-status').textContent = 'Saved';
      side.querySelector('#sg-status').style.color = 'var(--grn)';
      toast('Case saved');
      setTimeout(function () { renderShell('collection'); }, 450);
    });
  }

  // ---- 6. Collection ----
  function stageCollection(stage) {
    var head = el(
      '<div class="stage-head"><span class="eyebrow-a">Step 2 of 4 &middot; Collection</span>' +
      '<h2>Collect against the requirement</h2>' +
      '<p>An adaptive, multi-pass run that tightens toward the requirement and stops when the questions are answered. Every item is scored for relevance as it arrives.</p></div>'
    );
    stage.appendChild(head);

    if (state.collectionDone) { renderCollectionComplete(stage); return; }

    var wrap = el(
      '<div class="collect-wrap">' +
        '<div class="progress-shell">' +
          '<div class="progress-top"><span class="lbl" id="cl-phase">Ready to run</span><span class="pct" id="cl-pct">0%</span></div>' +
          '<div class="progress-bar"><div class="progress-fill" id="cl-fill"></div></div>' +
        '</div>' +
        '<div class="log-panel" id="cl-log"></div>' +
      '</div>'
    );
    stage.appendChild(wrap);

    // speed-up modal first
    showModal(svg(ICON.collect), 'Heads up: this is sped up',
      'Real collections vary in length, and a deep run can take a few hours while the engine works every source carefully. For this demo we have sped it up about 150x so you can watch the whole thing.',
      [{ label: 'Start collection', primary: true, action: function () { closeModal(); runCollection(wrap); } }]
    );
  }

  var COLLECT_LINES = [
    ['00:00:01', 'Requirement parsed. 6 source categories enabled.', 'ok'],
    ['00:00:02', 'Sub-questions derived: ownership, regulatory standing, litigation, adverse media.', ''],
    ['00:00:04', 'Querying corporate registries... 4 candidate entities resolved.', 'ok'],
    ['00:00:06', 'Entity resolution: Northwind Logistics LLC confirmed; 2 affiliates linked.', ''],
    ['00:00:07', 'Court records: 2 filings matched Northwind Logistics LLC.', 'ok'],
    ['00:00:09', 'News & media: 18 articles retrieved, 7 above relevance floor.', ''],
    ['00:00:11', 'Sanctions & watchlists: no direct hits; 1 indirect association flagged.', 'warn'],
    ['00:00:12', 'Domain & infrastructure: 3 registered domains, 1 shared registrant.', ''],
    ['00:00:14', 'Beneficial ownership: 2 individuals identified across registry layers.', 'ok'],
    ['00:00:15', 'Adverse media pass 2: 1 regulatory enforcement notice surfaced.', 'warn'],
    ['00:00:17', 'Relevance scoring: 41 entities retained, 22 discarded below floor.', ''],
    ['00:00:18', 'Cross-reference loop: reconciling registry vs. court party names.', ''],
    ['00:00:20', 'Provenance check: every retained item linked to a source of record.', 'ok'],
    ['00:00:21', 'Collection converged. Requirement coverage: complete.', 'ok']
  ];

  function runCollection(wrap) {
    var log = wrap.querySelector('#cl-log');
    var fill = wrap.querySelector('#cl-fill');
    var pct = wrap.querySelector('#cl-pct');
    var phase = wrap.querySelector('#cl-phase');
    phase.textContent = 'Running collection';
    var i = 0;
    var total = COLLECT_LINES.length;
    function step() {
      if (i >= total) { finish(); return; }
      var L = COLLECT_LINES[i];
      var cls = L[2] ? L[2] : '';
      var line = el('<div class="log-line"><span class="ts">[' + L[0] + ']</span> <span class="' + cls + '">' + esc(L[1]) + '</span></div>');
      log.appendChild(line);
      log.scrollTop = log.scrollHeight;
      i++;
      var p = Math.round((i / total) * 100);
      fill.style.width = p + '%'; pct.textContent = p + '%';
      setTimeout(step, 420 + Math.random() * 280);
    }
    setTimeout(step, 300);
    function finish() {
      phase.textContent = 'Collection complete';
      state.collectionDone = true;
      var done = el(
        '<div class="done-banner">' + svg(ICON.check) +
        '<div><div class="t">Collection complete</div><div class="d">Coverage of the requirement is complete. Analysis is now unlocked.</div></div>' +
        '<button class="dbtn dbtn--primary" id="cl-go">Go to Analysis</button></div>'
      );
      wrap.appendChild(buildStatsStrip());
      wrap.appendChild(done);
      done.querySelector('#cl-go').addEventListener('click', function () { renderShell('analysis'); });
      // refresh nav lock state
      refreshNavLocks();
    }
  }

  function buildStatsStrip() {
    var stats = [
      ['214', 'Sources reviewed'], ['63', 'Evidence captured'], ['41', 'Entities found'],
      ['38', 'Relationships'], ['3', 'Loops'], ['2h 14m', 'Real-time equiv (demo 9s)']
    ];
    var strip = el('<div class="stats-strip"></div>');
    stats.forEach(function (s) {
      strip.appendChild(el('<div class="stat-cell"><div class="num">' + s[0] + '</div><div class="lab">' + s[1] + '</div></div>'));
    });
    return strip;
  }

  function renderCollectionComplete(stage) {
    var wrap = el(
      '<div class="collect-wrap">' +
        '<div class="progress-shell"><div class="progress-top"><span class="lbl">Collection complete</span><span class="pct">100%</span></div>' +
        '<div class="progress-bar"><div class="progress-fill" style="width:100%"></div></div></div>' +
      '</div>'
    );
    stage.appendChild(wrap);
    wrap.appendChild(buildStatsStrip());
    var done = el(
      '<div class="done-banner">' + svg(ICON.check) +
      '<div><div class="t">Collection complete</div><div class="d">Coverage of the requirement is complete. Analysis is unlocked.</div></div>' +
      '<button class="dbtn dbtn--primary" id="cl-go">Go to Analysis</button></div>'
    );
    wrap.appendChild(done);
    done.querySelector('#cl-go').addEventListener('click', function () { renderShell('analysis'); });
  }

  // ---- 7. Analysis ----
  function stageAnalysis(stage) {
    var head = el(
      '<div class="stage-head"><span class="eyebrow-a">Step 3 of 4 &middot; Analysis</span>' +
      '<h2>Synthesize the intelligence product</h2>' +
      '<p>Findings are correlated, confidence is scored consistently, and the report answers the requirement with an honest accounting of what remains unknown.</p></div>'
    );
    stage.appendChild(head);

    if (state.analysisDone) { renderReport(stage); return; }

    showModal(svg(ICON.report), 'Analysis runs deep too',
      'Like collection, analysis is thorough and normally takes time as the engine correlates findings and scores confidence. We have sped it up for the demo so you can see the product it writes.',
      [{ label: 'Synthesize report', primary: true, action: function () { closeModal(); runSynth(stage); } }]
    );
  }

  function runSynth(stage) {
    var synth = el(
      '<div class="synth"><div class="ring"></div><div class="step-line" id="sy-line">Correlating findings...</div></div>'
    );
    stage.appendChild(synth);
    var lines = [
      'Correlating findings across sources...',
      'Reconciling entity names and roles...',
      'Scoring confidence from reliability, corroboration, and relevance...',
      'Building key judgments and noting gaps...',
      'Writing the due-diligence brief...'
    ];
    var i = 0;
    var line = synth.querySelector('#sy-line');
    var iv = setInterval(function () {
      i++;
      if (i >= lines.length) {
        clearInterval(iv);
        state.analysisDone = true;
        stage.removeChild(synth);
        renderReport(stage);
        refreshNavLocks();
        return;
      }
      line.textContent = lines[i];
    }, 760);
  }

  // ---- the report (centerpiece) ----
  var FINDINGS = [
    { n: 1, conf: 'high', title: 'Beneficial ownership concentrates in two individuals',
      body: 'Layered corporate registry records resolve to two natural persons holding a combined majority interest through an intermediate holding entity. Both are named consistently across jurisdictions, with no nominee-director indicators.',
      srcs: ['Corporate registry', 'Corporate registry', 'Business directory'] },
    { n: 2, conf: 'med', title: 'One open commercial litigation, contract dispute',
      body: 'A single active civil filing alleges breach of a freight-forwarding agreement. The matter is unresolved and the dollar exposure is modest relative to the proposed contract. No pattern of repeat litigation was found.',
      srcs: ['Court record', 'News & media'] },
    { n: 3, conf: 'med', title: 'Regulatory enforcement notice in the carrier-safety domain',
      body: 'A regulatory body issued a corrective-action notice tied to recordkeeping, since marked addressed. This is material to operational reliability but does not indicate sanctions exposure.',
      srcs: ['Regulatory filing', 'Press release'] },
    { n: 4, conf: 'low', title: 'Indirect watchlist association, unconfirmed',
      body: 'A shared historical address links a former affiliate to an entity on a third-party watchlist. The connection is dated and unverified; it is recorded for transparency and should not be treated as a finding against Northwind Logistics LLC.',
      srcs: ['Sanctions list'] },
    { n: 5, conf: 'high', title: 'Stable digital footprint, no adverse infrastructure signals',
      body: 'Registered domains share a single legitimate registrant and consistent hosting. No spoofed look-alike domains or recently-created shell properties were observed.',
      srcs: ['Domain / WHOIS', 'Social / web'] }
  ];

  var ENTITIES = [
    ['Northwind Logistics LLC', 'Organization', 'Subject entity', 100, 9],
    ['Helena Vossberg', 'Person', 'Beneficial owner', 88, 5],
    ['Martin Croy', 'Person', 'Beneficial owner / director', 82, 4],
    ['Cascade Holdings Group', 'Organization', 'Parent holding entity', 76, 4],
    ['Northwind Freight Dispute', 'Event', 'Active litigation', 64, 3],
    ['Carrier-Safety Notice 2024', 'Event', 'Enforcement action', 61, 2],
    ['northwind-logistics.com', 'Document', 'Primary domain', 52, 2],
    ['Port City Tribune', 'Document', 'Adverse media outlet', 47, 3],
    ['Riverside County Court', 'Court', 'Filing venue', 44, 1]
  ];

  var APPENDIX = [
    ['Corporate registry', 'State business filing - Northwind Logistics LLC, articles of organization', 5, '2019-03-12'],
    ['Corporate registry', 'Foreign-entity registration - Cascade Holdings Group', 5, '2020-08-02'],
    ['Court record', 'Civil docket - Freight-forwarding breach of contract', 4, '2024-11-09'],
    ['Regulatory filing', 'Carrier-safety corrective-action notice', 4, '2024-06-21'],
    ['News & media', 'Regional coverage of the contract dispute', 3, '2025-01-18'],
    ['News & media', 'Trade-press profile of the holding group', 3, '2023-05-30'],
    ['Press release', 'Company statement on safety remediation', 2, '2024-07-04'],
    ['Domain / WHOIS', 'Registration record - northwind-logistics.com', 4, '2018-10-01'],
    ['Domain / WHOIS', 'Registration record - cascade-holdings.net', 3, '2020-09-15'],
    ['Sanctions list', 'Third-party watchlist - indirect address match', 2, '2021-02-11'],
    ['Business directory', 'Officer listing cross-reference', 3, '2024-12-02'],
    ['Social / web', 'Corporate profile and leadership pages', 3, '2025-02-20']
  ];

  var TYPE_COLORS = {
    Person: '#5b8def', Organization: '#3fb950', Event: '#e3b341', Document: '#9b8cf0',
    Location: '#e06c9f', Concept: '#6fb1d6', Account: '#58a6ff', Court: '#d98a4a', IROC: '#ffd479'
  };

  function confPill(c) {
    var map = { high: ['conf-high', 'High'], med: ['conf-med', 'Med'], low: ['conf-low', 'Low'] };
    var m = map[c];
    return '<span class="conf-pill ' + m[0] + '">' + m[1] + '</span>';
  }
  function srcTags(arr) { return arr.map(function (s) { return '<span class="src-tag">[' + esc(s) + ']</span>'; }).join(''); }
  function starStr(n) {
    var s = '';
    for (var i = 1; i <= 5; i++) s += (i <= n) ? '<span>&#9733;</span>' : '<span class="off">&#9733;</span>';
    return s;
  }

  function renderReport(stage) {
    var findingHtml = FINDINGS.map(function (f) {
      return '<div class="finding"><div class="finding-top"><span class="finding-num">Finding ' + f.n + '</span>' +
        '<h4>' + esc(f.title) + '</h4>' + confPill(f.conf) + '</div>' +
        '<p>' + esc(f.body) + '</p><div class="finding-srcs">' + srcTags(f.srcs) + '</div></div>';
    }).join('');

    var entityRows = ENTITIES.map(function (e) {
      var color = TYPE_COLORS[e[1]] || '#3fb950';
      return '<tr><td><b>' + esc(e[0]) + '</b></td>' +
        '<td><span class="type-dot" style="--c:' + color + '">' + e[1] + '</span></td>' +
        '<td>' + esc(e[2]) + '</td>' +
        '<td><span class="rel-bar"><span class="rel-track"><span class="rel-fill" style="width:' + e[3] + '%"></span></span> ' + e[3] + '%</span></td>' +
        '<td>' + e[4] + '</td></tr>';
    }).join('');

    var appxRows = APPENDIX.map(function (a) {
      return '<div class="appx-row"><span class="atype">' + esc(a[0]) + '</span>' +
        '<span class="atitle">' + esc(a[1]) + '</span>' +
        '<span class="stars">' + starStr(a[2]) + '</span>' +
        '<span class="adate">' + a[3] + '</span></div>';
    }).join('');

    var report = el(
      '<div class="report">' +
        '<div class="report-hd">' +
          '<span class="report-class">Sample / Demonstration</span>' +
          '<h2>Due-Diligence Brief: Northwind Logistics LLC</h2>' +
          '<div class="report-meta"><span><b>Case</b> ' + CASE.code + '</span><span><b>Prepared</b> 18 Apr 2026</span><span><b>Analyst</b> user123</span><span><b>Classification</b> Sample data</span></div>' +
          '<div class="report-req"><b>Requirement.</b> ' + esc(CASE.requirement) + '</div>' +
        '</div>' +
        '<div class="report-body">' +
          '<div class="rsec"><div class="rsec-title"><span class="ix">01</span> Executive summary</div>' +
            '<p>Northwind Logistics LLC presents a <b>moderate, manageable risk profile</b> for the proposed supplier contract. Ownership is transparent and concentrates in two named individuals through a single intermediate holding entity, with no nominee or shell-layer indicators (high confidence).</p>' +
            '<p>The most material items are an <b>open contract-dispute litigation</b> and a <b>resolved carrier-safety enforcement notice</b>. Both are bounded in scope: the litigation exposure is modest relative to the contract value, and the enforcement matter has been remediated. Neither indicates a pattern of misconduct (medium confidence).</p>' +
            '<p>One <b>indirect watchlist association</b> was surfaced through a dated, shared historical address. It is unverified and tied to a former affiliate, not to Northwind Logistics LLC directly; it is reported for transparency rather than treated as an adverse finding (low confidence).</p>' +
            '<p>On balance, the evidence supports <b>proceeding with the contract subject to standard contractual protections</b> and a re-check of the open litigation before signing.</p>' +
          '</div>' +
          '<div class="rsec"><div class="rsec-title"><span class="ix">02</span> Key findings</div>' + findingHtml + '</div>' +
          '<div class="rsec"><div class="rsec-title"><span class="ix">03</span> Entities</div>' +
            '<div class="rtable-wrap"><table class="rtable"><thead><tr><th>Entity</th><th>Type</th><th>Role</th><th>IROC relevance</th><th>Sources</th></tr></thead><tbody>' + entityRows + '</tbody></table></div></div>' +
          '<div class="rsec"><div class="rsec-title"><span class="ix">04</span> Assessment &amp; gaps</div>' +
            '<div class="gaps-grid">' +
              '<div class="gap-col"><h5>What is established</h5><ul class="gap-known">' +
                '<li>Beneficial ownership and the holding structure, corroborated across registries.</li>' +
                '<li>The existence, venue, and nature of the open litigation.</li>' +
                '<li>The enforcement notice and its remediation status.</li>' +
                '<li>A stable, legitimate digital footprint.</li></ul></div>' +
              '<div class="gap-col"><h5>What is unconfirmed</h5><ul class="gap-unk">' +
                '<li>Final disposition and damages of the open litigation (matter ongoing).</li>' +
                '<li>The watchlist association, which rests on a single dated address match.</li>' +
                '<li>Any undisclosed related-party agreements not visible in public records.</li>' +
                '<li>Current financial standing beyond what filings disclose.</li></ul></div>' +
            '</div></div>' +
          '<div class="rsec"><div class="rsec-title"><span class="ix">05</span> Sources appendix</div>' +
            '<div class="appendix">' + appxRows + '</div>' +
            '<p style="margin-top:0.8rem;font-size:0.78rem;color:var(--faint)">Reliability is graded 1-5 stars from source-of-record quality and corroboration. All entries are illustrative sample data.</p></div>' +
        '</div>' +
      '</div>'
    );
    stage.appendChild(report);

    var dl = el(
      '<div class="download-row"><span class="dl-label">Export this product</span>' +
        '<button class="dbtn dbtn--ghost" id="dl-pdf">PDF</button>' +
        '<button class="dbtn dbtn--ghost" id="dl-xls">Excel</button>' +
        '<button class="dbtn dbtn--ghost" id="dl-html">HTML</button>' +
        '<button class="dbtn dbtn--primary" id="dl-explore">Explore the network</button>' +
      '</div>'
    );
    stage.appendChild(dl);
    dl.querySelector('#dl-pdf').addEventListener('click', function () { openLightbox('pdf'); });
    dl.querySelector('#dl-xls').addEventListener('click', function () { openLightbox('xls'); });
    dl.querySelector('#dl-html').addEventListener('click', function () { toast('This is the live HTML report you are reading.'); });
    dl.querySelector('#dl-explore').addEventListener('click', function () {
      state.investigateUnlocked = true;
      refreshNavLocks();
      renderShell('investigate');
    });
  }

  // ============================================================
  // LIGHTBOX (fake PDF / Excel previews)
  // ============================================================
  function pdfPages() {
    var foot = function (n) { return '<div class="pdf-foot"><span>OAP Software &amp; Development LLC &middot; Sample product</span><span>Page ' + n + ' of 3</span></div>'; };
    return [
      '<div class="pdf-page"><div class="pdf-head"><span class="pdf-brand">OSINT App Platform</span><span class="pdf-class">Sample / Demonstration</span></div>' +
        '<h1>Due-Diligence Brief</h1><p style="font-weight:bold;color:#0d1117">Northwind Logistics LLC</p>' +
        '<div class="pdf-meta">Case CASE-2026-0418 &middot; Prepared 18 Apr 2026 &middot; Report type: Due-diligence brief</div>' +
        '<h2>Requirement</h2><p>' + esc(CASE.requirement) + '</p>' +
        '<h2>Executive summary</h2><p>Northwind Logistics LLC presents a moderate, manageable risk profile for the proposed supplier contract. Ownership is transparent and concentrates in two named individuals through a single intermediate holding entity, with no nominee or shell-layer indicators.</p>' +
        '<p>The most material items are an open contract-dispute litigation and a resolved carrier-safety enforcement notice. Both are bounded in scope. One indirect watchlist association rests on a dated shared address and is reported for transparency only.</p>' +
        foot(1) + '</div>',
      '<div class="pdf-page"><div class="pdf-head"><span class="pdf-brand">OSINT App Platform</span><span class="pdf-class">Sample / Demonstration</span></div>' +
        '<h2>Key findings</h2>' +
        '<p><b>1. Beneficial ownership concentrates in two individuals.</b> <span class="pdf-pill h">High</span><br/>Layered registry records resolve to two natural persons holding a combined majority interest through an intermediate holding entity. [Corporate registry]</p>' +
        '<p><b>2. One open commercial litigation.</b> <span class="pdf-pill m">Med</span><br/>An active civil filing alleges breach of a freight-forwarding agreement. Exposure is modest relative to the proposed contract. [Court record]</p>' +
        '<p><b>3. Regulatory enforcement notice, remediated.</b> <span class="pdf-pill m">Med</span><br/>A corrective-action notice tied to recordkeeping, since marked addressed. [Regulatory filing]</p>' +
        '<p><b>4. Indirect watchlist association, unconfirmed.</b> <span class="pdf-pill l">Low</span><br/>A dated shared address links a former affiliate to a watchlisted entity. Recorded for transparency. [Sanctions list]</p>' +
        '<p><b>5. Stable digital footprint.</b> <span class="pdf-pill h">High</span><br/>Domains share a single legitimate registrant; no look-alike or shell properties observed. [Domain / WHOIS]</p>' +
        foot(2) + '</div>',
      '<div class="pdf-page"><div class="pdf-head"><span class="pdf-brand">OSINT App Platform</span><span class="pdf-class">Sample / Demonstration</span></div>' +
        '<h2>Assessment &amp; gaps</h2>' +
        '<p><b>Established:</b></p><ul><li>Beneficial ownership and holding structure, corroborated across registries.</li><li>The open litigation: existence, venue, and nature.</li><li>The enforcement notice and its remediation.</li></ul>' +
        '<p><b>Unconfirmed:</b></p><ul><li>Final disposition and damages of the open litigation.</li><li>The watchlist association (single dated address match).</li><li>Any undisclosed related-party agreements.</li></ul>' +
        '<h2>Recommendation</h2><p>Proceed subject to standard contractual protections and a re-check of the open litigation before signing. All content is illustrative sample data.</p>' +
        foot(3) + '</div>'
    ];
  }

  function xlSheets() {
    var entHead = '<tr><th class="col-hd"></th><th class="col-hd">A</th><th class="col-hd">B</th><th class="col-hd">C</th><th class="col-hd">D</th><th class="col-hd">E</th></tr>';
    var entCols = '<tr><td class="row-num">1</td><th>Entity</th><th>Type</th><th>Role</th><th>IROC %</th><th>Sources</th></tr>';
    var entRows = ENTITIES.map(function (e, i) {
      return '<tr><td class="row-num">' + (i + 2) + '</td><td>' + esc(e[0]) + '</td><td>' + e[1] + '</td><td>' + esc(e[2]) + '</td><td>' + e[3] + '</td><td>' + e[4] + '</td></tr>';
    }).join('');

    var srcHead = '<tr><th class="col-hd"></th><th class="col-hd">A</th><th class="col-hd">B</th><th class="col-hd">C</th><th class="col-hd">D</th></tr>';
    var srcCols = '<tr><td class="row-num">1</td><th>Source type</th><th>Title</th><th>Reliability</th><th>Date</th></tr>';
    var srcRows = APPENDIX.map(function (a, i) {
      return '<tr><td class="row-num">' + (i + 2) + '</td><td>' + esc(a[0]) + '</td><td>' + esc(a[1]) + '</td><td>' + a[2] + ' / 5</td><td>' + a[3] + '</td></tr>';
    }).join('');

    var fHead = '<tr><th class="col-hd"></th><th class="col-hd">A</th><th class="col-hd">B</th><th class="col-hd">C</th></tr>';
    var fCols = '<tr><td class="row-num">1</td><th>#</th><th>Finding</th><th>Confidence</th></tr>';
    var fRows = FINDINGS.map(function (f, i) {
      var c = { high: 'High', med: 'Med', low: 'Low' }[f.conf];
      return '<tr><td class="row-num">' + (i + 2) + '</td><td>' + f.n + '</td><td>' + esc(f.title) + '</td><td>' + c + '</td></tr>';
    }).join('');

    return [
      { tab: 'Entities', html: '<table class="xl-grid"><thead>' + entHead + '</thead><tbody>' + entCols + entRows + '</tbody></table>' },
      { tab: 'Findings', html: '<table class="xl-grid"><thead>' + fHead + '</thead><tbody>' + fCols + fRows + '</tbody></table>' },
      { tab: 'Sources', html: '<table class="xl-grid"><thead>' + srcHead + '</thead><tbody>' + srcCols + srcRows + '</tbody></table>' }
    ];
  }

  function openLightbox(kind) {
    closeLightbox();
    scrollFrameIntoView();
    var pages = kind === 'pdf' ? pdfPages() : xlSheets();
    var page = 0;
    var title = kind === 'pdf' ? 'Northwind_Logistics_Brief.pdf' : 'Northwind_Logistics_Findings.xlsx';
    var sub = kind === 'pdf' ? 'PDF preview (sample, not downloadable)' : 'Workbook preview (sample, not downloadable)';

    var lb = el(
      '<div class="lightbox">' +
        '<div class="lb-bar">' +
          '<div><div class="lb-title">' + title + '</div><div class="lb-sub">' + sub + '</div></div>' +
          '<div class="spacer"></div>' +
          '<div class="lb-pager"><button class="dbtn dbtn--sm dbtn--ghost" id="lb-prev">Prev</button>' +
            '<span id="lb-count"></span>' +
            '<button class="dbtn dbtn--sm dbtn--ghost" id="lb-next">Next</button></div>' +
          '<button class="lb-close" id="lb-close" aria-label="Close preview">' + svg(ICON.close) + '</button>' +
        '</div>' +
        '<div class="lb-stage" id="lb-stage"></div>' +
      '</div>'
    );
    frame.appendChild(lb);
    var lbStage = lb.querySelector('#lb-stage');
    var count = lb.querySelector('#lb-count');

    function draw() {
      if (kind === 'pdf') {
        lbStage.innerHTML = pages[page];
        count.textContent = 'Page ' + (page + 1) + ' / ' + pages.length;
      } else {
        var s = pages[page];
        var tabs = pages.map(function (p, i) { return '<div class="xl-tab' + (i === page ? ' on' : '') + '" data-i="' + i + '">' + p.tab + '</div>'; }).join('');
        lbStage.innerHTML = '<div class="xl-page"><div class="xl-ribbon"><span class="x-ic">X</span> ' + title + ' - Microsoft Excel (sample)</div>' + s.html + '<div class="xl-tabs">' + tabs + '</div></div>';
        lbStage.querySelectorAll('.xl-tab').forEach(function (t) {
          t.addEventListener('click', function () { page = +t.getAttribute('data-i'); draw(); });
        });
        count.textContent = 'Sheet ' + (page + 1) + ' / ' + pages.length;
      }
      lbStage.scrollTop = 0;
    }
    draw();
    lb.querySelector('#lb-prev').addEventListener('click', function () { page = (page - 1 + pages.length) % pages.length; draw(); });
    lb.querySelector('#lb-next').addEventListener('click', function () { page = (page + 1) % pages.length; draw(); });
    lb.querySelector('#lb-close').addEventListener('click', closeLightbox);
  }
  function closeLightbox() { var lb = frame.querySelector('.lightbox'); if (lb) lb.parentNode.removeChild(lb); }

  // ============================================================
  // MODALS / INFO OVERLAY
  // ============================================================
  function showModal(icoSvg, title, body, actions) {
    closeModal();
    scrollFrameIntoView();
    var veil = el('<div class="modal-veil"><div class="modal-card"><div class="ico">' + icoSvg + '</div><h3>' + esc(title) + '</h3><p>' + esc(body) + '</p><div class="modal-actions"></div></div></div>');
    var act = veil.querySelector('.modal-actions');
    actions.forEach(function (a) {
      var b = el('<button class="dbtn ' + (a.primary ? 'dbtn--primary' : 'dbtn--ghost') + '">' + esc(a.label) + '</button>');
      b.addEventListener('click', a.action);
      act.appendChild(b);
    });
    frame.appendChild(veil);
  }
  function closeModal() { var m = frame.querySelector('.modal-veil'); if (m) m.parentNode.removeChild(m); }

  function renderInfoOverlay() {
    var existing = frame.querySelector('.info-veil');
    if (existing) return;
    scrollFrameIntoView();
    var tiles = [
      [ICON.db, 'Local-first', 'Your cases live on your machine, in your control. You decide what stays and what goes.'],
      [ICON.lock, 'Encrypted at rest', 'Case data is encrypted behind your passphrase, so the workspace is yours alone.'],
      [ICON.shield, 'Auditable by design', 'Every finding traces back to its sources, so you can always answer "why do you believe this?"'],
      [ICON.cloud, 'Offline-capable', 'The workspace keeps working without a constant connection, and you keep ownership of your data.']
    ];
    var tileHtml = tiles.map(function (t) {
      return '<div class="info-tile"><div class="ti">' + svg(t[0]) + '</div><h4>' + t[1] + '</h4><p>' + t[2] + '</p></div>';
    }).join('');
    var veil = el(
      '<div class="info-veil"><div class="info-card">' +
        '<div class="info-hd"><div class="info-ic">' + svg(ICON.info) + '</div>' +
          '<div><h3>About the platform</h3><p>What the OSINT App Platform gives you, at a glance.</p></div></div>' +
        '<div class="info-feat">' + tileHtml + '</div>' +
        '<p style="font-size:0.82rem;color:var(--t-muted);line-height:1.6;margin-bottom:1.2rem">The platform answers a defined requirement, collects against it, correlates the evidence, and writes a product you can defend. You see the sources behind every finding, so the result holds up under review.</p>' +
        '<div class="info-foot"><button class="dbtn dbtn--primary" id="info-close">Close</button></div>' +
      '</div></div>'
    );
    frame.appendChild(veil);
    veil.querySelector('#info-close').addEventListener('click', function () { veil.parentNode.removeChild(veil); });
    veil.addEventListener('click', function (e) { if (e.target === veil) veil.parentNode.removeChild(veil); });
  }

  function refreshNavLocks() {
    // Rebuild nav items in place to reflect new unlock state
    var nav = frame.querySelector('.shell-nav');
    if (!nav) return;
    renderShell(state.activeTab);
  }

  // ============================================================
  // INVESTIGATE (Cytoscape graph)
  // ============================================================
  var cy = null;
  var GRAPH = buildGraph();

  function stageInvestigate(stage) {
    stage.style.padding = '0';
    var inv = el(
      '<div class="inv">' +
        // left rail
        '<aside class="inv-rail">' +
          '<div class="inv-block"><h4>Search</h4><input class="inv-search" id="g-search" type="text" placeholder="Find an entity..." /></div>' +
          '<div class="inv-block"><h4>Node types</h4><div id="g-legend"></div></div>' +
          '<div class="inv-block"><h4>Confidence floor</h4>' +
            '<div class="slider-row"><input type="range" id="g-slider" min="0" max="100" value="0" /><input class="conf-num" id="g-num" type="number" min="0" max="100" value="0" /></div>' +
            '<p class="inv-note">Hide nodes and links below this confidence. Type 1-99 to set it.</p></div>' +
          '<div class="inv-block"><h4>Build</h4>' +
            '<button class="dbtn dbtn--ghost dbtn--sm" id="g-add" style="width:100%;margin-bottom:0.5rem">+ Add entity</button>' +
            '<p class="inv-note">Analyst-added nodes show a dashed orange border. Non-destructive demo action.</p></div>' +
        '</aside>' +
        // canvas
        '<div class="inv-canvas-wrap"><div class="cy-grid"></div><div id="cy"></div>' +
          '<div class="cy-toolbar">' +
            '<button class="cy-tool" id="g-fit" title="Fit">' + svg(ICON.fit) + '</button>' +
            '<button class="cy-tool" id="g-in" title="Zoom in">' + svg(ICON.plus) + '</button>' +
            '<button class="cy-tool" id="g-out" title="Zoom out">' + svg(ICON.minus) + '</button>' +
          '</div>' +
          '<div class="cy-hint">Scroll to zoom &middot; drag to pan &middot; click a node or link</div>' +
        '</div>' +
        // right rail
        '<aside class="inv-rail right"><div id="g-detail"><div class="detail-empty">' + svg(ICON.graph) + '<div>Select a node or link to see its detail, sources, and confidence.</div></div></div></aside>' +
      '</div>'
    );
    stage.appendChild(inv);
    buildLegend(inv);
    initCytoscape();
    wireGraphControls(inv);
  }

  function buildGraph() {
    // Internally consistent with the report. IROC = relevance (0-100).
    // Shapes by type assigned in cytoscape style. confidence = node confidence.
    var N = [
      { id: 'iroc', label: 'Vendor Risk\nNorthwind Logistics', type: 'IROC', iroc: 100, conf: 100, desc: 'The governing intelligence requirement. Top-relevance entities connect here.', aliases: 'Case objective', attrs: [['Case', CASE.code], ['Report type', CASE.reportType], ['Depth', CASE.depth]], srcs: [] },
      { id: 'nw', label: 'Northwind\nLogistics LLC', type: 'Organization', iroc: 100, conf: 92, desc: 'Subject entity of the due-diligence case. A freight-forwarding operator under review for a supplier contract.', aliases: 'Northwind Logistics; NW Logistics', attrs: [['Form', 'LLC'], ['Founded', '2019'], ['Sector', 'Freight forwarding']], srcs: [['Corporate registry', 'Articles of organization', 5, '2019-03-12'], ['Business directory', 'Officer listing', 3, '2024-12-02']] },
      { id: 'helena', label: 'Helena\nVossberg', type: 'Person', iroc: 88, conf: 88, desc: 'Beneficial owner holding a majority interest through the parent holding entity.', aliases: 'H. Vossberg', attrs: [['Role', 'Beneficial owner'], ['Stake', 'Majority (indirect)'], ['Nominee flags', 'None']], srcs: [['Corporate registry', 'Beneficial ownership filing', 5, '2020-08-02'], ['Business directory', 'Officer cross-reference', 3, '2024-12-02']] },
      { id: 'martin', label: 'Martin\nCroy', type: 'Person', iroc: 82, conf: 82, desc: 'Beneficial owner and listed director of the subject entity.', aliases: 'M. Croy', attrs: [['Role', 'Owner / director'], ['Stake', 'Minority (indirect)'], ['Nominee flags', 'None']], srcs: [['Corporate registry', 'Director listing', 5, '2019-03-12']] },
      { id: 'cascade', label: 'Cascade\nHoldings Group', type: 'Organization', iroc: 76, conf: 80, desc: 'Intermediate holding entity through which ownership is structured.', aliases: 'Cascade Holdings', attrs: [['Form', 'Holding entity'], ['Registered', '2020'], ['Subsidiaries', '2 identified']], srcs: [['Corporate registry', 'Foreign-entity registration', 5, '2020-08-02']] },
      { id: 'dispute', label: 'Freight\nDispute (2024)', type: 'Event', iroc: 64, conf: 62, desc: 'Active civil litigation alleging breach of a freight-forwarding agreement. Exposure is modest relative to the contract.', aliases: 'Northwind Freight Dispute', attrs: [['Type', 'Civil litigation'], ['Status', 'Open'], ['Exposure', 'Modest']], srcs: [['Court record', 'Civil docket', 4, '2024-11-09'], ['News & media', 'Regional coverage', 3, '2025-01-18']] },
      { id: 'notice', label: 'Carrier-Safety\nNotice (2024)', type: 'Event', iroc: 61, conf: 70, desc: 'Regulatory corrective-action notice tied to recordkeeping, since marked addressed.', aliases: 'Enforcement notice', attrs: [['Type', 'Enforcement'], ['Status', 'Remediated'], ['Domain', 'Carrier safety']], srcs: [['Regulatory filing', 'Corrective-action notice', 4, '2024-06-21'], ['Press release', 'Company statement', 2, '2024-07-04']] },
      { id: 'court', label: 'Riverside\nCounty Court', type: 'Court', iroc: 44, conf: 75, desc: 'Filing venue for the open litigation.', aliases: 'Riverside Co. Court', attrs: [['Venue', 'Civil'], ['Jurisdiction', 'County']], srcs: [['Court record', 'Docket header', 4, '2024-11-09']] },
      { id: 'domain1', label: 'northwind-\nlogistics.com', type: 'Document', iroc: 52, conf: 78, desc: 'Primary corporate domain. Single legitimate registrant, consistent hosting.', aliases: 'Primary domain', attrs: [['Registered', '2018'], ['Registrant', 'Consistent'], ['Look-alikes', 'None found']], srcs: [['Domain / WHOIS', 'Registration record', 4, '2018-10-01']] },
      { id: 'domain2', label: 'cascade-\nholdings.net', type: 'Document', iroc: 40, conf: 60, desc: 'Holding-group domain sharing the same registrant.', aliases: 'Holding domain', attrs: [['Registered', '2020'], ['Registrant', 'Shared']], srcs: [['Domain / WHOIS', 'Registration record', 3, '2020-09-15']] },
      { id: 'tribune', label: 'Port City\nTribune', type: 'Document', iroc: 47, conf: 55, desc: 'Regional outlet that covered the contract dispute.', aliases: 'PCT', attrs: [['Type', 'News outlet'], ['Coverage', 'Litigation']], srcs: [['News & media', 'Article series', 3, '2025-01-18']] },
      { id: 'tradepress', label: 'Trade Press\nProfile', type: 'Document', iroc: 38, conf: 52, desc: 'Trade-press profile of the holding group.', aliases: 'Industry profile', attrs: [['Type', 'Trade press'], ['Subject', 'Cascade Holdings']], srcs: [['News & media', 'Trade-press profile', 3, '2023-05-30']] },
      { id: 'affiliate', label: 'Former\nAffiliate Co.', type: 'Organization', iroc: 35, conf: 40, desc: 'Former affiliate linked only by a dated shared historical address.', aliases: 'Prior affiliate', attrs: [['Status', 'Former'], ['Link', 'Shared address (dated)']], srcs: [['Business directory', 'Historical address record', 2, '2021-02-11']] },
      { id: 'watchlist', label: 'Third-Party\nWatchlist Entry', type: 'Concept', iroc: 30, conf: 28, desc: 'A watchlisted entity connected only indirectly and on dated information. Reported for transparency, not as a finding against the subject.', aliases: 'Watchlist association', attrs: [['Confidence', 'Low'], ['Directness', 'Indirect'], ['Recency', 'Dated']], srcs: [['Sanctions list', 'Third-party watchlist', 2, '2021-02-11']] },
      { id: 'addr', label: 'Shared\nAddress (hist.)', type: 'Location', iroc: 33, conf: 45, desc: 'Historical address shared between a former affiliate and the watchlisted entity.', aliases: 'Prior registered address', attrs: [['Type', 'Registered address'], ['Period', 'Historical']], srcs: [['Corporate registry', 'Prior address filing', 3, '2021-02-11']] },
      { id: 'acct1', label: '@northwind\n_freight', type: 'Account', iroc: 36, conf: 58, desc: 'Corporate social account, consistent with the primary domain.', aliases: 'Corporate social', attrs: [['Platform', 'Social / web'], ['Verified link', 'Domain match']], srcs: [['Social / web', 'Corporate profile', 3, '2025-02-20']] },
      { id: 'officer2', label: 'Dana\nRoethke', type: 'Person', iroc: 42, conf: 64, desc: 'Operations officer named in registry filings.', aliases: 'D. Roethke', attrs: [['Role', 'Operations officer'], ['Tenure', 'Since 2021']], srcs: [['Corporate registry', 'Officer listing', 4, '2022-04-10']] },
      { id: 'subsidiary', label: 'Northwind\nDrayage LLC', type: 'Organization', iroc: 48, conf: 66, desc: 'Operating subsidiary handling short-haul drayage.', aliases: 'NW Drayage', attrs: [['Form', 'LLC'], ['Relation', 'Subsidiary']], srcs: [['Corporate registry', 'Subsidiary filing', 4, '2021-06-18']] },
      { id: 'contract', label: 'Proposed\nSupplier Contract', type: 'Concept', iroc: 70, conf: 80, desc: 'The contracting decision that motivates this case. Findings tie back to it.', aliases: 'Decision', attrs: [['Stage', 'Proposed'], ['Owner', 'Procurement']], srcs: [] },
      { id: 'filing1', label: 'Articles of\nOrganization', type: 'Document', iroc: 50, conf: 85, desc: 'Founding filing establishing the subject entity.', aliases: 'Founding filing', attrs: [['Year', '2019'], ['Authority', 'State registry']], srcs: [['Corporate registry', 'Articles of organization', 5, '2019-03-12']] },
      { id: 'remediation', label: 'Safety\nRemediation', type: 'Event', iroc: 41, conf: 60, desc: 'Documented remediation closing out the enforcement notice.', aliases: 'Corrective action', attrs: [['Status', 'Complete'], ['Year', '2024']], srcs: [['Press release', 'Company statement', 2, '2024-07-04']] },
      { id: 'lawyer', label: 'Opposing\nParty', type: 'Organization', iroc: 39, conf: 55, desc: 'Counterparty in the freight-forwarding dispute.', aliases: 'Plaintiff', attrs: [['Role', 'Plaintiff'], ['Matter', 'Contract']], srcs: [['Court record', 'Party listing', 4, '2024-11-09']] },
      { id: 'media2', label: 'Adverse Media\nMention', type: 'Concept', iroc: 34, conf: 48, desc: 'A flagged adverse-media item, weighed and retained above the relevance floor.', aliases: 'Adverse item', attrs: [['Sentiment', 'Negative'], ['Relevance', 'Above floor']], srcs: [['News & media', 'Coverage item', 3, '2025-01-18']] },
      { id: 'officer3', label: 'Glen\nHausmann', type: 'Person', iroc: 37, conf: 56, desc: 'Finance officer listed in business directory cross-reference.', aliases: 'G. Hausmann', attrs: [['Role', 'Finance officer'], ['Source', 'Directory']], srcs: [['Business directory', 'Officer listing', 3, '2024-12-02']] }
    ];

    // Edges. relType + confidence band + sources. 2 edges have no evidence (noEvidence: true).
    var E = [
      ['nw', 'iroc', 'subject of', 96, [['Corporate registry', 'Articles of organization', 5, '2019-03-12']]],
      ['contract', 'iroc', 'motivates', 88, []],
      ['nw', 'contract', 'counterparty to', 84, [['Business directory', 'Procurement record', 3, '2025-03-01']]],
      ['helena', 'cascade', 'owns', 87, [['Corporate registry', 'Beneficial ownership filing', 5, '2020-08-02']]],
      ['martin', 'cascade', 'owns', 80, [['Corporate registry', 'Director listing', 5, '2019-03-12']]],
      ['cascade', 'nw', 'parent of', 82, [['Corporate registry', 'Foreign-entity registration', 5, '2020-08-02']]],
      ['nw', 'subsidiary', 'parent of', 70, [['Corporate registry', 'Subsidiary filing', 4, '2021-06-18']]],
      ['nw', 'dispute', 'party to', 75, [['Court record', 'Civil docket', 4, '2024-11-09']]],
      ['dispute', 'court', 'filed at', 74, [['Court record', 'Docket header', 4, '2024-11-09']]],
      ['lawyer', 'dispute', 'opposing party in', 60, [['Court record', 'Party listing', 4, '2024-11-09']]],
      ['nw', 'notice', 'subject of', 68, [['Regulatory filing', 'Corrective-action notice', 4, '2024-06-21']]],
      ['notice', 'remediation', 'closed by', 60, [['Press release', 'Company statement', 2, '2024-07-04']]],
      ['nw', 'domain1', 'operates', 78, [['Domain / WHOIS', 'Registration record', 4, '2018-10-01']]],
      ['cascade', 'domain2', 'operates', 58, [['Domain / WHOIS', 'Registration record', 3, '2020-09-15']]],
      ['nw', 'acct1', 'operates', 56, [['Social / web', 'Corporate profile', 3, '2025-02-20']]],
      ['tribune', 'dispute', 'reported on', 55, [['News & media', 'Article series', 3, '2025-01-18']]],
      ['tradepress', 'cascade', 'profiled', 50, [['News & media', 'Trade-press profile', 3, '2023-05-30']]],
      ['media2', 'nw', 'mentions', 46, [['News & media', 'Coverage item', 3, '2025-01-18']]],
      ['affiliate', 'addr', 'registered at', 44, [['Corporate registry', 'Prior address filing', 3, '2021-02-11']]],
      ['watchlist', 'addr', 'registered at', 26, [['Sanctions list', 'Third-party watchlist', 2, '2021-02-11']]],
      ['affiliate', 'nw', 'former affiliate of', 30, [], true],
      ['watchlist', 'affiliate', 'associated with', 24, [], true],
      ['officer2', 'nw', 'officer of', 62, [['Corporate registry', 'Officer listing', 4, '2022-04-10']]],
      ['officer3', 'nw', 'officer of', 54, [['Business directory', 'Officer listing', 3, '2024-12-02']]],
      ['helena', 'nw', 'controls', 80, [['Corporate registry', 'Beneficial ownership filing', 5, '2020-08-02']]],
      ['filing1', 'nw', 'establishes', 84, [['Corporate registry', 'Articles of organization', 5, '2019-03-12']]],
      ['helena', 'iroc', 'relevant to', 86, [['Corporate registry', 'Beneficial ownership filing', 5, '2020-08-02']]],
      ['martin', 'iroc', 'relevant to', 80, [['Corporate registry', 'Director listing', 5, '2019-03-12']]],
      ['dispute', 'iroc', 'relevant to', 64, [['Court record', 'Civil docket', 4, '2024-11-09']]],
      ['notice', 'iroc', 'relevant to', 61, [['Regulatory filing', 'Corrective-action notice', 4, '2024-06-21']]]
    ];

    var nodeMap = {};
    var nodes = N.map(function (n) { nodeMap[n.id] = n; return { data: n }; });
    var edges = E.map(function (e, i) {
      return { data: { id: 'e' + i, source: e[0], target: e[1], rel: e[2], conf: e[3], srcs: e[4] || [], noEvidence: !!e[5] } };
    });
    return { nodes: nodes, edges: edges, nodeMap: nodeMap };
  }

  function initCytoscape() {
    if (typeof cytoscape === 'undefined') {
      var c = frame.querySelector('#cy');
      if (c) c.innerHTML = '<div style="padding:2rem;color:var(--faint);font-family:var(--app-mono)">Graph library failed to load.</div>';
      return;
    }
    var shapeByType = {
      Person: 'ellipse', Organization: 'round-rectangle', Event: 'diamond', Document: 'round-tag',
      Location: 'pentagon', Concept: 'hexagon', Account: 'ellipse', Court: 'round-rectangle', IROC: 'star'
    };

    cy = cytoscape({
      container: frame.querySelector('#cy'),
      wheelSensitivity: 0.2,
      minZoom: 0.3, maxZoom: 3.5,
      elements: { nodes: GRAPH.nodes, edges: GRAPH.edges },
      style: [
        {
          selector: 'node',
          style: {
            'background-color': function (n) { return TYPE_COLORS[n.data('type')] || '#3fb950'; },
            'shape': function (n) { return shapeByType[n.data('type')] || 'ellipse'; },
            'label': 'data(label)',
            'color': '#e6edf3',
            'font-family': 'JetBrains Mono, monospace',
            'font-size': '8px',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 5,
            'text-wrap': 'wrap',
            'text-max-width': '90px',
            'width': function (n) { return 26 + (n.data('iroc') / 100) * 42; },
            'height': function (n) { return 26 + (n.data('iroc') / 100) * 42; },
            'border-width': 1.5,
            'border-color': 'rgba(255,255,255,0.22)',
            'text-outline-width': 2,
            'text-outline-color': '#0d1117',
            'transition-property': 'border-width, border-color, opacity',
            'transition-duration': '120ms'
          }
        },
        { selector: 'node[type="IROC"]', style: { 'border-color': '#ffd479', 'border-width': 2.5, 'font-size': '9px', 'color': '#ffd479' } },
        { selector: 'node.manual', style: { 'border-color': '#ff9d6f', 'border-width': 2.5, 'border-style': 'dashed' } },
        { selector: 'node.sel', style: { 'border-color': '#3fb950', 'border-width': 4 } },
        { selector: 'node.dim', style: { 'opacity': 0.12 } },
        {
          selector: 'edge',
          style: {
            'width': function (e) { return 1 + (e.data('conf') / 100) * 2.5; },
            'line-color': '#8b949e',
            'opacity': 0.5,
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#8b949e',
            'arrow-scale': 0.7,
            'label': 'data(rel)',
            'font-family': 'JetBrains Mono, monospace',
            'font-size': '6.5px',
            'color': '#6e7681',
            'text-rotation': 'autorotate',
            'text-outline-width': 2,
            'text-outline-color': '#0d1117'
          }
        },
        { selector: 'edge[?noEvidence]', style: { 'line-color': '#a8555f', 'line-style': 'dashed', 'target-arrow-color': '#a8555f', 'color': '#a8555f' } },
        { selector: 'edge.sel', style: { 'line-color': '#3fb950', 'target-arrow-color': '#3fb950', 'opacity': 1, 'width': 3.5, 'color': '#3fb950' } },
        { selector: 'edge.dim', style: { 'opacity': 0.06 } }
      ],
      layout: { name: 'cose', animate: true, animationDuration: 700, padding: 50, nodeRepulsion: 9000, idealEdgeLength: 95, gravity: 0.3, randomize: true }
    });

    cy.on('tap', 'node', function (evt) { selectNode(evt.target); });
    cy.on('tap', 'edge', function (evt) { selectEdge(evt.target); });
    cy.on('tap', function (evt) { if (evt.target === cy) clearSelection(); });

    // center IROC after layout
    cy.ready(function () { setTimeout(function () { cy.fit(undefined, 60); }, 750); });
  }

  function clearSelection() {
    if (!cy) return;
    cy.elements().removeClass('sel dim');
    var d = frame.querySelector('#g-detail');
    if (d) d.innerHTML = '<div class="detail-empty">' + svg(ICON.graph) + '<div>Select a node or link to see its detail, sources, and confidence.</div></div>';
  }

  function selectNode(node) {
    if (!cy) return;
    cy.elements().removeClass('sel dim');
    var neigh = node.closedNeighborhood();
    cy.elements().not(neigh).addClass('dim');
    node.addClass('sel');
    var d = node.data();
    var color = TYPE_COLORS[d.type] || '#3fb950';
    var attrs = (d.attrs || []).map(function (a) { return '<div class="attr-row"><span class="k">' + esc(a[0]) + '</span><span class="v">' + esc(a[1]) + '</span></div>'; }).join('');
    var srcs = (d.srcs || []).map(function (s) {
      return '<div class="src-card"><div class="st">' + esc(s[0]) + '</div><div class="sn">' + esc(s[1]) + '</div>' +
        '<div class="sm"><span class="stars">' + starStr(s[2]) + '</span><span class="sd">' + s[3] + '</span></div></div>';
    }).join('') || '<p class="inv-note">No external source records for this node (case-derived).</p>';
    var circ = 2 * Math.PI * 18;
    var off = circ - (d.iroc / 100) * circ;
    var html =
      '<div class="detail">' +
        '<span class="detail-type" style="--c:' + color + ';color:' + color + ';background:' + hexA(color, 0.12) + ';border:1px solid ' + hexA(color, 0.4) + '">' + d.type + '</span>' +
        '<h3>' + esc(d.label.replace(/\n/g, ' ')) + '</h3>' +
        '<div class="aliases">Aliases: ' + esc(d.aliases || '-') + '</div>' +
        '<div class="iroc"><div class="ring"><svg width="46" height="46"><circle cx="23" cy="23" r="18" fill="none" stroke="#30363d" stroke-width="4"/>' +
          '<circle cx="23" cy="23" r="18" fill="none" stroke="#3fb950" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + circ + '" stroke-dashoffset="' + off + '"/></svg><span class="v">' + d.iroc + '</span></div>' +
          '<span class="ilab">IROC relevance to the requirement</span></div>' +
        '<div class="desc">' + esc(d.desc || '') + '</div>' +
        '<div class="detail-sub">Attributes</div>' + (attrs || '<p class="inv-note">-</p>') +
        '<div class="detail-sub">Sources &amp; provenance</div>' + srcs +
      '</div>';
    frame.querySelector('#g-detail').innerHTML = html;
  }

  function selectEdge(edge) {
    if (!cy) return;
    cy.elements().removeClass('sel dim');
    var conn = edge.connectedNodes().union(edge);
    cy.elements().not(conn).addClass('dim');
    edge.addClass('sel');
    var d = edge.data();
    var s = cy.getElementById(d.source).data();
    var t = cy.getElementById(d.target).data();
    var band = d.conf >= 80 ? ['conf-high', 'High'] : d.conf >= 50 ? ['conf-med', 'Med'] : ['conf-low', 'Low'];
    var srcs = (d.srcs || []).map(function (x) {
      return '<div class="src-card"><div class="st">' + esc(x[0]) + '</div><div class="sn">' + esc(x[1]) + '</div>' +
        '<div class="sm"><span class="stars">' + starStr(x[2]) + '</span><span class="sd">' + x[3] + '</span></div></div>';
    }).join('');
    var badge = d.noEvidence ? '<div class="edge-badge">' + svg(ICON.alert) + ' Asserted, unverified - no evidence on file</div>' : '';
    var srcBlock = d.noEvidence
      ? '<p class="inv-note">This relationship is asserted but has no supporting source on file. The platform shows it honestly rather than hiding it, so a reviewer can challenge it.</p>'
      : (srcs || '<p class="inv-note">No source records.</p>');
    var html =
      '<div class="detail">' +
        '<span class="detail-type" style="--c:#8b949e;color:#8b949e;background:rgba(139,148,158,0.12);border:1px solid rgba(139,148,158,0.4)">Relationship</span>' +
        '<h3>' + esc(d.rel) + '</h3>' +
        '<div class="aliases">' + esc(s.label.replace(/\n/g, ' ')) + ' &rarr; ' + esc(t.label.replace(/\n/g, ' ')) + '</div>' +
        badge +
        '<div class="attr-row"><span class="k">Confidence band</span><span class="v">' + confPillInline(band) + '</span></div>' +
        '<div class="attr-row"><span class="k">Confidence score</span><span class="v">' + d.conf + ' / 100</span></div>' +
        '<div class="detail-sub">Cited sources</div>' + srcBlock +
      '</div>';
    frame.querySelector('#g-detail').innerHTML = html;
  }
  function confPillInline(band) { return '<span class="conf-pill ' + band[0] + '">' + band[1] + '</span>'; }

  function hexA(hex, a) {
    var h = hex.replace('#', '');
    var r = parseInt(h.substring(0, 2), 16), g = parseInt(h.substring(2, 4), 16), b = parseInt(h.substring(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }

  function buildLegend(inv) {
    var types = [
      ['IROC', 'star'], ['Person', 'ellipse'], ['Organization', 'roundrect'], ['Event', 'diamond'],
      ['Document', 'tag'], ['Location', 'pentagon'], ['Concept', 'hexagon'], ['Account', 'ellipse'], ['Court', 'roundrect']
    ];
    var counts = {};
    GRAPH.nodes.forEach(function (n) { counts[n.data.type] = (counts[n.data.type] || 0) + 1; });
    var host = inv.querySelector('#g-legend');
    types.forEach(function (t) {
      if (!counts[t[0]]) return;
      var color = TYPE_COLORS[t[0]];
      var item = el('<div class="legend-item" data-type="' + t[0] + '"><span class="legend-swatch ' + t[1] + '" style="background:' + color + '"></span><span>' + t[0] + '</span><span class="legend-cnt">' + counts[t[0]] + '</span></div>');
      item.addEventListener('click', function () {
        item.classList.toggle('off');
        var hidden = item.classList.contains('off');
        if (cy) {
          cy.nodes('[type="' + t[0] + '"]').forEach(function (n) {
            n.style('display', hidden ? 'none' : 'element');
          });
        }
      });
      host.appendChild(item);
    });
  }

  function wireGraphControls(inv) {
    var search = inv.querySelector('#g-search');
    search.addEventListener('input', function () {
      var q = search.value.trim().toLowerCase();
      if (!cy) return;
      if (!q) { cy.nodes().removeClass('dim'); return; }
      cy.nodes().forEach(function (n) {
        var hit = n.data('label').toLowerCase().indexOf(q) >= 0 || (n.data('aliases') || '').toLowerCase().indexOf(q) >= 0;
        n.toggleClass('dim', !hit);
      });
    });

    var slider = inv.querySelector('#g-slider');
    var num = inv.querySelector('#g-num');
    function applyFloor(v) {
      v = Math.max(0, Math.min(100, parseInt(v, 10) || 0));
      slider.value = v; num.value = v;
      if (!cy) return;
      cy.nodes().forEach(function (n) {
        if (n.data('type') === 'IROC') return;
        n.style('display', n.data('conf') < v ? 'none' : 'element');
      });
      cy.edges().forEach(function (e) {
        e.style('display', e.data('conf') < v ? 'none' : 'element');
      });
    }
    slider.addEventListener('input', function () { applyFloor(slider.value); });
    num.addEventListener('input', function () { applyFloor(num.value); });

    var added = 0;
    inv.querySelector('#g-add').addEventListener('click', function () {
      if (!cy || added >= 3) { toast(added >= 3 ? 'Demo add limit reached' : ''); return; }
      added++;
      var id = 'manual' + added;
      var labels = ['New Lead\n(analyst)', 'Follow-up\nEntity', 'Hypothesis\nNode'];
      cy.add({ data: { id: id, label: labels[added - 1], type: 'Concept', iroc: 30, conf: 50, desc: 'Analyst-added working node. Non-destructive demo entity.', aliases: 'Manual', attrs: [['Origin', 'Analyst-added'], ['Status', 'Working']], srcs: [] } });
      var n = cy.getElementById(id);
      n.addClass('manual');
      var iroc = cy.getElementById('iroc');
      cy.add({ data: { id: 'me' + added, source: id, target: 'iroc', rel: 'proposed link', conf: 50, srcs: [], noEvidence: true } });
      n.position({ x: iroc.position('x') + (Math.random() * 160 - 80), y: iroc.position('y') + (Math.random() * 160 - 80) });
      toast('Analyst node added (dashed orange)');
    });

    inv.querySelector('#g-fit').addEventListener('click', function () { if (cy) cy.animate({ fit: { padding: 50 } }, { duration: 300 }); });
    inv.querySelector('#g-in').addEventListener('click', function () { if (cy) cy.animate({ zoom: cy.zoom() * 1.3, center: { eles: cy.elements() } }, { duration: 200 }); });
    inv.querySelector('#g-out').addEventListener('click', function () { if (cy) cy.animate({ zoom: cy.zoom() / 1.3, center: { eles: cy.elements() } }, { duration: 200 }); });
  }

  // ============================================================
  // BOOT
  // ============================================================
  function boot() {
    if (isUnlocked() && getLead()) {
      state.lead = getLead();
      renderShell('setup');
    } else {
      renderLead();
    }
  }
  boot();
})();
