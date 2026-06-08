// OAP Software — shared interactions
(function () {
  const root = document.documentElement;

  // ---- Theme (default dark for an intelligence product) ----
  const toggle = document.querySelector('[data-theme-toggle]');
  let theme = 'dark';
  try {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) theme = 'light';
  } catch (e) {}
  root.setAttribute('data-theme', theme);

  function icon(t) {
    return t === 'dark'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }
  if (toggle) {
    toggle.innerHTML = icon(theme);
    toggle.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      toggle.innerHTML = icon(theme);
      toggle.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
    });
  }

  // ---- Mobile nav ----
  const navToggle = document.querySelector('.nav__toggle');
  const navLinks = document.querySelector('.nav__links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open);
    });
    navLinks.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => navLinks.classList.remove('is-open'))
    );
  }

  // ---- Sticky header shadow ----
  const header = document.querySelector('.header');
  if (header) {
    const onScroll = () => header.classList.toggle('header--scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---- Access request form (Formspree-style AJAX submit) ----
  const form = document.getElementById('access-form');
  if (form) {
    const ok = document.getElementById('form-ok');
    const err = document.getElementById('form-err');
    form.addEventListener('submit', async (e) => {
      const action = form.getAttribute('action') || '';
      // If no real endpoint configured yet, fall back gracefully.
      if (action.includes('OAP_FORM_ID')) {
        e.preventDefault();
        if (ok) { ok.hidden = false; ok.textContent = 'Thanks — the request form is being connected. Please check back shortly.'; }
        return;
      }
      e.preventDefault();
      if (ok) ok.hidden = true;
      if (err) err.hidden = true;
      try {
        const res = await fetch(action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        if (res.ok) { form.reset(); if (ok) ok.hidden = false; }
        else if (err) err.hidden = false;
      } catch (_) {
        if (err) err.hidden = false;
      }
    });
  }

  // ---- Scroll reveal ----
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
    // Safety net: anything still hidden after 2.5s (e.g. no-scroll viewports) reveals.
    setTimeout(() => revealEls.forEach((el) => el.classList.add('is-visible')), 2500);
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }
})();
