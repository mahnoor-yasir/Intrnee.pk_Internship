/**
 * NEXORA — hash router
 * Gives every deep-linkable surface a real URL so the browser back button
 * behaves logically: #/work/finora, #/services/frontend, #/insights/a1,
 * #/pricing, #/checkout/professional, #/dashboard, #/saved, #/inquiry.
 * Hash routing keeps the site working from index.html without a server.
 */
(function (ns) {
  "use strict";

  const D = window.NEXORA_DATA;

  const SECTIONS = {
    home: "hero",
    services: "services",
    solutions: "solutions",
    work: "work",
    process: "process",
    technology: "tech",
    tech: "tech",
    pricing: "pricing",
    faq: "faq",
    insights: "insights",
    contact: "contact",
    testimonials: "testimonials",
    about: "about",
  };

  let applying = false;
  let current = "";

  function path() {
    const hash = location.hash || "";
    return hash.indexOf("#/") === 0 ? hash.slice(1) : "";
  }

  function go(route) {
    const next = "#" + route;
    if (location.hash === next) {
      handle();
      return;
    }
    location.hash = next;
  }

  /** Return to the previous entry when the given route is still current. */
  function leave(route) {
    if (applying) return;
    if (location.hash === "#" + route) {
      if (history.length > 1) history.back();
      else history.replaceState(null, "", location.pathname + location.search);
    }
  }

  function closeTransient() {
    if (ns.modal && ns.modal.isOpen()) ns.modal.close(true);
    if (ns.checkout) ns.checkout.close();
  }

  function handle() {
    const p = path();
    if (p === current) return;
    current = p;
    applying = true;
    try {
      const parts = p.split("/").filter(Boolean);
      const head = parts[0] || "";
      const id = parts[1] || "";

      if (!head) {
        closeTransient();
        applying = false;
        return;
      }

      switch (head) {
        case "work": {
          if (!id) {
            ns.nav.scrollToId("work");
            break;
          }
          const project = D.projects.filter(function (x) {
            return x.id === id;
          })[0];
          if (project) ns.openProject(project);
          else ns.nav.scrollToId("work");
          break;
        }
        case "services": {
          if (!id) {
            ns.nav.scrollToId("services");
            break;
          }
          const service = D.services.filter(function (x) {
            return x.id === id;
          })[0];
          if (service) ns.openServiceModal(service);
          else ns.nav.scrollToId("services");
          break;
        }
        case "insights": {
          if (!id) {
            ns.nav.scrollToId("insights");
            break;
          }
          const article = D.articles.filter(function (x) {
            return x.id === id;
          })[0];
          if (article) ns.openArticle(article);
          else ns.nav.scrollToId("insights");
          break;
        }
        case "checkout": {
          ns.checkout.open(id || "professional");
          break;
        }
        case "dashboard": {
          ns.dashboard.open(id);
          break;
        }
        case "saved": {
          ns.saved.open();
          break;
        }
        case "preferences": {
          ns.prefs.open();
          break;
        }
        case "inquiry": {
          ns.inquiry.open();
          break;
        }
        default: {
          const section = SECTIONS[head];
          if (section) {
            closeTransient();
            ns.nav.scrollToId(section);
          }
          break;
        }
      }
    } catch (err) {
      console.error("[NEXORA] routing error", err);
    }
    applying = false;
  }

  /** Called by the shared modal when it closes so history stays in sync. */
  function onModalClosed() {
    if (applying) return;
    const p = path();
    if (/^\/(work|services|insights)\/.+/.test(p)) leave(p);
  }

  function init() {
    window.addEventListener("hashchange", handle);
    if (path()) setTimeout(handle, 400);
  }

  ns.router = { init: init, go: go, leave: leave, handle: handle, onModalClosed: onModalClosed, path: path };
})((window.NEXORA = window.NEXORA || {}));
