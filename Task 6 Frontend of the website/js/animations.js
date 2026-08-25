/**
 * NEXORA — animation module
 * IntersectionObserver-driven scroll reveals, animated counters, progress bars
 * and the scroll progress indicator. No scroll-position polling for reveals.
 */
(function (ns) {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  function prefersReduced() {
    return reduced.matches;
  }

  /** Reveal elements once as they enter the viewport. */
  function initReveals() {
    const targets = document.querySelectorAll("[data-reveal], [data-stagger]");
    if (prefersReduced() || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) {
        el.classList.add("is-revealed");
      });
      return;
    }
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          if (el.hasAttribute("data-stagger")) {
            Array.prototype.forEach.call(el.children, function (child, i) {
              child.style.transitionDelay = Math.min(i * 70, 560) + "ms";
            });
          }
          el.classList.add("is-revealed");
          io.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );
    targets.forEach(function (el) {
      io.observe(el);
    });
  }

  /** Ease-out curve used by every count-up. */
  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /** Animate one counter element from 0 to its data-count value (once). */
  function runCounter(el) {
    if (el.dataset.counted === "1") return;
    el.dataset.counted = "1";
    const target = parseFloat(el.dataset.count || "0");
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1500;

    if (prefersReduced()) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }
    const start = performance.now();
    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = (target * easeOut(p)).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /** Observe every [data-count] element; each animates a single time. */
  function initCounters() {
    const els = document.querySelectorAll("[data-count]");
    if (!("IntersectionObserver" in window)) {
      els.forEach(runCounter);
      return;
    }
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    els.forEach(function (el) {
      io.observe(el);
    });
  }

  /** Fill [data-bar] progress bars when they scroll into view. */
  function initBars() {
    const bars = document.querySelectorAll("[data-bar]");
    const fill = function (el) {
      const inner = el.querySelector("i");
      if (inner) inner.style.width = el.dataset.bar + "%";
    };
    if (!("IntersectionObserver" in window)) {
      bars.forEach(fill);
      return;
    }
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            fill(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    bars.forEach(function (el) {
      io.observe(el);
    });
  }

  /** Top scroll-progress indicator, updated on rAF-throttled scroll. */
  function initScrollProgress() {
    const bar = document.getElementById("scrollProgress");
    if (!bar) return;
    let ticking = false;
    function update() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? Math.min(window.scrollY / h, 1) : 0;
      bar.style.transform = "scaleX(" + p + ")";
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

  /** Subtle pointer parallax on the hero stage (pointer devices only). */
  function initHeroTilt() {
    const stage = document.getElementById("heroStage");
    if (!stage || prefersReduced() || !window.matchMedia("(hover: hover)").matches) return;
    const wrap = stage.parentElement;
    let raf = null;
    wrap.addEventListener("pointermove", function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        const r = wrap.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        stage.style.transform = "rotateY(" + x * 8 + "deg) rotateX(" + -y * 8 + "deg)";
        raf = null;
      });
    });
    wrap.addEventListener("pointerleave", function () {
      stage.style.transform = "";
    });
  }

  function init() {
    initReveals();
    initCounters();
    initBars();
    initScrollProgress();
    initHeroTilt();
  }

  ns.animations = { init: init, initReveals: initReveals, initCounters: initCounters, prefersReduced: prefersReduced };
})((window.NEXORA = window.NEXORA || {}));
