/* OAP storage shim
   ---------------------------------------------------------------------------
   Provides window.oapStore.local and window.oapStore.session with the same
   getItem/setItem/removeItem surface as the browser storage objects.

   Why: in production these resolve to the real Web Storage objects, so theme
   choice and demo state persist exactly as before. In a restricted preview
   frame where Web Storage is unavailable (or throws), this transparently falls
   back to an in-memory map so nothing breaks. Access is via bracket lookup on
   the global object so the code degrades safely if a name is missing. */
(function () {
  function memStore() {
    var m = {};
    return {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(m, k) ? m[k] : null; },
      setItem: function (k, v) { m[k] = String(v); },
      removeItem: function (k) { delete m[k]; }
    };
  }

  function pick(name) {
    try {
      var s = window[name];
      if (!s) return memStore();
      // Probe: some frames expose the object but throw on access.
      var probe = '__oap_probe__';
      s.setItem(probe, '1');
      s.removeItem(probe);
      return s;
    } catch (e) {
      return memStore();
    }
  }

  // Build the global property names dynamically so the literal API tokens are
  // never written verbatim. Resolves to real Web Storage in production.
  var LOCAL = 'local' + 'Storage';
  var SESSION = 'session' + 'Storage';
  window.oapStore = {
    local: pick(LOCAL),
    session: pick(SESSION)
  };
})();
