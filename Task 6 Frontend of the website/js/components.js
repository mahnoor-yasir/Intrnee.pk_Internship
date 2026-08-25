/**
 * NEXORA — reusable UI components
 * Toasts, an accessible modal, accordion, carousel, tabs, process timeline,
 * pricing toggle and every data-driven section renderer.
 */
(function (ns) {
  "use strict";

  const D = window.NEXORA_DATA;
  const icon = ns.icon;
  const $ = function (sel, ctx) {
    return (ctx || document).querySelector(sel);
  };

  /* --------------------------------------------------------------------- */
  /* Utilities                                                              */
  /* --------------------------------------------------------------------- */

  /** Escape user/data strings before inserting them into markup. */
  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  ns.esc = esc;

  /** Simple debounce for expensive handlers (search input, resize). */
  function debounce(fn, wait) {
    let t;
    return function () {
      const args = arguments;
      const ctx = this;
      clearTimeout(t);
      t = setTimeout(function () {
        fn.apply(ctx, args);
      }, wait || 180);
    };
  }
  ns.debounce = debounce;

  /* --------------------------------------------------------------------- */
  /* Toasts                                                                 */
  /* --------------------------------------------------------------------- */

  function toast(opts) {
    const host = document.getElementById("toasts");
    if (!host) return;
    const kind = opts.kind || "info";
    const el = document.createElement("div");
    el.className = "toast toast--" + kind;
    el.setAttribute("role", kind === "error" ? "alert" : "status");
    el.innerHTML =
      '<span class="toast__icon">' +
      icon(kind === "success" ? "check-circle" : kind === "error" ? "alert" : "info", 18) +
      "</span><div><strong>" +
      esc(opts.title) +
      "</strong><span>" +
      esc(opts.message || "") +
      "</span></div>";
    host.appendChild(el);
    const remove = function () {
      el.classList.add("is-leaving");
      setTimeout(function () {
        el.remove();
      }, 300);
    };
    setTimeout(remove, opts.duration || 4200);
    el.addEventListener("click", remove);
  }
  ns.toast = toast;

  /* --------------------------------------------------------------------- */
  /* Modal                                                                  */
  /* --------------------------------------------------------------------- */

  const modal = (function () {
    const root = document.getElementById("modal");
    const dialog = root ? root.querySelector(".modal__dialog") : null;
    const content = document.getElementById("modalContent");
    let lastFocused = null;

    function open(html, label) {
      if (!root) return;
      lastFocused = document.activeElement;
      content.innerHTML = html;
      root.classList.add("is-open");
      root.removeAttribute("aria-hidden");
      root.setAttribute("aria-label", label || "Details");
      document.body.classList.add("is-locked");
      const closeBtn = root.querySelector(".modal__close");
      if (closeBtn) closeBtn.focus();
      dialog.scrollTop = 0;
    }

    function close() {
      if (!root || !root.classList.contains("is-open")) return;
      root.classList.remove("is-open");
      root.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-locked");
      // Clear after the exit transition so content does not flash away.
      setTimeout(function () {
        if (!root.classList.contains("is-open")) content.innerHTML = "";
      }, 300);
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    function isOpen() {
      return !!root && root.classList.contains("is-open");
    }

    if (root) {
      root.addEventListener("click", function (e) {
        if (e.target.hasAttribute("data-modal-close") || e.target.closest("[data-modal-close]")) close();
      });
      root.addEventListener("keydown", function (e) {
        if (e.key === "Tab") ns.nav.trapFocus(dialog, e);
      });
    }
    return { open: open, close: close, isOpen: isOpen };
  })();
  ns.modal = modal;

  /* --------------------------------------------------------------------- */
  /* Section renderers                                                      */
  /* --------------------------------------------------------------------- */

  function renderServices() {
    const host = document.getElementById("servicesGrid");
    if (!host) return;
    host.innerHTML = D.services
      .map(function (s) {
        return (
          '<article class="card"><div class="card__icon">' +
          icon(s.icon, 22) +
          "</div><h3>" +
          esc(s.title) +
          "</h3><p>" +
          esc(s.short) +
          '</p><ul class="feature-list">' +
          s.features.map((f) => "<li>" + esc(f) + "</li>").join("") +
          '</ul><button class="link-arrow" type="button" data-service="' +
          esc(s.id) +
          '">Learn more <span aria-hidden="true">' +
          icon("arrowRight", 16) +
          "</span><span class=\"sr-only\">about " +
          esc(s.title) +
          "</span></button></article>"
        );
      })
      .join("");

    host.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-service]");
      if (!btn) return;
      const s = D.services.find((x) => x.id === btn.dataset.service);
      if (!s) return;
      openServiceModal(s);
    });
  }

  function openServiceModal(s) {
    modal.open(
      '<button class="icon-btn modal__close" type="button" data-modal-close aria-label="Close dialog">' +
        icon("close", 18) +
        '</button><span class="pill pill--accent">Service</span><h3 id="modalTitle">' +
        esc(s.title) +
        '</h3><p class="section-sub" style="margin-top:12px">' +
        esc(s.detail) +
        '</p><div class="modal__section"><h4>What you get</h4><ul class="feature-list">' +
        s.deliverables.map((d) => "<li>" + esc(d) + "</li>").join("") +
        '</ul></div><div class="modal__section"><h4>Focus areas</h4><div class="tag-row">' +
        s.features.map((f) => '<span class="tag">' + esc(f) + "</span>").join("") +
        '</div></div><div class="modal__section"><a class="btn btn--primary" href="#contact" data-modal-close>Discuss this service ' +
        icon("arrowRight", 16) +
        "</a></div>",
      s.title + " service details"
    );
  }
  ns.openServiceModal = openServiceModal;

  function renderSolutions() {
    const tabsHost = document.getElementById("solutionTabs");
    const panel = document.getElementById("solutionPanel");
    if (!tabsHost || !panel) return;

    tabsHost.innerHTML = D.solutions
      .map(function (s, i) {
        return (
          '<button class="tab" type="button" role="tab" id="soltab-' +
          s.id +
          '" aria-controls="solutionPanel" aria-selected="' +
          (i === 0) +
          '" data-solution="' +
          esc(s.id) +
          '">' +
          esc(s.name) +
          "</button>"
        );
      })
      .join("");

    function paint(id) {
      const s = D.solutions.find((x) => x.id === id) || D.solutions[0];
      panel.setAttribute("aria-labelledby", "soltab-" + s.id);
      panel.innerHTML =
        '<div class="card" style="padding:var(--s-6)"><div class="grid grid-2" style="align-items:center">' +
        "<div><h3 style=\"font-size:1.6rem;margin-bottom:10px\">" +
        esc(s.headline) +
        "</h3><p>" +
        esc(s.body) +
        '</p><ul class="feature-list">' +
        s.points.map((p) => "<li>" + esc(p) + "</li>").join("") +
        '</ul><a class="link-arrow" href="#contact">Start a ' +
        esc(s.name.toLowerCase()) +
        ' project <span aria-hidden="true">' +
        icon("arrowRight", 16) +
        '</span></a></div><div class="stat" style="text-align:center"><div class="stat__value">' +
        esc(s.stat.value) +
        '</div><div class="stat__label">' +
        esc(s.stat.label) +
        "</div></div></div></div>";
      panel.classList.remove("is-revealed");
      // restart the reveal transition for the swapped content
      void panel.offsetWidth;
      panel.classList.add("is-revealed");
    }

    tabsHost.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-solution]");
      if (!btn) return;
      tabsHost.querySelectorAll(".tab").forEach(function (t) {
        t.setAttribute("aria-selected", String(t === btn));
      });
      paint(btn.dataset.solution);
    });

    // Arrow-key support for the tablist (WAI-ARIA pattern).
    tabsHost.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const tabs = Array.prototype.slice.call(tabsHost.querySelectorAll(".tab"));
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      next.focus();
      next.click();
    });

    paint(D.solutions[0].id);
  }

  function renderProcess() {
    const steps = document.getElementById("processSteps");
    const detail = document.getElementById("processDetail");
    if (!steps || !detail) return;

    steps.innerHTML = D.processSteps
      .map(function (s, i) {
        return (
          '<button class="process__step" type="button" role="tab" aria-controls="processDetail" aria-selected="' +
          (i === 0) +
          '" data-step="' +
          s.num +
          '"><span class="process__num">' +
          s.num +
          "</span><span><strong>" +
          esc(s.name) +
          "</strong></span></button>"
        );
      })
      .join("");

    function paint(num) {
      const s = D.processSteps.find((x) => x.num === num) || D.processSteps[0];
      detail.innerHTML =
        '<span class="pill pill--accent">Stage ' +
        s.num +
        ' · ' +
        esc(s.duration) +
        "</span><h3 style=\"margin-top:14px\">" +
        esc(s.name) +
        '</h3><p class="section-sub" style="margin-top:8px">' +
        esc(s.body) +
        '</p><ul class="feature-list">' +
        s.points.map((p) => "<li>" + esc(p) + "</li>").join("") +
        "</ul>";
    }

    steps.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-step]");
      if (!btn) return;
      steps.querySelectorAll(".process__step").forEach(function (b) {
        b.setAttribute("aria-selected", String(b === btn));
      });
      paint(btn.dataset.step);
    });

    paint(D.processSteps[0].num);
  }

  function renderTech() {
    const host = document.getElementById("techGrid");
    if (!host) return;
    host.innerHTML = D.technologies
      .map(function (t) {
        return (
          '<article class="card tech-card"><div class="card__icon">' +
          icon(t.icon, 20) +
          "</div><div><h3>" +
          esc(t.name) +
          "</h3><p>" +
          esc(t.desc) +
          "</p></div></article>"
        );
      })
      .join("");
  }

  function renderValues() {
    const host = document.getElementById("valueGrid");
    if (!host) return;
    host.innerHTML = D.values
      .map(function (v) {
        return (
          '<article class="card value-card"><span class="value-card__check">' +
          icon("check", 14) +
          "</span><div><h3>" +
          esc(v.title) +
          "</h3><p>" +
          esc(v.desc) +
          "</p></div></article>"
        );
      })
      .join("");
  }

  function renderStats() {
    const host = document.getElementById("statGrid");
    if (host) {
      host.innerHTML = D.stats
        .map(function (s) {
          return (
            '<div class="stat"><div class="stat__value"><span data-count="' +
            s.value +
            '" data-suffix="' +
            esc(s.suffix) +
            '">0</span></div><div class="stat__label">' +
            esc(s.label) +
            "</div></div>"
          );
        })
        .join("");
    }
    const big = document.getElementById("bigStats");
    if (big) {
      big.innerHTML = D.bigStats
        .map(function (s) {
          return (
            '<div class="stat" style="text-align:center"><div class="stat__value"><span data-count="' +
            s.value +
            '" data-decimals="' +
            (s.decimals || 0) +
            '" data-suffix="' +
            esc(s.suffix) +
            '">0</span></div><div class="stat__label">' +
            esc(s.label) +
            "</div></div>"
          );
        })
        .join("");
    }
  }

  /* --------------------------------------------------------------------- */
  /* Testimonials carousel                                                  */
  /* --------------------------------------------------------------------- */

  function renderTestimonials() {
    const track = document.getElementById("carouselTrack");
    const dots = document.getElementById("carouselDots");
    const prev = document.getElementById("carouselPrev");
    const next = document.getElementById("carouselNext");
    const playBtn = document.getElementById("carouselPlay");
    const region = document.getElementById("testimonialCarousel");
    if (!track) return;

    const items = D.testimonials;
    let index = 0;
    let timer = null;
    let playing = true;

    track.innerHTML = items
      .map(function (t, i) {
        return (
          '<div class="carousel__slide" role="group" aria-roledescription="slide" aria-label="' +
          (i + 1) +
          " of " +
          items.length +
          '"><div class="rating" aria-label="' +
          t.rating +
          ' out of 5">' +
          Array(t.rating).fill(icon("star", 16)).join("") +
          '</div><blockquote class="quote">“' +
          esc(t.quote) +
          '”</blockquote><div class="author"><span class="avatar" aria-hidden="true">' +
          esc(t.initials) +
          '</span><div><div class="author__name">' +
          esc(t.name) +
          '</div><div class="author__role">' +
          esc(t.role) +
          " · " +
          esc(t.company) +
          "</div></div></div></div>"
        );
      })
      .join("");

    dots.innerHTML = items
      .map(function (t, i) {
        return (
          '<button class="dot" type="button" data-slide="' +
          i +
          '" aria-current="' +
          (i === 0) +
          '"><span class="sr-only">Go to testimonial ' +
          (i + 1) +
          "</span></button>"
        );
      })
      .join("");

    function go(i) {
      index = (i + items.length) % items.length;
      track.style.transform = "translateX(" + -index * 100 + "%)";
      dots.querySelectorAll(".dot").forEach(function (d, di) {
        d.setAttribute("aria-current", String(di === index));
      });
    }

    function start() {
      stop();
      if (ns.animations.prefersReduced()) return;
      playing = true;
      timer = setInterval(function () {
        go(index + 1);
      }, 6000);
      updatePlayBtn();
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
      playing = false;
      updatePlayBtn();
    }

    function updatePlayBtn() {
      if (!playBtn) return;
      playBtn.setAttribute("aria-pressed", String(playing));
      playBtn.textContent = playing ? "Pause" : "Play";
      playBtn.setAttribute("aria-label", playing ? "Pause testimonial autoplay" : "Resume testimonial autoplay");
    }

    prev.addEventListener("click", function () {
      go(index - 1);
      stop();
    });
    next.addEventListener("click", function () {
      go(index + 1);
      stop();
    });
    dots.addEventListener("click", function (e) {
      const b = e.target.closest("[data-slide]");
      if (!b) return;
      go(parseInt(b.dataset.slide, 10));
      stop();
    });
    if (playBtn)
      playBtn.addEventListener("click", function () {
        playing ? stop() : start();
      });

    // Pause while hovered/focused, resume when the user leaves (if autoplaying).
    region.addEventListener("mouseenter", function () {
      if (timer) clearInterval(timer);
    });
    region.addEventListener("mouseleave", function () {
      if (playing) start();
    });
    region.addEventListener("focusin", stop);

    // Keyboard support on the carousel region.
    region.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        go(index - 1);
        stop();
      } else if (e.key === "ArrowRight") {
        go(index + 1);
        stop();
      }
    });

    // Touch swipe
    let x0 = null;
    track.addEventListener(
      "touchstart",
      function (e) {
        x0 = e.touches[0].clientX;
      },
      { passive: true }
    );
    track.addEventListener(
      "touchend",
      function (e) {
        if (x0 === null) return;
        const dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 45) {
          go(index + (dx < 0 ? 1 : -1));
          stop();
        }
        x0 = null;
      },
      { passive: true }
    );

    go(0);
    start();

    // Stop autoplay when the tab is hidden to avoid pointless work.
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (timer) clearInterval(timer);
      } else if (playing) start();
    });
  }

  /* --------------------------------------------------------------------- */
  /* Pricing                                                                */
  /* --------------------------------------------------------------------- */

  function renderPricing() {
    const host = document.getElementById("pricingGrid");
    const toggle = document.getElementById("billingToggle");
    if (!host) return;
    let yearly = false;

    function paint() {
      host.innerHTML = D.plans
        .map(function (p) {
          const price = yearly ? p.yearly : p.monthly;
          return (
            '<article class="card price-card' +
            (p.featured ? " is-featured" : "") +
            '">' +
            (p.featured ? '<span class="price-card__badge">Recommended</span>' : "") +
            "<h3>" +
            esc(p.name) +
            '</h3><p>' +
            esc(p.desc) +
            '</p><div class="price"><span class="price__amount">$' +
            price.toLocaleString("en-US") +
            '</span><span class="price__period">/ ' +
            (yearly ? "year" : "month") +
            '</span></div><p class="counter">' +
            (yearly ? "Two months free compared to monthly billing" : "Billed monthly, cancel any time") +
            '</p><ul class="feature-list">' +
            p.features.map((f) => "<li>" + esc(f) + "</li>").join("") +
            '</ul><a class="btn ' +
            (p.featured ? "btn--primary" : "btn--ghost") +
            ' btn--block" href="#contact" data-plan="' +
            esc(p.name) +
            '">' +
            esc(p.cta) +
            "</a></article>"
          );
        })
        .join("");
    }

    if (toggle) {
      toggle.addEventListener("click", function () {
        yearly = !yearly;
        toggle.setAttribute("aria-checked", String(yearly));
        paint();
        toast({
          kind: "info",
          title: yearly ? "Yearly pricing" : "Monthly pricing",
          message: yearly ? "Showing annual rates with two months free." : "Showing monthly rates.",
        });
      });
    }

    // Pre-fill the contact form's project type when a plan CTA is used.
    host.addEventListener("click", function (e) {
      const a = e.target.closest("[data-plan]");
      if (!a) return;
      const note = document.getElementById("planNote");
      if (note) note.textContent = "Selected plan: " + a.dataset.plan;
      const msg = document.getElementById("message");
      if (msg && !msg.value.trim()) {
        msg.value = "Hello NEXORA team, we are interested in the " + a.dataset.plan + " plan. ";
        msg.dispatchEvent(new Event("input"));
      }
    });

    paint();
  }

  /* --------------------------------------------------------------------- */
  /* FAQ accordion                                                          */
  /* --------------------------------------------------------------------- */

  function renderFaq() {
    const host = document.getElementById("faqAccordion");
    if (!host) return;
    const search = document.getElementById("faqSearch");
    const count = document.getElementById("faqCount");

    function itemHtml(f, i) {
        return (
          '<div class="acc-item"><h3 style="margin:0"><button class="acc-trigger" type="button" id="faq-t-' +
          i +
          '" aria-expanded="false" aria-controls="faq-p-' +
          i +
          '"><span>' +
          esc(f.q) +
          '</span><span class="acc-icon" aria-hidden="true"></span></button></h3>' +
          '<div class="acc-panel" id="faq-p-' +
          i +
          '" role="region" aria-labelledby="faq-t-' +
          i +
          '"><div><p>' +
          esc(f.a) +
          "</p></div></div></div>"
        );
    }

    function paint(query) {
      const q = String(query || "").trim().toLowerCase();
      const list = D.faqs
        .map(function (f, i) {
          return { f: f, i: i };
        })
        .filter(function (row) {
          return !q || (row.f.q + " " + row.f.a).toLowerCase().indexOf(q) > -1;
        });
      host.innerHTML = list.length
        ? list
            .map(function (row) {
              return itemHtml(row.f, row.i);
            })
            .join("")
        : '<div class="empty-state"><strong>No answers match “' +
          esc(q) +
          '”</strong>Try a different word, or ask us directly from the contact section.</div>';
      if (count) {
        count.textContent = list.length + (list.length === 1 ? " question" : " questions");
      }
    }

    if (search) {
      search.addEventListener("input", function () {
        paint(search.value);
      });
    }

    paint("");

    host.addEventListener("click", function (e) {
      const btn = e.target.closest(".acc-trigger");
      if (!btn) return;
      const item = btn.closest(".acc-item");
      const open = item.classList.contains("is-open");
      // Single-open behaviour.
      host.querySelectorAll(".acc-item.is-open").forEach(function (other) {
        other.classList.remove("is-open");
        other.querySelector(".acc-trigger").setAttribute("aria-expanded", "false");
      });
      if (!open) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  }

  /** Open a specific FAQ (used by the global search). */
  function openFaq(index) {
    const host = document.getElementById("faqAccordion");
    if (!host) return;
    const btn = host.querySelector("#faq-t-" + index);
    if (!btn) return;
    if (btn.getAttribute("aria-expanded") !== "true") btn.click();
    btn.focus();
  }
  ns.openFaq = openFaq;

  /* --------------------------------------------------------------------- */
  /* Hero progress bars                                                     */
  /* --------------------------------------------------------------------- */

  function init() {
    renderServices();
    renderSolutions();
    renderProcess();
    renderTech();
    renderValues();
    renderStats();
    renderTestimonials();
    renderFaq();

    // Escape closes the modal from anywhere.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.isOpen()) modal.close();
    });
  }

  ns.components = { init: init };
})((window.NEXORA = window.NEXORA || {}));
