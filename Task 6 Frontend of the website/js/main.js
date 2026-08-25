/**
 * NEXORA — application entry point
 * Boots every module in dependency order and dismisses the branded preloader.
 */
(function (ns) {
  "use strict";

  function boot() {
    try {
      ns.components.init(); // renders all data-driven sections first
      ns.theme.init();
      ns.prefs.init();
      ns.pricing.init();
      ns.inquiry.init();
      ns.filters.init();
      ns.forms.init();
      ns.search.init();
      ns.nav.init();
      ns.animations.init(); // observers attach after markup exists
      ns.router.init(); // deep links resolve once every surface exists
    } catch (err) {
      // Never leave the interface in a broken state: surface the failure once.
      console.error("[NEXORA] initialisation error:", err);
      const host = document.getElementById("toasts");
      if (host) {
        host.innerHTML =
          '<div class="toast toast--error" role="alert"><div><strong>Something went wrong</strong>' +
          "<span>Part of the page could not initialise. Reloading usually resolves it.</span></div></div>";
      }
    }

    // Reveal the page and dismiss the loader.
    const preloader = document.getElementById("preloader");
    const finish = function () {
      document.body.classList.add("is-ready");
      if (preloader) {
        preloader.classList.add("is-done");
        setTimeout(function () {
          preloader.remove();
        }, 600);
      }
      // Honour a hash present on first load once layout has settled.
      if (location.hash.length > 1) {
        setTimeout(function () {
          ns.nav.scrollToId(location.hash.slice(1));
        }, 120);
      }
    };
    // Keep the loader short: content should be usable immediately.
    setTimeout(finish, 550);

    const year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})((window.NEXORA = window.NEXORA || {}));
