/**
 * NEXORA — pricing section
 * Owns the global monthly/yearly billing cycle used by the pricing grid,
 * the checkout flow and the billing summary. Plan CTAs open the demo
 * checkout, never the contact form.
 */
(function (ns) {
  "use strict";

  const D = window.NEXORA_DATA;
  const esc = ns.esc;
  const store = ns.store;

  let cycle = "monthly";
  const watchers = [];

  function getCycle() {
    return cycle;
  }

  function setCycle(next, options) {
    const value = next === "yearly" ? "yearly" : "monthly";
    if (value === cycle) return;
    cycle = value;
    paint();
    watchers.forEach(function (fn) {
      fn(cycle);
    });
    if (!options || !options.silent) {
      ns.toast({
        kind: "info",
        title: cycle === "yearly" ? "Yearly pricing" : "Monthly pricing",
        message:
          cycle === "yearly"
            ? "Showing annual rates — save " + D.yearlySavingPercent + "%."
            : "Showing monthly rates.",
      });
    }
  }

  function planCard(p) {
    const yearly = cycle === "yearly";
    const price = yearly ? p.yearly : p.monthly;
    const saving = p.monthly * 12 - p.yearly;
    return (
      '<article class="card price-card' +
      (p.featured ? " is-featured" : "") +
      '">' +
      (p.featured ? '<span class="price-card__badge">Recommended</span>' : "") +
      "<h3>" +
      esc(p.name) +
      '</h3><p class="counter">' +
      esc(p.highlight) +
      "</p><p>" +
      esc(p.desc) +
      '</p><div class="price"><span class="price__amount">' +
      store.money(price) +
      '</span><span class="price__period">/ ' +
      (yearly ? "year" : "month") +
      '</span></div><p class="counter">' +
      (yearly ? "Save " + store.money(saving) + " a year versus monthly billing" : "Billed monthly, cancel any time") +
      '</p><ul class="feature-list">' +
      p.features
        .map(function (f) {
          return "<li>" + esc(f) + "</li>";
        })
        .join("") +
      '</ul><button class="btn ' +
      (p.featured ? "btn--primary" : "btn--ghost") +
      ' btn--block" type="button" data-choose-plan="' +
      esc(p.id) +
      '">' +
      esc(p.cta) +
      '</button><button class="link-btn" type="button" data-compare-plan="' +
      esc(p.id) +
      '">What is included in ' +
      esc(p.name) +
      "?</button></article>"
    );
  }

  function paint() {
    const host = document.getElementById("pricingGrid");
    if (!host) return;
    host.innerHTML = D.plans.map(planCard).join("");
    const toggle = document.getElementById("billingToggle");
    if (toggle) toggle.setAttribute("aria-checked", String(cycle === "yearly"));
    const note = document.getElementById("pricingNote");
    if (note) {
      note.textContent =
        cycle === "yearly"
          ? "Yearly billing selected — save " + D.yearlySavingPercent + "% annually. Checkout uses this cycle."
          : "Monthly billing selected. Switch to yearly to save " + D.yearlySavingPercent + "%.";
    }
  }

  function planDetails(id) {
    const p = D.plans.filter(function (x) {
      return x.id === id;
    })[0];
    if (!p) return;
    const yearly = cycle === "yearly";
    ns.modal.open(
      '<button class="icon-btn modal__close" type="button" data-modal-close aria-label="Close plan details">' +
        ns.icon("close", 18) +
        '</button><span class="pill pill--accent">Plan</span><h3>' +
        esc(p.name) +
        '</h3><p class="section-sub" style="margin-top:10px">' +
        esc(p.desc) +
        '</p><div class="price" style="margin-top:14px"><span class="price__amount">' +
        store.money(yearly ? p.yearly : p.monthly) +
        '</span><span class="price__period">/ ' +
        (yearly ? "year" : "month") +
        '</span></div><div class="modal__section"><h4>Included</h4><ul class="feature-list">' +
        p.features
          .map(function (f) {
            return "<li>" + esc(f) + "</li>";
          })
          .join("") +
        '</ul></div><div class="modal__section"><h4>Allowances</h4><div class="tag-row"><span class="tag">' +
        p.limits.pages +
        ' pages</span><span class="tag">' +
        p.limits.seats +
        ' seats</span><span class="tag">' +
        p.limits.requests +
        ' support requests</span></div></div>' +
        '<div class="modal__section ov__actions"><button class="btn btn--primary" type="button" data-choose-plan="' +
        esc(p.id) +
        '">' +
        esc(p.cta) +
        '</button><button class="btn btn--ghost" type="button" data-modal-close>Close</button></div>',
      p.name + " plan details"
    );
  }

  function init() {
    const host = document.getElementById("pricingGrid");
    const toggle = document.getElementById("billingToggle");
    if (!host) return;

    paint();

    if (toggle) {
      toggle.addEventListener("click", function () {
        setCycle(cycle === "yearly" ? "monthly" : "yearly");
      });
    }

    // Plan CTAs and plan-detail links, wherever they are rendered.
    document.addEventListener("click", function (e) {
      const choose = e.target.closest("[data-choose-plan]");
      if (choose) {
        e.preventDefault();
        if (ns.modal.isOpen()) ns.modal.close(true);
        ns.router.go("/checkout/" + choose.dataset.choosePlan);
        return;
      }
      const compare = e.target.closest("[data-compare-plan]");
      if (compare) {
        e.preventDefault();
        planDetails(compare.dataset.comparePlan);
      }
    });
  }

  ns.pricing = { init: init, getCycle: getCycle, setCycle: setCycle, onChange: function (fn) { watchers.push(fn); }, paint: paint };
})((window.NEXORA = window.NEXORA || {}));
