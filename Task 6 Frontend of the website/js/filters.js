/**
 * NEXORA — filtering module
 * Category filtering for case studies and insights, including empty states.
 */
(function (ns) {
  "use strict";

  const D = window.NEXORA_DATA;
  const icon = ns.icon;
  const esc = ns.esc;

  /* ---------------- Case studies ---------------- */

  function workCard(p) {
    return (
      '<button class="card work-card" type="button" data-project="' +
      esc(p.id) +
      '"><span class="work-card__media"><img src="' +
      esc(p.image) +
      '" alt="Abstract visual representing the ' +
      esc(p.title) +
      ' case study" loading="lazy" decoding="async" width="800" height="500"></span>' +
      '<span class="work-card__body"><span class="meta-row"><span class="pill pill--accent">' +
      esc(p.category) +
      "</span></span><h3>" +
      esc(p.title) +
      " — " +
      esc(p.subtitle) +
      "</h3><p>" +
      esc(p.description) +
      '</p><span class="tag-row">' +
      p.tech.map((t) => '<span class="tag">' + esc(t) + "</span>").join("") +
      '</span><span class="work-card__row"><span class="counter">' +
      esc(p.results) +
      '</span><span class="link-arrow" aria-hidden="true">View case study ' +
      icon("arrowRight", 16) +
      "</span></span></span></button>"
    );
  }

  function openProject(p) {
    ns.modal.open(
      '<button class="icon-btn modal__close" type="button" data-modal-close aria-label="Close case study">' +
        icon("close", 18) +
        '</button><div class="modal__media"><img src="' +
        esc(p.image) +
        '" alt="Abstract visual representing the ' +
        esc(p.title) +
        ' case study" width="800" height="500"></div><span class="pill pill--accent">' +
        esc(p.category) +
        "</span><h3>" +
        esc(p.title) +
        " — " +
        esc(p.subtitle) +
        '</h3><div class="modal__section"><h4>Challenge</h4><p>' +
        esc(p.challenge) +
        '</p></div><div class="modal__section"><h4>Solution</h4><p>' +
        esc(p.solution) +
        '</p></div><div class="modal__section"><h4>Technologies</h4><div class="tag-row">' +
        p.tech.map((t) => '<span class="tag">' + esc(t) + "</span>").join("") +
        '</div></div><div class="modal__section"><h4>Timeline</h4><p>' +
        esc(p.timeline) +
        '</p></div><div class="modal__section"><h4>Results</h4><div class="metric-grid">' +
        p.metrics
          .map((m) => '<div class="metric"><strong>' + esc(m.value) + "</strong><span>" + esc(m.label) + "</span></div>")
          .join("") +
        '</div></div><div class="modal__section"><a class="btn btn--primary" href="#contact" data-modal-close>Start a similar project ' +
        icon("arrowRight", 16) +
        "</a></div>",
      p.title + " case study"
    );
  }
  ns.openProject = openProject;

  function initWork() {
    const grid = document.getElementById("workGrid");
    const tabs = document.getElementById("workFilters");
    const count = document.getElementById("workCount");
    if (!grid || !tabs) return;

    const cats = ["All"].concat(
      D.projects
        .map((p) => p.category)
        .filter(function (c, i, arr) {
          return arr.indexOf(c) === i;
        })
    );

    tabs.innerHTML = cats
      .map(function (c, i) {
        return (
          '<button class="tab' +
          (i === 0 ? " is-active" : "") +
          '" type="button" data-filter="' +
          esc(c) +
          '" aria-pressed="' +
          (i === 0) +
          '">' +
          esc(c) +
          "</button>"
        );
      })
      .join("");

    function paint(cat) {
      const list = cat === "All" ? D.projects : D.projects.filter((p) => p.category === cat);
      grid.innerHTML = list.length
        ? list.map(workCard).join("")
        : '<div class="empty-state"><strong>No case studies in this category yet</strong>New work is published regularly — try another filter or get in touch about your project.</div>';
      if (count) count.textContent = list.length + (list.length === 1 ? " project" : " projects");
      grid.classList.add("is-revealed");
    }

    tabs.addEventListener("click", function (e) {
      const b = e.target.closest("[data-filter]");
      if (!b) return;
      tabs.querySelectorAll(".tab").forEach(function (t) {
        t.classList.toggle("is-active", t === b);
        t.setAttribute("aria-pressed", String(t === b));
      });
      paint(b.dataset.filter);
    });

    grid.addEventListener("click", function (e) {
      const card = e.target.closest("[data-project]");
      if (!card) return;
      const p = D.projects.find((x) => x.id === card.dataset.project);
      if (p) openProject(p);
    });

    paint("All");
  }

  /* ---------------- Insights ---------------- */

  function articleCard(a) {
    return (
      '<button class="card article-card" type="button" data-article="' +
      esc(a.id) +
      '"><span class="article-card__media"><img src="' +
      esc(a.image) +
      '" alt="Abstract cover illustration for the article: ' +
      esc(a.title) +
      '" loading="lazy" decoding="async" width="800" height="500"></span><span class="article-card__body">' +
      '<span class="meta-row"><span class="pill pill--accent">' +
      esc(a.category) +
      '</span><span>' +
      esc(a.date) +
      '</span><span class="dot-sep" aria-hidden="true"></span><span>' +
      esc(a.read) +
      "</span></span><h3>" +
      esc(a.title) +
      "</h3><p>" +
      esc(a.excerpt) +
      '</p><span class="link-arrow" aria-hidden="true" style="margin-top:auto">Read article ' +
      icon("arrowRight", 16) +
      "</span></span></button>"
    );
  }

  function openArticle(a) {
    ns.modal.open(
      '<button class="icon-btn modal__close" type="button" data-modal-close aria-label="Close article">' +
        icon("close", 18) +
        '</button><div class="modal__media"><img src="' +
        esc(a.image) +
        '" alt="Abstract cover illustration for the article: ' +
        esc(a.title) +
        '" width="800" height="500"></div><span class="pill pill--accent">' +
        esc(a.category) +
        '</span><h3>' +
        esc(a.title) +
        '</h3><p class="meta-row" style="margin-top:10px">' +
        esc(a.date) +
        " · " +
        esc(a.read) +
        "</p>" +
        a.body.map((par) => '<p class="section-sub" style="margin-top:14px">' + esc(par) + "</p>").join("") +
        '<div class="modal__section"><a class="btn btn--ghost" href="#insights" data-modal-close>Back to insights</a></div>',
      a.title
    );
  }
  ns.openArticle = openArticle;

  function initInsights() {
    const grid = document.getElementById("insightsGrid");
    const tabs = document.getElementById("insightFilters");
    const count = document.getElementById("insightCount");
    if (!grid || !tabs) return;

    const cats = ["All"].concat(
      D.articles
        .map((a) => a.category)
        .filter(function (c, i, arr) {
          return arr.indexOf(c) === i;
        })
    );

    tabs.innerHTML = cats
      .map(function (c, i) {
        return (
          '<button class="tab' +
          (i === 0 ? " is-active" : "") +
          '" type="button" data-ifilter="' +
          esc(c) +
          '" aria-pressed="' +
          (i === 0) +
          '">' +
          esc(c) +
          "</button>"
        );
      })
      .join("");

    function paint(cat) {
      const list = cat === "All" ? D.articles : D.articles.filter((a) => a.category === cat);
      grid.innerHTML = list.length
        ? list.map(articleCard).join("")
        : '<div class="empty-state"><strong>Nothing published here yet</strong>We are still writing on this topic. Try another category in the meantime.</div>';
      if (count) count.textContent = list.length + (list.length === 1 ? " article" : " articles");
      grid.classList.add("is-revealed");
    }

    tabs.addEventListener("click", function (e) {
      const b = e.target.closest("[data-ifilter]");
      if (!b) return;
      tabs.querySelectorAll(".tab").forEach(function (t) {
        t.classList.toggle("is-active", t === b);
        t.setAttribute("aria-pressed", String(t === b));
      });
      paint(b.dataset.ifilter);
    });

    grid.addEventListener("click", function (e) {
      const card = e.target.closest("[data-article]");
      if (!card) return;
      const a = D.articles.find((x) => x.id === card.dataset.article);
      if (a) openArticle(a);
    });

    paint("All");
  }

  ns.filters = {
    init: function () {
      initWork();
      initInsights();
    },
  };
})((window.NEXORA = window.NEXORA || {}));
