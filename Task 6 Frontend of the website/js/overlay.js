/**
 * NEXORA — overlay factory
 * Creates accessible full-screen dialog surfaces (checkout, dashboard,
 * inquiry wizard, preferences). Handles focus trapping, Escape, scroll lock
 * and returning focus to the element that opened the overlay.
 */
(function (ns) {
  "use strict";

  const open = [];

  function anyOpen() {
    return open.length > 0;
  }

  function create(options) {
    const opts = options || {};
    const el = document.createElement("div");
    el.className = "ov" + (opts.variant ? " ov--" + opts.variant : "");
    if (opts.id) el.id = opts.id;
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-hidden", "true");
    el.setAttribute("aria-label", opts.label || "Dialog");
    el.innerHTML =
      '<div class="ov__scrim" data-ov-close></div><div class="ov__panel" role="document"></div>';
    document.body.appendChild(el);

    const panel = el.querySelector(".ov__panel");
    let lastFocused = null;
    let closeHandlers = [];

    function focusFirst() {
      const target =
        panel.querySelector("[data-autofocus]") ||
        panel.querySelector(ns.nav ? ns.nav.FOCUSABLE : "button, a[href], input");
      if (target && target.focus) target.focus();
      else panel.focus();
    }

    const api = {
      el: el,
      panel: panel,
      setContent: function (html) {
        panel.innerHTML = html;
        return api;
      },
      setLabel: function (label) {
        el.setAttribute("aria-label", label);
        return api;
      },
      isOpen: function () {
        return el.classList.contains("is-open");
      },
      open: function (html) {
        if (typeof html === "string") panel.innerHTML = html;
        if (api.isOpen()) {
          focusFirst();
          return api;
        }
        lastFocused = document.activeElement;
        el.classList.add("is-open");
        el.removeAttribute("aria-hidden");
        document.body.classList.add("is-locked");
        open.push(api);
        panel.scrollTop = 0;
        focusFirst();
        return api;
      },
      close: function (silent) {
        if (!api.isOpen()) return api;
        el.classList.remove("is-open");
        el.setAttribute("aria-hidden", "true");
        const i = open.indexOf(api);
        if (i > -1) open.splice(i, 1);
        if (!anyOpen() && !(ns.modal && ns.modal.isOpen()) && !(ns.search && ns.search.isOpen())) {
          document.body.classList.remove("is-locked");
        }
        if (lastFocused && lastFocused.focus && document.contains(lastFocused)) {
          lastFocused.focus();
        }
        if (!silent) {
          closeHandlers.forEach(function (fn) {
            fn();
          });
        }
        return api;
      },
      onClose: function (fn) {
        closeHandlers.push(fn);
        return api;
      },
      scrollTop: function () {
        panel.scrollTop = 0;
        return api;
      },
    };

    el.addEventListener("click", function (e) {
      if (e.target.closest("[data-ov-close]")) {
        e.preventDefault();
        api.close();
      }
    });

    el.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        api.close();
      } else if (e.key === "Tab" && ns.nav) {
        ns.nav.trapFocus(panel, e);
      }
    });

    return api;
  }

  ns.overlay = { create: create, anyOpen: anyOpen };
})((window.NEXORA = window.NEXORA || {}));
