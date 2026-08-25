/**
 * NEXORA — preferences panel and saved-articles view
 * Non-sensitive interface preferences persisted in localStorage, plus the
 * bookmarked-article library with its own empty state.
 */
(function (ns) {
  "use strict";

  const D = window.NEXORA_DATA;
  const esc = ns.esc;
  const store = ns.store;

  let prefsOv = null;
  let savedOv = null;

  /* ------------------------------ Apply prefs --------------------------- */

  function apply() {
    const prefs = store.getPrefs();
    const root = document.documentElement;
    root.setAttribute("data-reduced-motion", String(!!prefs.reducedMotion));
    document.body.classList.toggle("is-compact", !!prefs.compactCards);
    if (ns.theme && ns.theme.applyPreference) ns.theme.applyPreference(prefs.theme);
  }

  /* --------------------------- Preferences panel ------------------------ */

  function prefsMarkup() {
    const prefs = store.getPrefs();
    function toggleRow(key, label, desc) {
      return (
        '<div class="pref-row"><div><strong>' +
        esc(label) +
        '</strong><p class="counter">' +
        esc(desc) +
        '</p></div><button class="switch" type="button" role="switch" aria-checked="' +
        String(!!prefs[key]) +
        '" data-pref="' +
        key +
        '"><span class="sr-only">' +
        esc(label) +
        "</span></button></div>"
      );
    }
    return (
      '<div class="ov__head"><div><span class="pill pill--accent">Preferences</span><h2 class="ov__title">Your interface</h2>' +
      '<p class="counter">Saved to this browser only. Nothing is transmitted.</p></div>' +
      '<button class="icon-btn" type="button" data-ov-close aria-label="Close preferences">' +
      ns.icon("close", 18) +
      '</button></div><div class="ov__body"><section class="panel">' +
      '<div class="pref-row"><div><strong>Theme</strong><p class="counter">System follows your device setting.</p></div><div class="seg">' +
      ["system", "dark", "light"]
        .map(function (t) {
          return (
            '<button class="seg__btn' +
            (prefs.theme === t ? " is-active" : "") +
            '" type="button" data-theme-pref="' +
            t +
            '" aria-pressed="' +
            String(prefs.theme === t) +
            '">' +
            t.charAt(0).toUpperCase() +
            t.slice(1) +
            "</button>"
          );
        })
        .join("") +
      "</div></div>" +
      toggleRow("reducedMotion", "Reduced motion", "Turn off non-essential animation and autoplay.") +
      toggleRow("newsletter", "Newsletter subscription", "Monthly frontend note (simulated).") +
      toggleRow("compactCards", "Compact cards", "Tighter spacing across card grids.") +
      toggleRow("autoplayCarousel", "Autoplay testimonials", "Advance the testimonial carousel automatically.") +
      "</section>" +
      '<section class="panel"><h3>Saved articles</h3><p class="counter">' +
      store.getBookmarks().length +
      ' bookmarked.</p><button class="btn btn--ghost btn--sm" type="button" data-open-saved>Open Saved Articles</button></section>' +
      '<section class="panel"><h3>Local data</h3><p class="counter">Clear every locally stored demo value.</p>' +
      '<button class="btn btn--quiet btn--sm" type="button" data-clear-local>Clear saved data</button></section></div>'
    );
  }

  function renderPrefs() {
    prefsOv.setContent(prefsMarkup());
  }

  function openPrefs() {
    if (!prefsOv) {
      prefsOv = ns.overlay.create({ id: "prefsOverlay", label: "Preferences", variant: "side" });
      prefsOv.panel.addEventListener("click", function (e) {
        const themePref = e.target.closest("[data-theme-pref]");
        if (themePref) {
          store.setPref("theme", themePref.dataset.themePref);
          apply();
          store.logActivity("Changed theme", themePref.dataset.themePref);
          ns.toast({ kind: "info", title: "Theme updated", message: "Using the " + themePref.dataset.themePref + " appearance." });
          renderPrefs();
          return;
        }
        const pref = e.target.closest("[data-pref]");
        if (pref) {
          const key = pref.dataset.pref;
          const value = pref.getAttribute("aria-checked") !== "true";
          store.setPref(key, value);
          apply();
          if (key === "newsletter") {
            ns.toast({
              kind: value ? "success" : "info",
              title: value ? "Newsletter subscribed" : "Newsletter unsubscribed",
              message: value ? "You are on the monthly list (simulated)." : "You will no longer receive the note.",
            });
          } else {
            ns.toast({ kind: "success", title: "Preferences updated", message: "Your choice is saved on this device." });
          }
          store.logActivity("Updated preference", key + ": " + (value ? "on" : "off"));
          renderPrefs();
          return;
        }
        if (e.target.closest("[data-open-saved]")) {
          prefsOv.close(true);
          ns.router.go("/saved");
          return;
        }
        if (e.target.closest("[data-clear-local]")) {
          store.clearAll();
          apply();
          ns.toast({ kind: "info", title: "Saved data cleared", message: "All local demo state was removed." });
          renderPrefs();
        }
      });
      prefsOv.onClose(function () {
        ns.router.leave("/preferences");
      });
      store.subscribe(function () {
        if (prefsOv.isOpen()) renderPrefs();
      });
    }
    renderPrefs();
    prefsOv.open();
  }

  /* ---------------------------- Saved articles -------------------------- */

  function savedMarkup() {
    const ids = store.getBookmarks();
    const list = D.articles.filter(function (a) {
      return ids.indexOf(a.id) > -1;
    });
    return (
      '<div class="ov__head"><div><span class="pill pill--accent">Library</span><h2 class="ov__title">Saved Articles</h2>' +
      '<p class="counter">' +
      (list.length ? list.length + (list.length === 1 ? " article saved" : " articles saved") : "Nothing saved yet") +
      '</p></div><button class="icon-btn" type="button" data-ov-close aria-label="Close saved articles">' +
      ns.icon("close", 18) +
      '</button></div><div class="ov__body">' +
      (list.length
        ? '<ul class="saved-list">' +
          list
            .map(function (a) {
              return (
                '<li class="saved-item"><img src="' +
                esc(a.image) +
                '" alt="" width="120" height="80" loading="lazy"><div><span class="pill pill--accent">' +
                esc(a.category) +
                "</span><strong>" +
                esc(a.title) +
                '</strong><p class="counter">' +
                esc(a.date) +
                " · " +
                esc(a.read) +
                '</p></div><div class="saved-item__actions">' +
                '<button class="btn btn--ghost btn--sm" type="button" data-open-article="' +
                esc(a.id) +
                '">Read Article</button>' +
                '<button class="btn btn--quiet btn--sm" type="button" data-remove-bookmark="' +
                esc(a.id) +
                '">Remove</button></div></li>'
              );
            })
            .join("") +
          "</ul>"
        : '<div class="empty-state"><strong>No saved articles</strong>Open any article from Insights and choose Bookmark to build your library.' +
          '<div class="ov__actions ov__actions--center"><button class="btn btn--primary" type="button" data-goto-insights data-autofocus>Browse Insights</button></div></div>') +
      "</div>"
    );
  }

  function renderSaved() {
    savedOv.setContent(savedMarkup());
  }

  function openSaved() {
    if (!savedOv) {
      savedOv = ns.overlay.create({ id: "savedOverlay", label: "Saved articles", variant: "sheet" });
      savedOv.panel.addEventListener("click", function (e) {
        const openBtn = e.target.closest("[data-open-article]");
        if (openBtn) {
          savedOv.close(true);
          ns.router.go("/insights/" + openBtn.dataset.openArticle);
          return;
        }
        const remove = e.target.closest("[data-remove-bookmark]");
        if (remove) {
          store.removeBookmark(remove.dataset.removeBookmark);
          ns.toast({ kind: "info", title: "Bookmark removed", message: "The article left your library." });
          renderSaved();
          return;
        }
        if (e.target.closest("[data-goto-insights]")) {
          savedOv.close(true);
          ns.router.go("/insights");
        }
      });
      savedOv.onClose(function () {
        ns.router.leave("/saved");
      });
      store.subscribe(function () {
        if (savedOv.isOpen()) renderSaved();
      });
    }
    renderSaved();
    savedOv.open();
  }

  function init() {
    apply();
    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-open-prefs]")) {
        e.preventDefault();
        ns.router.go("/preferences");
      }
      if (e.target.closest("[data-open-saved-global]")) {
        e.preventDefault();
        ns.router.go("/saved");
      }
      if (e.target.closest("[data-open-dashboard-global]")) {
        e.preventDefault();
        ns.router.go("/dashboard");
      }
    });
  }

  ns.prefs = { init: init, apply: apply, open: openPrefs };
  ns.saved = { open: openSaved };
})((window.NEXORA = window.NEXORA || {}));
