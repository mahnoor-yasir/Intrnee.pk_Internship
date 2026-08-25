/**
 * NEXORA — forms module
 * Accessible client-side validation, simulated submission, character counting,
 * draft persistence and newsletter subscription state. Nothing is sent anywhere.
 */
(function (ns) {
  "use strict";

  const DRAFT_KEY = "nexora:contact-draft";
  const NEWS_KEY = "nexora:newsletter";

  function store(key, value) {
    try {
      value === null ? localStorage.removeItem(key) : localStorage.setItem(key, value);
    } catch (e) {
      /* storage unavailable */
    }
  }
  function read(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  /* ---------------- Contact form ---------------- */

  const RULES = {
    name: function (v) {
      if (!v.trim()) return "Please enter your full name.";
      return "";
    },
    email: function (v) {
      if (!v.trim()) return "Please enter your email address.";
      if (!v.includes("@")) return "Enter a valid email address.";
      return "";
    },
    company: function (v) {
      return "";
    },
    projectType: function (v) {
      if (!v) return "Select the type of project you have in mind.";
      return "";
    },
    budget: function (v) {
      if (!v) return "Select an approximate budget range.";
      return "";
    },
    message: function (v) {
      const t = v.trim();
      if (!t) return "Please describe your project.";
      return "";
    },
  };

  function initContact() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    const budgetInput = document.getElementById("budget");
    const counter = document.getElementById("messageCounter");
    const message = document.getElementById("message");
    const submitBtn = document.getElementById("contactSubmit");

    function fieldWrap(input) {
      return input.closest(".field") || input.parentElement;
    }

    function setError(input, msg) {
      const wrap = fieldWrap(input);
      if (!wrap) return;
      const errEl = wrap.querySelector(".error-msg");
      if (msg) {
        wrap.classList.add("has-error");
        wrap.classList.remove("is-valid");
        input.setAttribute("aria-invalid", "true");
        if (errEl) {
          errEl.textContent = msg;
          input.setAttribute("aria-describedby", errEl.id);
        }
      } else {
        wrap.classList.remove("has-error");
        wrap.classList.add("is-valid");
        input.setAttribute("aria-invalid", "false");
        if (errEl) errEl.textContent = "";
      }
    }

    function validateField(input) {
      const rule = RULES[input.name];
      if (!rule) return true;
      const msg = rule(input.value);
      setError(input, msg);
      return !msg;
    }

    const fields = Array.prototype.slice.call(form.querySelectorAll("[name]"));

    /* ----- draft persistence ----- */
    const saveDraft = ns.debounce ? ns.debounce(function () {
      const data = {};
      fields.forEach(function (f) {
        data[f.name] = f.value;
      });
      store(DRAFT_KEY, JSON.stringify(data));
      const note = document.getElementById("draftNote");
      if (note) note.textContent = "Draft saved locally";
    }, 500) : function () {};

    fields.forEach(function (input) {
      input.addEventListener("blur", function () {
        if (input.value || input.hasAttribute("required")) validateField(input);
        saveDraft();
      });
      input.addEventListener("input", function () {
        if (fieldWrap(input) && fieldWrap(input).classList.contains("has-error")) validateField(input);
        saveDraft();
      });
      input.addEventListener("change", saveDraft);
    });

    const chips = form.querySelectorAll("[data-budget]");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) {
          c.setAttribute("aria-pressed", String(c === chip));
        });
        if (budgetInput) {
          budgetInput.value = chip.dataset.budget;
          validateField(budgetInput);
        }
        saveDraft();
      });
    });

    function updateCounter() {
      if (!counter || !message) return;
      const len = message.value.length;
      counter.textContent = len + " / 1000";
      counter.classList.toggle("is-over", len > 1000);
    }
    if (message) message.addEventListener("input", updateCounter);

    function restoreDraft() {
      const raw = read(DRAFT_KEY);
      if (!raw) return;
      let data;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        store(DRAFT_KEY, null);
        return;
      }
      fields.forEach(function (f) {
        if (data[f.name]) f.value = data[f.name];
      });
      if (data.budget && budgetInput) {
        chips.forEach(function (c) {
          c.setAttribute("aria-pressed", String(c.dataset.budget === data.budget));
        });
      }
      updateCounter();
      const note = document.getElementById("draftNote");
      if (note) note.textContent = "Draft restored from this device";
    }

    const clearBtn = document.getElementById("clearDraft");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        store(DRAFT_KEY, null);
        form.reset();
        if (budgetInput) budgetInput.value = "";
        chips.forEach(function (c) {
          c.setAttribute("aria-pressed", "false");
        });
        form.querySelectorAll(".field").forEach(function (f) {
          f.classList.remove("has-error", "is-valid");
        });
        updateCounter();
        const note = document.getElementById("draftNote");
        if (note) note.textContent = "Saved data cleared";
        if (ns.toast) ns.toast({ kind: "info", title: "Saved data cleared", message: "Your local contact draft was removed." });
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const results = fields.map(validateField);
      const firstInvalid = form.querySelector(".field.has-error [name]");
      if (results.indexOf(false) !== -1) {
        if (firstInvalid) firstInvalid.focus();
        if (ns.toast) {
          ns.toast({
            kind: "error",
            title: "Check highlighted fields",
            message: "Please ensure required fields are filled.",
          });
        }
        return;
      }

      if (submitBtn) {
        submitBtn.classList.add("is-loading");
        submitBtn.setAttribute("aria-busy", "true");
      }

      setTimeout(function () {
        if (submitBtn) {
          submitBtn.classList.remove("is-loading");
          submitBtn.removeAttribute("aria-busy");
        }
        form.classList.add("is-success");
        store(DRAFT_KEY, null);
        const live = document.getElementById("contactLive");
        if (live) live.textContent = "Message received. Our team will review your request and get back to you shortly.";
        if (ns.toast) {
          ns.toast({
            kind: "success",
            title: "Message received",
            message: "Frontend simulation complete.",
          });
        }
        const heading = document.getElementById("successHeading");
        if (heading) heading.focus();
      }, 500);
    });

    const resetBtn = document.getElementById("sendAnother");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        form.classList.remove("is-success");
        form.reset();
        if (budgetInput) budgetInput.value = "";
        chips.forEach(function (c) {
          c.setAttribute("aria-pressed", "false");
        });
        form.querySelectorAll(".field").forEach(function (f) {
          f.classList.remove("has-error", "is-valid");
        });
        updateCounter();
        const first = document.getElementById("fullName");
        if (first) first.focus();
      });
    }

    restoreDraft();
    updateCounter();
  }

  /* ---------------- Newsletter ---------------- */

  function initNewsletter() {
    const forms = document.querySelectorAll("[data-newsletter]");
    if (!forms.length) return;

    const subscribed = read(NEWS_KEY);

    forms.forEach(function (form) {
      const input = form.querySelector('input[type="email"]');
      const note = form.parentElement.querySelector(".form-note");
      const btn = form.querySelector("button[type='submit']");

      function setNote(text, kind) {
        if (!note) return;
        note.textContent = text;
        note.className = "form-note" + (kind ? " is-" + kind : "");
      }

      if (subscribed && input) {
        setNote("You are subscribed as " + subscribed + " on this device.", "success");
        input.value = subscribed;
      }

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        const value = input ? input.value.trim() : "";

        if (!value || !value.includes("@")) {
          setNote("Enter a valid email address.", "error");
          if (input) {
            input.setAttribute("aria-invalid", "true");
            input.focus();
          }
          return;
        }

        if (input) input.setAttribute("aria-invalid", "false");
        if (btn) btn.classList.add("is-loading");
        setNote("Subscribing…");

        setTimeout(function () {
          if (btn) btn.classList.remove("is-loading");
          store(NEWS_KEY, value);
          setNote("Subscribed.", "success");
          if (ns.toast) {
            ns.toast({
              kind: "success",
              title: "Subscribed",
              message: "Frontend simulation — email stored locally.",
            });
          }
          document.querySelectorAll("[data-newsletter] input[type='email']").forEach(function (i) {
            i.value = value;
          });
        }, 500);
      });
    });

    const clearAll = document.getElementById("clearAllData");
    if (clearAll) {
      clearAll.addEventListener("click", function () {
        store(DRAFT_KEY, null);
        store(NEWS_KEY, null);
        if (ns.toast) {
          ns.toast({
            kind: "success",
            title: "Saved data cleared",
            message: "Local data cleared.",
          });
        }
        setTimeout(function () {
          location.reload();
        }, 500);
      });
    }
  }

  ns.forms = {
    init: function () {
      initContact();
      initNewsletter();
    },
  };
})((window.NEXORA = window.NEXORA || {}));