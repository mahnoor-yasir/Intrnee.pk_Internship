/**
 * NEXORA — theme module
 * Dark/light theme with system-preference detection and localStorage persistence.
 */
(function (ns) {
  "use strict";

  const KEY = "nexora:theme";
  const root = document.documentElement;
  const media = window.matchMedia("(prefers-color-scheme: light)");

  function stored() {
    try {
      return localStorage.getItem(KEY);
    } catch (e) {
      return null; // private mode / storage disabled
    }
  }

  function persist(value) {
    try {
      localStorage.setItem(KEY, value);
    } catch (e) {
      /* storage unavailable — theme still applies for this session */
    }
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f6f7fb" : "#05070c");
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(theme === "light"));
      btn.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
      btn.innerHTML = ns.icon(theme === "light" ? "moon" : "sun", 18);
    });
  }

  function current() {
    return root.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function init() {
    const saved = stored();
    apply(saved || (media.matches ? "light" : "dark"));

    // Follow the OS only while the user has not made an explicit choice.
    const onSystemChange = function (e) {
      if (!stored()) apply(e.matches ? "light" : "dark");
    };
    if (media.addEventListener) media.addEventListener("change", onSystemChange);
    else if (media.addListener) media.addListener(onSystemChange);

    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const next = current() === "light" ? "dark" : "light";
        apply(next);
        persist(next);
        ns.toast({
          kind: "info",
          title: next === "light" ? "Light theme enabled" : "Dark theme enabled",
          message: "Your preference is saved on this device.",
        });
      });
    });
  }

  /**
   * Apply a stored preference of "system" | "dark" | "light".
   * "system" clears the explicit choice so the OS setting takes over again.
   */
  function applyPreference(pref) {
    if (pref === "light" || pref === "dark") {
      apply(pref);
      persist(pref);
      return;
    }
    try {
      localStorage.removeItem(KEY);
    } catch (e) {
      /* ignore */
    }
    apply(media.matches ? "light" : "dark");
  }

  ns.theme = { init: init, apply: apply, applyPreference: applyPreference, current: current, KEY: KEY };

})((window.NEXORA = window.NEXORA || {}));
