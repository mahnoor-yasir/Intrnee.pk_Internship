/**
 * NEXORA — global search / command interface
 * Ctrl+K (or Cmd+K) opens a searchable index of services, projects, articles
 * and FAQs. Escape closes. Results highlight the matched query.
 */
(function (ns) {
  "use strict";

  const D = window.NEXORA_DATA;
  const esc = ns.esc;

  const root = document.getElementById("search");
  const input = document.getElementById("searchInput");
  const results = document.getElementById("searchResults");
  const countEl = document.getElementById("searchCount");
  let lastFocused = null;
  let index = [];
  let active = 0;

  function buildIndex() {
    index = [];
    D.services.forEach(function (s) {
      index.push({ kind: "Service", title: s.title, sub: s.short, act: function () { ns.openServiceModal(s); } });
    });
    D.solutions.forEach(function (s) {
      index.push({
        kind: "Solution",
        title: s.name,
        sub: s.headline,
        act: function () {
          ns.nav.scrollToId("solutions");
          const tab = document.querySelector('[data-solution="' + s.id + '"]');
          if (tab) tab.click();
        },
      });
    });
    D.projects.forEach(function (p) {
      index.push({
        kind: "Case study",
        title: p.title + " — " + p.subtitle,
        sub: p.description,
        act: function () { ns.openProject(p); },
      });
    });
    D.articles.forEach(function (a) {
      index.push({ kind: "Article", title: a.title, sub: a.excerpt, act: function () { ns.openArticle(a); } });
    });
    D.faqs.forEach(function (f, i) {
      index.push({
        kind: "FAQ",
        title: f.q,
        sub: f.a,
        act: function () {
          ns.nav.scrollToId("faq");
          setTimeout(function () { ns.openFaq(i); }, 320);
        },
      });
    });
  }

  function highlight(text, q) {
    const safe = esc(text);
    if (!q) return safe;
    const i = safe.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return safe;
    return safe.slice(0, i) + "<mark>" + safe.slice(i, i + q.length) + "</mark>" + safe.slice(i + q.length);
  }

  function render(q) {
    const query = q.trim();
    const matches = !query
      ? index.slice(0, 8)
      : index.filter(function (item) {
          return (item.title + " " + item.sub + " " + item.kind).toLowerCase().includes(query.toLowerCase());
        });

    active = 0;
    countEl.textContent = !query
      ? "Suggested — type to search services, work, insights and FAQs"
      : matches.length + (matches.length === 1 ? " result" : " results") + ' for "' + esc(query) + '"';

    if (!matches.length) {
      results.innerHTML =
        '<div class="empty-state" style="border:0;padding:32px 16px"><strong>No matches found</strong>Try a broader term such as “React”, “performance” or “accessibility”.</div>';
      return;
    }

    results.innerHTML = matches
      .map(function (m, i) {
        return (
          '<button class="search__item' +
          (i === 0 ? " is-active" : "") +
          '" type="button" data-i="' +
          i +
          '"><span class="search__kind">' +
          esc(m.kind) +
          "</span><span><span>" +
          highlight(m.title, query) +
          "</span><small>" +
          highlight(m.sub.slice(0, 110) + (m.sub.length > 110 ? "…" : ""), query) +
          "</small></span></button>"
        );
      })
      .join("");

    results._matches = matches;
  }

  function setActive(next) {
    const items = results.querySelectorAll(".search__item");
    if (!items.length) return;
    active = (next + items.length) % items.length;
    items.forEach(function (el, i) {
      el.classList.toggle("is-active", i === active);
    });
    items[active].scrollIntoView({ block: "nearest" });
  }

  function run(i) {
    const m = (results._matches || [])[i];
    if (!m) return;
    close();
    setTimeout(m.act, 220);
  }

  function open() {
    if (!root) return;
    lastFocused = document.activeElement;
    root.classList.add("is-open");
    root.removeAttribute("aria-hidden");
    document.body.classList.add("is-locked");
    input.value = "";
    render("");
    input.focus();
  }

  function close() {
    if (!root || !root.classList.contains("is-open")) return;
    root.classList.remove("is-open");
    root.setAttribute("aria-hidden", "true");
    if (!ns.modal.isOpen()) document.body.classList.remove("is-locked");
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function isOpen() {
    return !!root && root.classList.contains("is-open");
  }

  function init() {
    if (!root) return;
    buildIndex();

    document.querySelectorAll("[data-search-open]").forEach(function (btn) {
      btn.addEventListener("click", open);
    });

    root.addEventListener("click", function (e) {
      if (e.target.hasAttribute("data-search-close")) close();
      const item = e.target.closest("[data-i]");
      if (item) run(parseInt(item.dataset.i, 10));
    });

    input.addEventListener("input", ns.debounce(function () { render(input.value); }, 140));

    root.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive(active + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive(active - 1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        run(active);
      } else if (e.key === "Tab") {
        ns.nav.trapFocus(root.querySelector(".search__panel"), e);
      }
    });

    document.addEventListener("keydown", function (e) {
      const k = e.key ? e.key.toLowerCase() : "";
      if ((e.ctrlKey || e.metaKey) && k === "k") {
        e.preventDefault();
        isOpen() ? close() : open();
      }
      if (e.key === "/" && !isOpen() && !/^(input|textarea|select)$/i.test(document.activeElement.tagName)) {
        e.preventDefault();
        open();
      }
    });
  }

  ns.search = { init: init, open: open, close: close, isOpen: isOpen };
})((window.NEXORA = window.NEXORA || {}));
