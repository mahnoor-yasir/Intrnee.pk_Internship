/**
 * NEXORA — project inquiry wizard
 * A three-step qualification flow (scope → details → contact) that replaces
 * the "everything goes to the contact form" behaviour. Submissions are
 * simulated locally: the brief is logged to the activity feed and a
 * reference number is issued.
 */
(function (ns) {
  "use strict";

  const D = window.NEXORA_DATA;
  const store = ns.store;
  const esc = ns.esc;
  const icon = ns.icon;

  let ov = null;
  let step = 1;
  let sent = null;

  const state = {
    type: "Product interface",
    budget: "$25k – $50k",
    timeline: "1–3 months",
    services: [],
    summary: "",
    name: "",
    email: "",
    company: "",
  };

  const TYPES = ["Marketing site", "Product interface", "Design system", "Performance audit", "Something else"];
  const BUDGETS = ["Under $10k", "$10k – $25k", "$25k – $50k", "$50k – $100k", "$100k+"];
  const TIMELINES = ["ASAP", "1–3 months", "3–6 months", "Just exploring"];

  function serviceNames() {
    return (D && D.services ? D.services : []).map(function (s) {
      return s.title || s.name;
    });
  }

  function chips(name, options, selected, multi) {
    return (
      '<div class="chip-row" role="group">' +
      options
        .map(function (o) {
          const on = multi ? selected.indexOf(o) > -1 : selected === o;
          return (
            '<button class="chip' +
            (on ? " is-on" : "") +
            '" type="button" data-field="' +
            esc(name) +
            '" data-value="' +
            esc(o) +
            '" aria-pressed="' +
            on +
            '">' +
            esc(o) +
            "</button>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function header() {
    const labels = ["Scope", "Details", "Contact"];
    return (
      '<div class="ov__head"><div><span class="pill pill--accent">Project inquiry</span>' +
      "<h3>Tell us about the work</h3></div>" +
      '<button class="icon-btn" type="button" data-ov-close aria-label="Close inquiry">' +
      icon("close", 18) +
      "</button></div>" +
      '<ol class="steps" aria-label="Inquiry progress">' +
      labels
        .map(function (l, i) {
          const n = i + 1;
          return (
            '<li class="steps__item' +
            (step === n ? " is-current" : step > n ? " is-done" : "") +
            '"><span class="steps__dot">' +
            n +
            "</span><span>" +
            esc(l) +
            "</span></li>"
          );
        })
        .join("") +
      "</ol>"
    );
  }

  function stepScope() {
    return (
      '<div class="ov__body"><div class="field"><span class="field__label">What are you building?</span>' +
      chips("type", TYPES, state.type, false) +
      '</div><div class="field"><span class="field__label">Indicative budget</span>' +
      chips("budget", BUDGETS, state.budget, false) +
      '</div><div class="field"><span class="field__label">Ideal timeline</span>' +
      chips("timeline", TIMELINES, state.timeline, false) +
      "</div></div>"
    );
  }

  function stepDetails() {
    return (
      '<div class="ov__body"><div class="field"><span class="field__label">Which services do you need? (select any)</span>' +
      chips("services", serviceNames(), state.services, true) +
      '</div><div class="field"><label class="field__label" for="inqSummary">Project summary</label>' +
      '<textarea class="input" id="inqSummary" rows="5" placeholder="Goals, audience, existing stack, anything already decided…">' +
      esc(state.summary) +
      '</textarea><p class="error-msg" id="inqSummaryErr"><span aria-hidden="true">!</span><span></span></p></div></div>'
    );
  }

  function stepContact() {
    return (
      '<div class="ov__body"><div class="field"><label class="field__label" for="inqName">Full name</label>' +
      '<input class="input" id="inqName" type="text" autocomplete="name" value="' +
      esc(state.name) +
      '" placeholder="Your full name" data-autofocus><p class="error-msg" id="inqNameErr"><span aria-hidden="true">!</span><span></span></p></div>' +
      '<div class="field"><label class="field__label" for="inqEmail">Work email</label>' +
      '<input class="input" id="inqEmail" type="email" autocomplete="email" value="' +
      esc(state.email) +
      '" placeholder="name@company.com"><p class="error-msg" id="inqEmailErr"><span aria-hidden="true">!</span><span></span></p></div>' +
      '<div class="field"><label class="field__label" for="inqCompany">Company (optional)</label>' +
      '<input class="input" id="inqCompany" type="text" autocomplete="organization" value="' +
      esc(state.company) +
      '" placeholder="Company name"></div>' +
      '<div class="summary-box"><h4>Summary</h4><ul class="kv"><li><span>Type</span><strong>' +
      esc(state.type) +
      "</strong></li><li><span>Budget</span><strong>" +
      esc(state.budget) +
      "</strong></li><li><span>Timeline</span><strong>" +
      esc(state.timeline) +
      "</strong></li><li><span>Services</span><strong>" +
      esc(state.services.length ? state.services.join(", ") : "To be discussed") +
      "</strong></li></ul></div></div>"
    );
  }

  function stepDone() {
    return (
      '<div class="ov__body ov__body--center"><div class="success-mark" aria-hidden="true">' +
      icon("check", 28) +
      "</div><h3>Brief received</h3><p class=\"section-sub\">Reference <strong>" +
      esc(sent) +
      "</strong>. This is a frontend simulation — the brief is stored in this browser only. A real deployment would email the team within one business day.</p>" +
      '<div class="ov__actions"><button class="btn btn--ghost" type="button" data-ov-close>Close</button>' +
      '<button class="btn btn--primary" type="button" data-inq-dashboard>Open dashboard ' +
      icon("arrowRight", 16) +
      "</button></div></div>"
    );
  }

  function footer() {
    return (
      '<div class="ov__foot">' +
      (step > 1
        ? '<button class="btn btn--ghost" type="button" data-inq-back>Back</button>'
        : '<button class="btn btn--ghost" type="button" data-ov-close>Cancel</button>') +
      '<button class="btn btn--primary" type="button" data-inq-next>' +
      (step === 3 ? "Send brief" : "Continue") +
      " " +
      icon("arrowRight", 16) +
      "</button></div>"
    );
  }

  function render() {
    if (!ov) return;
    if (step === 4) {
      ov.setContent(header().split('<ol class="steps"')[0] + stepDone());
      return;
    }
    const body = step === 1 ? stepScope() : step === 2 ? stepDetails() : stepContact();
    ov.setContent(header() + body + footer());
    ov.scrollTop();
  }

  function fieldError(id, message) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle("is-visible", Boolean(message));
    const span = el.querySelector("span:last-child");
    if (span) span.textContent = message || "";
  }

  function capture() {
    const summary = document.getElementById("inqSummary");
    if (summary) state.summary = summary.value;
    const name = document.getElementById("inqName");
    if (name) state.name = name.value;
    const email = document.getElementById("inqEmail");
    if (email) state.email = email.value;
    const company = document.getElementById("inqCompany");
    if (company) state.company = company.value;
  }

  function validate() {
    if (step === 2) {
      fieldError("inqSummaryErr", "");
      return true;
    }
    if (step === 3) {
      let ok = true;
      if (state.name.trim().length < 1) {
        fieldError("inqNameErr", "Please enter your name.");
        ok = false;
      } else fieldError("inqNameErr", "");

      if (!state.email.includes("@")) {
        fieldError("inqEmailErr", "Please enter a valid email address.");
        ok = false;
      } else fieldError("inqEmailErr", "");

      return ok;
    }
    return true;
  }

  function submit() {
    sent = store.reference();
    store.logActivity("Project brief submitted", state.type + " · " + state.budget + " · ref " + sent);
    store.notify("Brief received", "Reference " + sent + " — we will reply within one business day.");
    if (ns.toast) ns.toast({ kind: "success", title: "Brief sent", message: "Reference " + sent + "." });
    step = 4;
    render();
  }

  function onClick(e) {
    const chip = e.target.closest("[data-field]");
    if (chip) {
      const f = chip.dataset.field;
      const v = chip.dataset.value;
      capture();
      if (f === "services") {
        const i = state.services.indexOf(v);
        if (i > -1) state.services.splice(i, 1);
        else state.services.push(v);
      } else {
        state[f] = v;
      }
      render();
      return;
    }
    if (e.target.closest("[data-inq-back]")) {
      capture();
      step = Math.max(1, step - 1);
      render();
      return;
    }
    if (e.target.closest("[data-inq-next]")) {
      capture();
      if (!validate()) return;
      if (step === 3) submit();
      else {
        step += 1;
        render();
      }
      return;
    }
    if (e.target.closest("[data-inq-dashboard]")) {
      ov.close();
      if (ns.router) ns.router.go("/dashboard");
      else ns.dashboard.open();
    }
  }

  function ensure() {
    if (ov) return ov;
    ov = ns.overlay.create({ id: "inquiryOverlay", label: "Project inquiry", variant: "sheet" });
    ov.el.addEventListener("click", onClick);
    ov.onClose(function () {
      if (ns.router) ns.router.leave("/inquiry");
      if (step === 4) {
        step = 1;
        sent = null;
      }
    });
    return ov;
  }

  function open(prefill) {
    ensure();
    if (prefill && prefill.type) state.type = prefill.type;
    if (prefill && prefill.service && state.services.indexOf(prefill.service) < 0) {
      state.services.push(prefill.service);
    }
    if (step === 4) {
      step = 1;
      sent = null;
    }
    render();
    ov.open();
  }

  function init() {
    document.addEventListener("click", function (e) {
      const trigger = e.target.closest("[data-inquiry-open]");
      if (!trigger) return;
      e.preventDefault();
      const data = trigger.dataset.inquiryOpen;
      if (ns.router) ns.router.go("/inquiry");
      open(data ? { service: data } : null);
    });
  }

  ns.inquiry = { init: init, open: open, close: function () { if (ov) ov.close(); } };
})((window.NEXORA = window.NEXORA || {}));