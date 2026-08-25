/**
 * NEXORA — demo checkout
 * A multi-step, frontend-only subscription flow: plan confirmation, payment
 * details with a live card preview, client-side validation, a simulated
 * processing state and a confirmation screen.
 *
 * SECURITY: this is a demonstration. Card values live in a short-lived module
 * variable only, are never persisted, never logged and never transmitted.
 * They are wiped as soon as the simulated payment completes or the flow closes.
 */
(function (ns) {
  "use strict";

  const D = window.NEXORA_DATA;
  const esc = ns.esc;
  const store = ns.store;

  let ov = null;
  let state = null;
  let timer = null;

  function blankFields() {
    return { holder: "", number: "", expiry: "", cvv: "", country: "", zip: "" };
  }

  function wipeFields() {
    if (!state) return;
    state.fields = blankFields();
  }

  function plan() {
    return (
      D.plans.filter(function (p) {
        return p.id === state.planId;
      })[0] || D.plans[0]
    );
  }

  function amount() {
    const p = plan();
    return state.cycle === "yearly" ? p.yearly : p.monthly;
  }

  function saving() {
    const p = plan();
    return p.monthly * 12 - p.yearly;
  }

  /* --------------------------------------------------------------------- */
  /* Formatting + validation                                               */
  /* --------------------------------------------------------------------- */

  function digits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function formatCard(value) {
    return digits(value)
      .slice(0, 19)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  }

  function formatExpiry(value) {
    const d = digits(value).slice(0, 4);
    if (d.length <= 2) return d;
    return d.slice(0, 2) + "/" + d.slice(2);
  }

  function luhn(number) {
    const d = digits(number);
    let sum = 0;
    let alt = false;
    for (let i = d.length - 1; i >= 0; i--) {
      let n = parseInt(d.charAt(i), 10);
      if (alt) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alt = !alt;
    }
    return d.length >= 13 && sum % 10 === 0;
  }

  function brand(number) {
    const d = digits(number);
    if (/^4/.test(d)) return "Visa";
    if (/^(5[1-5]|2[2-7])/.test(d)) return "Mastercard";
    if (/^3[47]/.test(d)) return "Amex";
    if (/^6/.test(d)) return "Discover";
    return "Card";
  }

  const RULES = {
    holder: function (v) {
      const t = v.trim();
      if (!t) return "Cardholder name is required.";
      if (t.length < 3) return "Enter the full name printed on the card.";
      if (t.length > 60) return "Name must be under 60 characters.";
      if (!/^[\p{L}\p{M}\s'.-]+$/u.test(t)) return "Use letters, spaces, hyphens and apostrophes only.";
      return "";
    },
    number: function (v) {
      const d = digits(v);
      if (!d) return "Card number is required.";
      if (d.length < 13) return "Card number looks too short.";
      if (!luhn(d)) return "This card number is not valid.";
      return "";
    },
    expiry: function (v) {
      const d = digits(v);
      if (!d) return "Expiry date is required.";
      if (d.length !== 4) return "Use the MM/YY format.";
      const mm = parseInt(d.slice(0, 2), 10);
      const yy = parseInt(d.slice(2), 10);
      if (mm < 1 || mm > 12) return "Month must be between 01 and 12.";
      const now = new Date();
      const expYear = 2000 + yy;
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      if (expYear < currentYear || (expYear === currentYear && mm < currentMonth)) return "This card has expired.";
      if (expYear > currentYear + 20) return "Expiry year looks incorrect.";
      return "";
    },
    cvv: function (v) {
      const d = digits(v);
      if (!d) return "CVV is required.";
      if (d.length < 3 || d.length > 4) return "CVV must be 3 or 4 digits.";
      return "";
    },
    country: function (v) {
      if (!v) return "Select a billing country.";
      return "";
    },
    zip: function (v) {
      const t = v.trim();
      if (!t) return "ZIP / postal code is required.";
      if (t.length < 3) return "Postal code looks too short.";
      if (t.length > 12) return "Postal code looks too long.";
      if (!/^[A-Za-z0-9][A-Za-z0-9\s-]*$/.test(t)) return "Use letters, numbers, spaces or hyphens.";
      return "";
    },
  };

  function validateAll() {
    const errors = {};
    Object.keys(RULES).forEach(function (key) {
      const msg = RULES[key](state.fields[key]);
      if (msg) errors[key] = msg;
    });
    state.errors = errors;
    return Object.keys(errors).length === 0;
  }

  /* --------------------------------------------------------------------- */
  /* Views                                                                 */
  /* --------------------------------------------------------------------- */

  function head(title, sub, step) {
    const steps = ["Plan", "Payment", "Confirmation"];
    return (
      '<div class="ov__head"><div><span class="pill pill--accent">Demo checkout</span>' +
      '<h2 class="ov__title">' +
      esc(title) +
      '</h2><p class="counter">' +
      esc(sub) +
      "</p></div>" +
      '<button class="icon-btn" type="button" data-ov-close aria-label="Close checkout">' +
      ns.icon("close", 18) +
      "</button></div>" +
      '<ol class="steps" aria-label="Checkout progress">' +
      steps
        .map(function (label, i) {
          const n = i + 1;
          const cls = n < step ? " is-done" : n === step ? " is-current" : "";
          return (
            '<li class="steps__item' +
            cls +
            '"' +
            (n === step ? ' aria-current="step"' : "") +
            '><span class="steps__dot">' +
            (n < step ? ns.icon("check", 12) : n) +
            "</span>" +
            esc(label) +
            "</li>"
          );
        })
        .join("") +
      "</ol>"
    );
  }

  function planStep() {
    const p = plan();
    const yearly = state.cycle === "yearly";
    return (
      head("Confirm your plan", "Step 1 of 3 — review the plan and billing cycle.", 1) +
      '<div class="ov__body checkout-grid">' +
      '<section class="panel" aria-label="Plan summary"><h3>' +
      esc(p.name) +
      " plan</h3><p class=\"counter\">" +
      esc(p.desc) +
      "</p>" +
      '<div class="seg" role="group" aria-label="Billing cycle">' +
      '<button class="seg__btn' +
      (yearly ? "" : " is-active") +
      '" type="button" data-cycle="monthly" aria-pressed="' +
      String(!yearly) +
      '">Monthly</button>' +
      '<button class="seg__btn' +
      (yearly ? " is-active" : "") +
      '" type="button" data-cycle="yearly" aria-pressed="' +
      String(yearly) +
      '">Yearly <span class="pill pill--accent">Save ' +
      D.yearlySavingPercent +
      "%</span></button></div>" +
      '<div class="price" style="margin-top:var(--s-4)"><span class="price__amount">' +
      store.money(amount()) +
      '</span><span class="price__period">/ ' +
      (yearly ? "year" : "month") +
      "</span></div>" +
      (yearly
        ? '<p class="counter">You save ' + store.money(saving()) + " per year versus monthly billing.</p>"
        : '<p class="counter">Billed monthly — switch to yearly to save ' + D.yearlySavingPercent + "%.</p>") +
      '<h4 class="panel__label">Included</h4><ul class="feature-list">' +
      p.features
        .map(function (f) {
          return "<li>" + esc(f) + "</li>";
        })
        .join("") +
      "</ul></section>" +
      '<aside class="panel panel--summary" aria-label="Order summary"><h3>Order summary</h3>' +
      '<dl class="summary"><div><dt>Plan</dt><dd>' +
      esc(p.name) +
      "</dd></div><div><dt>Billing cycle</dt><dd>" +
      (yearly ? "Yearly" : "Monthly") +
      "</dd></div><div><dt>Subtotal</dt><dd>" +
      store.money(amount()) +
      "</dd></div><div><dt>VAT / tax</dt><dd>Calculated at invoice</dd></div>" +
      (yearly ? "<div><dt>Annual saving</dt><dd>-" + store.money(saving()) + "</dd></div>" : "") +
      '<div class="summary__total"><dt>Total due today</dt><dd>' +
      store.money(amount()) +
      "</dd></div></dl>" +
      '<div class="switch-plan"><span class="counter">Change plan</span><div class="seg seg--wrap">' +
      D.plans
        .map(function (item) {
          return (
            '<button class="seg__btn' +
            (item.id === state.planId ? " is-active" : "") +
            '" type="button" data-switch-plan="' +
            item.id +
            '" aria-pressed="' +
            String(item.id === state.planId) +
            '">' +
            esc(item.name) +
            "</button>"
          );
        })
        .join("") +
      "</div></div>" +
      '<button class="btn btn--primary btn--block" type="button" data-goto="payment" data-autofocus>Continue to payment</button>' +
      '<button class="btn btn--quiet btn--block btn--sm" type="button" data-ov-close>Keep browsing</button>' +
      '<p class="note-secure">' +
      ns.icon("lock", 14) +
      " Demo checkout — no real payment will be processed.</p></aside></div>"
    );
  }

  function field(name, label, opts) {
    const o = opts || {};
    const err = state.errors[name];
    const value = state.fields[name];
    let control;
    if (o.type === "select") {
      control =
        '<select class="select" id="co-' +
        name +
        '" name="' +
        name +
        '" aria-invalid="' +
        String(!!err) +
        '" aria-describedby="co-err-' +
        name +
        '"><option value="">Select a country</option>' +
        D.countries
          .map(function (c) {
            return '<option value="' + esc(c) + '"' + (value === c ? " selected" : "") + ">" + esc(c) + "</option>";
          })
          .join("") +
        "</select>";
    } else {
      control =
        '<input class="input" id="co-' +
        name +
        '" name="' +
        name +
        '" type="text" inputmode="' +
        (o.inputmode || "text") +
        '" autocomplete="' +
        (o.autocomplete || "off") +
        '" placeholder="' +
        esc(o.placeholder || "") +
        '" value="' +
        esc(value) +
        '" maxlength="' +
        (o.maxlength || 60) +
        '" aria-invalid="' +
        String(!!err) +
        '" aria-describedby="co-err-' +
        name +
        '"' +
        (o.autofocus ? " data-autofocus" : "") +
        ">";
    }
    return (
      '<div class="field' +
      (err ? " has-error" : value ? " is-valid" : "") +
      '"><label class="field__label" for="co-' +
      name +
      '">' +
      esc(label) +
      ' <span class="req" aria-hidden="true">*</span></label>' +
      control +
      '<p class="error-msg" id="co-err-' +
      name +
      '" role="alert">' +
      (err ? '<span aria-hidden="true">!</span><span>' + esc(err) + "</span>" : "") +
      "</p></div>"
    );
  }

  function cardPreview() {
    const f = state.fields;
    const d = digits(f.number);
    let masked = "";
    for (let i = 0; i < 16; i++) {
      masked += i < d.length ? (i < d.length - 4 ? "•" : d.charAt(i)) : "•";
      if (i % 4 === 3 && i < 15) masked += " ";
    }
    return (
      '<div class="card-preview" aria-hidden="true"><div class="card-preview__top"><span class="card-preview__chip"></span><span class="card-preview__brand">' +
      esc(brand(f.number)) +
      '</span></div><div class="card-preview__number">' +
      esc(masked) +
      '</div><div class="card-preview__foot"><span><small>Cardholder</small><strong>' +
      esc(f.holder ? f.holder.toUpperCase() : "YOUR NAME") +
      "</strong></span><span><small>Expires</small><strong>" +
      esc(f.expiry || "MM/YY") +
      "</strong></span><span><small>CVV</small><strong>" +
      (digits(f.cvv) ? digits(f.cvv).replace(/./g, "•") : "•••") +
      "</strong></span></div></div>"
    );
  }

  function paymentStep() {
    const p = plan();
    return (
      head("Payment details", "Step 2 of 3 — demonstration payment form.", 2) +
      '<div class="ov__body checkout-grid">' +
      '<section class="panel" aria-label="Payment details"><h3>Payment details</h3>' +
      '<p class="counter">Use any test values — for example 4242 4242 4242 4242. Nothing is transmitted or stored.</p>' +
      '<form class="checkout-form" id="checkoutForm" novalidate>' +
      field("holder", "Cardholder name", { autocomplete: "off", placeholder: "Alex Mercer", autofocus: true }) +
      field("number", "Card number", { inputmode: "numeric", placeholder: "4242 4242 4242 4242", maxlength: 23 }) +
      '<div class="field-row">' +
      field("expiry", "Expiry date", { inputmode: "numeric", placeholder: "MM/YY", maxlength: 5 }) +
      field("cvv", "CVV", { inputmode: "numeric", placeholder: "123", maxlength: 4 }) +
      "</div>" +
      '<div class="field-row">' +
      field("country", "Billing country", { type: "select" }) +
      field("zip", "Billing ZIP / postal code", { placeholder: "94107", maxlength: 12 }) +
      "</div>" +
      '<div class="ov__actions"><button class="btn btn--ghost" type="button" data-goto="plan">Back</button>' +
      '<button class="btn btn--primary" type="submit" id="checkoutSubmit"><span class="btn__spinner" aria-hidden="true"></span>Complete Subscription</button></div>' +
      "</form></section>" +
      '<aside class="panel panel--summary" aria-label="Order summary">' +
      cardPreview() +
      '<dl class="summary"><div><dt>Plan</dt><dd>' +
      esc(p.name) +
      "</dd></div><div><dt>Cycle</dt><dd>" +
      (state.cycle === "yearly" ? "Yearly" : "Monthly") +
      '</dd></div><div class="summary__total"><dt>Total due today</dt><dd>' +
      store.money(amount()) +
      "</dd></div></dl>" +
      '<p class="note-secure">' +
      ns.icon("lock", 14) +
      " Demo checkout — no real payment will be processed. Card details are never saved.</p></aside></div>"
    );
  }

  function processingStep() {
    return (
      head("Processing", "Step 3 of 3 — completing your simulated subscription.", 3) +
      '<div class="ov__body ov__body--center"><div class="processing" role="status" aria-live="polite">' +
      '<span class="processing__ring" aria-hidden="true"></span><h3>Processing your subscription…</h3>' +
      '<p class="counter">Simulating authorisation for the ' +
      esc(plan().name) +
      " plan. This takes a moment.</p></div></div>"
    );
  }

  function successStep() {
    const sub = store.getSubscription() || {};
    return (
      head("Subscription activated", "Your demo subscription is ready.", 3) +
      '<div class="ov__body ov__body--center"><div class="success-block">' +
      '<div class="success-ring" aria-hidden="true">' +
      ns.icon("check", 26) +
      "</div><h3 tabindex=\"-1\" data-autofocus>Subscription Activated</h3>" +
      '<p class="counter">Thank you — your ' +
      esc(sub.planName || plan().name) +
      " plan is active in this demonstration.</p>" +
      '<dl class="summary summary--wide"><div><dt>Plan</dt><dd>' +
      esc(sub.planName || plan().name) +
      "</dd></div><div><dt>Reference</dt><dd>" +
      esc(sub.reference || "—") +
      "</dd></div><div><dt>Billing cycle</dt><dd>" +
      (sub.cycle === "yearly" ? "Yearly" : "Monthly") +
      "</dd></div><div><dt>Amount</dt><dd>" +
      store.money(sub.amount || amount()) +
      "</dd></div><div><dt>Renews</dt><dd>" +
      esc(sub.renewsAt ? store.formatDate(sub.renewsAt) : "—") +
      "</dd></div><div><dt>Payment method</dt><dd>Demo card •••• 4242</dd></div></dl>" +
      '<div class="ov__actions ov__actions--center"><button class="btn btn--ghost" type="button" data-ov-close>Continue Exploring</button>' +
      '<button class="btn btn--primary" type="button" data-open-dashboard>View Dashboard</button></div>' +
      '<p class="note-secure">No real payment was processed and no card details were stored.</p>' +
      "</div></div>"
    );
  }

  function render() {
    if (!ov) return;
    const map = { plan: planStep, payment: paymentStep, processing: processingStep, success: successStep };
    ov.setContent((map[state.step] || planStep)());
    ov.setLabel("Checkout — " + plan().name + " plan");
    ov.scrollTop();
    const focusTarget = ov.panel.querySelector("[data-autofocus]");
    if (focusTarget && focusTarget.focus) focusTarget.focus();
  }

  /* --------------------------------------------------------------------- */
  /* Behaviour                                                             */
  /* --------------------------------------------------------------------- */

  function complete() {
    const p = plan();
    const now = new Date();
    const renews = store.addMonths(now, state.cycle === "yearly" ? 12 : 1);
    const sub = {
      planId: p.id,
      planName: p.name,
      cycle: state.cycle,
      amount: amount(),
      reference: store.reference(),
      startedAt: now.getTime(),
      renewsAt: renews.getTime(),
      status: "active",
      last4: "4242", // fixed demo value — the typed card number is never stored
      usage: { pages: Math.round(p.limits.pages * 0.4), seats: Math.max(1, Math.round(p.limits.seats * 0.5)), requests: Math.round(p.limits.requests * 0.3) },
    };
    wipeFields(); // clear sensitive values from memory immediately
    store.setSubscription(sub);
    store.logActivity("Subscribed to the " + p.name + " plan", store.money(sub.amount) + " · " + sub.cycle);
    store.notify("Subscription activated", p.name + " plan · reference " + sub.reference);
    ns.toast({ kind: "success", title: "Subscription activated", message: p.name + " plan is now active." });
    state.step = "success";
    render();
  }

  function bind() {
    ov.panel.addEventListener("click", function (e) {
      const cycleBtn = e.target.closest("[data-cycle]");
      if (cycleBtn) {
        state.cycle = cycleBtn.dataset.cycle;
        ns.pricing.setCycle(state.cycle);
        render();
        return;
      }
      const switchBtn = e.target.closest("[data-switch-plan]");
      if (switchBtn) {
        state.planId = switchBtn.dataset.switchPlan;
        ns.toast({ kind: "info", title: "Plan updated", message: plan().name + " selected." });
        render();
        return;
      }
      const goto = e.target.closest("[data-goto]");
      if (goto) {
        state.step = goto.dataset.goto;
        state.errors = {};
        render();
        return;
      }
      if (e.target.closest("[data-open-dashboard]")) {
        ov.close(true);
        ns.router.go("/dashboard");
      }
    });

    ov.panel.addEventListener("input", function (e) {
      const input = e.target.closest("[name]");
      if (!input || !state.fields.hasOwnProperty(input.name)) return;
      let value = input.value;
      if (input.name === "number") value = formatCard(value);
      if (input.name === "expiry") value = formatExpiry(value);
      if (input.name === "cvv") value = digits(value).slice(0, 4);
      if (input.value !== value) {
        const atEnd = input.selectionStart === input.value.length;
        input.value = value;
        if (atEnd) input.setSelectionRange(value.length, value.length);
      }
      state.fields[input.name] = value;
      // live-correct an existing error, never introduce one while typing
      if (state.errors[input.name] && !RULES[input.name](value)) {
        delete state.errors[input.name];
        const wrap = input.closest(".field");
        const err = wrap.querySelector(".error-msg");
        wrap.classList.remove("has-error");
        wrap.classList.add("is-valid");
        input.setAttribute("aria-invalid", "false");
        if (err) err.innerHTML = "";
      }
      const preview = ov.panel.querySelector(".card-preview");
      if (preview) preview.outerHTML = cardPreview();
    });

    ov.panel.addEventListener(
      "blur",
      function (e) {
        const input = e.target.closest("[name]");
        if (!input || !RULES[input.name]) return;
        const msg = RULES[input.name](state.fields[input.name]);
        const wrap = input.closest(".field");
        const err = wrap.querySelector(".error-msg");
        if (msg) {
          state.errors[input.name] = msg;
          wrap.classList.add("has-error");
          wrap.classList.remove("is-valid");
          input.setAttribute("aria-invalid", "true");
          if (err) err.innerHTML = '<span aria-hidden="true">!</span><span>' + esc(msg) + "</span>";
        } else {
          delete state.errors[input.name];
          wrap.classList.remove("has-error");
          wrap.classList.add("is-valid");
          input.setAttribute("aria-invalid", "false");
          if (err) err.innerHTML = "";
        }
      },
      true
    );

    ov.panel.addEventListener("change", function (e) {
      const select = e.target.closest("select[name]");
      if (!select) return;
      state.fields[select.name] = select.value;
    });

    ov.panel.addEventListener("submit", function (e) {
      if (!e.target.closest("#checkoutForm")) return;
      e.preventDefault();
      if (!validateAll()) {
        render();
        const firstError = ov.panel.querySelector(".field.has-error .input, .field.has-error .select");
        if (firstError) firstError.focus();
        ns.toast({ kind: "error", title: "Check your details", message: "Some payment fields need attention." });
        return;
      }
      state.step = "processing";
      render();
      timer = setTimeout(complete, 1900);
    });

    ov.onClose(function () {
      if (timer) clearTimeout(timer);
      timer = null;
      wipeFields();
      ns.router.leave("/checkout/" + state.planId);
    });
  }

  function open(planId, cycle) {
    if (!ov) {
      ov = ns.overlay.create({ id: "checkoutOverlay", label: "Checkout", variant: "sheet" });
      state = { planId: planId || "professional", cycle: cycle || ns.pricing.getCycle(), step: "plan", fields: blankFields(), errors: {} };
      bind();
    }
    state.planId = planId || state.planId;
    state.cycle = cycle || ns.pricing.getCycle();
    state.step = "plan";
    state.errors = {};
    state.fields = blankFields();
    render();
    ov.open();
    store.logActivity("Selected the " + plan().name + " plan", state.cycle === "yearly" ? "Yearly billing" : "Monthly billing");
  }

  function close() {
    if (ov) ov.close();
  }

  ns.checkout = { open: open, close: close };
})((window.NEXORA = window.NEXORA || {}));
