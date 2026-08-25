/**
 * NEXORA — navigation module
 * Sticky header state, mobile drawer with focus trapping, active-section
 * highlighting via IntersectionObserver, smooth scrolling and back-to-top.
 */
(function (ns) {
  "use strict";

  const header = document.getElementById("header");
  const drawer = document.getElementById("drawer");
  const burger = document.getElementById("burger");
  const toTop = document.getElementById("toTop");

  let lastFocused = null;

  const FOCUSABLE =
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

  /** Trap Tab within a container while it is open. */
  function trapFocus(container, e) {
    const items = Array.prototype.filter.call(container.querySelectorAll(FOCUSABLE), function (el) {
      return el.offsetParent !== null;
    });
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openDrawer() {
    if (!drawer) return;
    lastFocused = document.activeElement;
    drawer.classList.add("is-open");
    drawer.removeAttribute("aria-hidden");
    burger.setAttribute("aria-expanded", "true");
    document.body.classList.add("is-locked");
    const closeBtn = drawer.querySelector("[data-drawer-close]");
    if (closeBtn) closeBtn.focus();
  }

  function closeDrawer() {
    if (!drawer || !drawer.classList.contains("is-open")) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("is-locked");
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function isDrawerOpen() {
    return !!drawer && drawer.classList.contains("is-open");
  }

  /** Smooth scroll to a section, accounting for the sticky header height. */
  function scrollToId(id) {
    const target = document.getElementById(id);
    if (!target) return false;
    const reduced = ns.animations && ns.animations.prefersReduced();
    const top = target.getBoundingClientRect().top + window.scrollY - (header ? header.offsetHeight + 12 : 0);
    window.scrollTo({ top: top, behavior: reduced ? "auto" : "smooth" });
    // Move keyboard focus with the visual scroll for screen-reader parity.
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    return true;
  }

  function initStickyHeader() {
    if (!header) return;
    let ticking = false;
    function update() {
      const y = window.scrollY;
      header.classList.toggle("is-scrolled", y > 12);
      if (toTop) toTop.classList.toggle("is-visible", y > 600);
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }

  /** Highlight the nav item matching the section currently in view. */
  function initActiveSection() {
    const sections = document.querySelectorAll("main section[id]");
    const links = document.querySelectorAll("[data-nav-link]");
    if (!sections.length || !("IntersectionObserver" in window)) return;

    const visible = new Map();
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        });
        let bestId = null;
        let best = 0;
        visible.forEach(function (ratio, id) {
          if (ratio > best) {
            best = ratio;
            bestId = id;
          }
        });
        if (!bestId) return;
        links.forEach(function (link) {
          const on = link.getAttribute("data-nav-link") === bestId;
          link.classList.toggle("is-active", on);
          if (on) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      },
      { threshold: [0.1, 0.25, 0.5, 0.75], rootMargin: "-15% 0px -45% 0px" }
    );
    sections.forEach(function (s) {
      io.observe(s);
    });
  }

  function init() {
    initStickyHeader();
    initActiveSection();

    if (burger) burger.addEventListener("click", function () {
      isDrawerOpen() ? closeDrawer() : openDrawer();
    });

    if (drawer) {
      drawer.addEventListener("click", function (e) {
        if (e.target.hasAttribute("data-drawer-close") || e.target.closest("[data-drawer-close]")) closeDrawer();
      });
      drawer.addEventListener("keydown", function (e) {
        if (e.key === "Tab") trapFocus(drawer.querySelector(".drawer__panel"), e);
      });
    }

    // Event delegation: every in-page anchor scrolls smoothly and closes the drawer.
    document.addEventListener("click", function (e) {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute("href").slice(1);
      if (!id) return;
      if (scrollToId(id)) {
        e.preventDefault();
        history.replaceState(null, "", "#" + id);
        closeDrawer();
      }
    });

    if (toTop) {
      toTop.addEventListener("click", function () {
        const reduced = ns.animations && ns.animations.prefersReduced();
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
        const brand = document.querySelector(".header .brand");
        if (brand) brand.focus({ preventScroll: true });
      });
    }

    // Global Escape handling for the drawer (modal/search handle their own).
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isDrawerOpen()) closeDrawer();
    });
  }

  ns.nav = { init: init, closeDrawer: closeDrawer, scrollToId: scrollToId, trapFocus: trapFocus, FOCUSABLE: FOCUSABLE };
})((window.NEXORA = window.NEXORA || {}));
