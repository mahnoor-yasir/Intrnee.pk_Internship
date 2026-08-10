/* FormFlow — app.js
 * Wires DOM events to the form module: input handling, navigation, dialogs,
 * draft recovery and submission history.
 */
(function () {
  const { $, $$, escapeHtml } = FF.utils;
  const form = FF.form;
  const state = form.state;

  /* ----------------------------- Input events ----------------------------- */

  function setValue(name, value) {
    state.formData[name] = value;
    const field = form.fieldByName(name);
    if (field && state.errors[name]) {
      const message = FF.validation.validateField(field, value);
      if (!message) {
        delete state.errors[name];
        const wrap = document.querySelector(`[data-field="${name}"]`);
        if (wrap) {
          wrap.classList.remove("has-error");
          const err = wrap.querySelector(".field-error");
          if (err) err.remove();
          const control = wrap.querySelector(".focus-target");
          if (control) control.removeAttribute("aria-invalid");
        }
        if (Object.keys(state.errors).length === 0) {
          const summary = $("#error-summary");
          if (summary) summary.remove();
        }
      }
    }
    form.autosave();
    form.setAutosaveStatus("saving");
  }

  document.addEventListener("input", (event) => {
    const target = event.target;
    if (!target.name && !target.id) return;

    if (target.matches("input[type=checkbox][data-group]")) return;
    if (target.matches("#confirm-accuracy")) return;

    if (target.matches(".range")) {
      const out = document.querySelector(`[data-range-out="${target.name}"]`);
      const value = Number(target.value);
      if (out)
        out.textContent = `$${value.toLocaleString()}${value >= Number(target.max) ? "+" : ""} / year`;
      target.setAttribute("aria-valuetext", `${value.toLocaleString()} US dollars`);
      setValue(target.name, value);
      return;
    }

    if (target.matches(".textarea")) {
      const counter = document.querySelector(`[data-count-for="${target.name}"]`);
      if (counter) {
        counter.textContent = String(target.value.length);
        const field = form.fieldByName(target.name);
        counter.parentElement.classList.toggle(
          "is-warning",
          field && target.value.length > field.maxLength * 0.9,
        );
      }
    }

    if (target.matches(".input")) setValue(target.name, target.value);
  });

  document.addEventListener("change", (event) => {
    const target = event.target;

    if (target.matches("input[type=checkbox][data-group]")) {
      const name = target.dataset.group;
      const current = Array.isArray(state.formData[name]) ? [...state.formData[name]] : [];
      const index = current.indexOf(target.value);
      if (target.checked && index === -1) current.push(target.value);
      if (!target.checked && index > -1) current.splice(index, 1);
      target.closest(".choice").classList.toggle("is-selected", target.checked);
      setValue(name, current);
      return;
    }

    if (target.matches("input[type=radio][data-radio]")) {
      const name = target.dataset.radio;
      $$(`input[data-radio="${name}"]`).forEach((input) =>
        input.closest(".choice").classList.toggle("is-selected", input.checked),
      );
      setValue(name, target.value);
      return;
    }

    if (target.matches("#confirm-accuracy")) {
      state.confirmed = target.checked;
      target.closest(".confirm-box").classList.toggle("is-checked", target.checked);
      form.renderChrome();
      form.saveDraft();
      return;
    }

    if (target.matches("select.input")) setValue(target.name, target.value);

    if (target.matches("[data-file-input]")) {
      const file = target.files && target.files[0];
      if (file) form.handleFile(target.dataset.fileInput, file);
      target.value = "";
    }
  });

  document.addEventListener(
    "blur",
    (event) => {
      const target = event.target;
      if (!target.matches || !target.matches(".input, .textarea")) return;
      const field = form.fieldByName(target.name);
      if (!field) return;
      state.touched[field.name] = true;
      const message = FF.validation.validateField(field, state.formData[field.name]);
      const wrap = document.querySelector(`[data-field="${field.name}"]`);
      if (!wrap) return;
      const existing = wrap.querySelector(".field-error");
      if (message) {
        state.errors[field.name] = message;
        wrap.classList.add("has-error");
        target.setAttribute("aria-invalid", "true");
        if (existing) {
          existing.innerHTML = `<span aria-hidden="true">⚠</span> ${escapeHtml(message)}`;
        } else {
          const node = document.createElement("p");
          node.className = "field-error";
          node.id = `${field.name}-error`;
          node.innerHTML = `<span aria-hidden="true">⚠</span> ${escapeHtml(message)}`;
          wrap.appendChild(node);
          const described = (target.getAttribute("aria-describedby") || "").split(" ").filter(Boolean);
          described.push(node.id);
          target.setAttribute("aria-describedby", described.join(" "));
        }
      } else {
        delete state.errors[field.name];
        wrap.classList.remove("has-error");
        target.removeAttribute("aria-invalid");
        if (existing) existing.remove();
      }
    },
    true,
  );

  /* ------------------------------ Click routing ---------------------------- */

  document.addEventListener("click", (event) => {
    const stepBtn = event.target.closest("[data-step]");
    if (stepBtn) {
      form.goToStep(Number(stepBtn.dataset.step));
      closeMobileSteps();
      return;
    }

    const editBtn = event.target.closest("[data-edit-step]");
    if (editBtn) {
      form.goToStep(Number(editBtn.dataset.editStep));
      return;
    }

    const errorBtn = event.target.closest("[data-goto-error]");
    if (errorBtn) {
      FF.ui.focusField(errorBtn.dataset.gotoError);
      return;
    }

    const removeBtn = event.target.closest("[data-remove-file]");
    if (removeBtn) {
      form.removeFile(removeBtn.dataset.removeFile);
      return;
    }

    const dropzone = event.target.closest("[data-dropzone]");
    if (dropzone) {
      document.querySelector(`[data-file-input="${dropzone.dataset.dropzone}"]`).click();
      return;
    }

    if (event.target.closest("#btn-new-form")) {
      startNewForm();
      return;
    }

    if (event.target.closest("#btn-view-data")) {
      openHistory(state.submission ? state.submission.reference : null);
      return;
    }

    if (event.target.closest("#btn-resume")) {
      state.exited = false;
      form.render();
      form.focusFirstField();
    }
  });

  document.addEventListener("keydown", (event) => {
    const dropzone = event.target.closest && event.target.closest("[data-dropzone]");
    if (dropzone && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      document.querySelector(`[data-file-input="${dropzone.dataset.dropzone}"]`).click();
    }
  });

  /* ------------------------------ Drag & drop ------------------------------ */

  ["dragenter", "dragover"].forEach((type) =>
    document.addEventListener(type, (event) => {
      const zone = event.target.closest && event.target.closest("[data-dropzone]");
      if (!zone) return;
      event.preventDefault();
      zone.classList.add("is-dragging");
    }),
  );

  document.addEventListener("dragleave", (event) => {
    const zone = event.target.closest && event.target.closest("[data-dropzone]");
    if (zone) zone.classList.remove("is-dragging");
  });

  document.addEventListener("drop", (event) => {
    const zone = event.target.closest && event.target.closest("[data-dropzone]");
    if (!zone) return;
    event.preventDefault();
    zone.classList.remove("is-dragging");
    const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
    if (file) form.handleFile(zone.dataset.dropzone, file);
  });

  window.addEventListener("dragover", (event) => event.preventDefault());
  window.addEventListener("drop", (event) => {
    if (!event.target.closest || !event.target.closest("[data-dropzone]")) event.preventDefault();
  });

  /* ------------------------------- Nav buttons ----------------------------- */

  $("#btn-back").addEventListener("click", () => form.goToStep(state.currentStep - 1));
  $("#btn-next").addEventListener("click", () =>
    form.goToStep(state.currentStep + 1, { validate: true }),
  );
  $("#btn-submit").addEventListener("click", () => form.submit());

  function saveAndExit() {
    const saved = form.saveDraft({ silent: false });
    if (saved) {
      state.exited = true;
      closeMobileSteps();
      form.render();
    }
  }

  $("#btn-save-exit").addEventListener("click", saveAndExit);
  $("#btn-save-exit-m").addEventListener("click", saveAndExit);

  $("#btn-theme").addEventListener("click", () => FF.ui.toggleTheme());

  async function clearDraft() {
    const ok = await FF.ui.confirm({
      title: "Clear your current draft?",
      body: "Everything you have entered in this form will be permanently removed from this browser. Submitted applications are not affected.",
      confirmText: "Clear draft",
    });
    if (!ok) return;
    FF.storage.clearDraft();
    form.resetForm();
    form.render();
    form.focusFirstField();
    FF.ui.toast("Draft cleared. Starting fresh.", "info");
  }

  $("#btn-clear-draft").addEventListener("click", clearDraft);
  $("#btn-clear-draft-m").addEventListener("click", () => {
    closeMobileSteps();
    clearDraft();
  });

  async function startNewForm() {
    const ok = await FF.ui.confirm({
      title: "Start a new form?",
      body: "This clears the current answers so you can begin a fresh application. Your submission history stays intact.",
      confirmText: "Start new form",
      danger: false,
    });
    if (!ok) return;
    FF.storage.clearDraft();
    form.resetForm();
    form.render();
    form.focusFirstField();
    FF.ui.toast("New form started.", "info");
  }

  /* -------------------------- Mobile step drawer --------------------------- */

  function closeMobileSteps() {
    $("#mobile-steps").hidden = true;
    $("#btn-steps").setAttribute("aria-expanded", "false");
  }

  $("#btn-steps").addEventListener("click", () => {
    const panel = $("#mobile-steps");
    const open = panel.hidden;
    panel.hidden = !open;
    $("#btn-steps").setAttribute("aria-expanded", String(open));
  });

  /* ----------------------------- Confirm dialog ---------------------------- */

  $("#confirm-cancel").addEventListener("click", () => FF.ui.closeDialog(false));
  $("#confirm-ok").addEventListener("click", () => FF.ui.closeDialog(true));
  $("#history-close").addEventListener("click", () => FF.ui.closeDialog(false));
  $("#overlay").addEventListener("click", () => FF.ui.closeDialog(false));

  /* --------------------------- Submission history -------------------------- */

  function historyMarkup(highlight) {
    const list = FF.storage.getHistory();
    if (list.length === 0) {
      return `<div class="empty-state">
        <p class="empty-title">No submissions yet</p>
        <p class="empty-sub">Once you submit an application it will appear here with its reference number.</p>
      </div>`;
    }
    return `<div class="history-list">${list
      .map((item) => {
        const name = `${item.data.firstName || ""} ${item.data.lastName || ""}`.trim() || "—";
        return `
        <article class="history-item ${highlight === item.reference ? "is-highlight" : ""}">
          <div class="history-main">
            <strong>${escapeHtml(item.reference)}</strong>
            <span class="pill">${escapeHtml(item.status)}</span>
            <p>${escapeHtml(name)} · ${escapeHtml(item.data.email || "—")}</p>
            <small>${escapeHtml(FF.utils.formatDateTime(item.submittedAt))}</small>
          </div>
          <div class="history-actions">
            <button type="button" class="btn btn-ghost btn-sm" data-view-submission="${escapeHtml(item.reference)}">View</button>
            <button type="button" class="btn btn-quiet btn-sm" data-delete-submission="${escapeHtml(item.reference)}">Delete</button>
          </div>
          <div class="history-detail" id="detail-${escapeHtml(FF.utils.slug(item.reference))}" hidden></div>
        </article>`;
      })
      .join("")}</div>`;
  }

  function openHistory(highlight) {
    $("#history-body").innerHTML = historyMarkup(highlight);
    FF.ui.openDialog($("#history-dialog"));
  }

  $("#btn-history").addEventListener("click", () => openHistory(null));
  $("#btn-history-m").addEventListener("click", () => {
    closeMobileSteps();
    openHistory(null);
  });

  $("#history-body").addEventListener("click", async (event) => {
    const viewBtn = event.target.closest("[data-view-submission]");
    if (viewBtn) {
      const reference = viewBtn.dataset.viewSubmission;
      const history = FF.storage.getHistory();
      const item = history.find((entry) => entry.reference === reference);
      const detail = document.getElementById(`detail-${FF.utils.slug(reference)}`);
      if (!item || !detail) return;
      if (!detail.hidden) {
        detail.hidden = true;
        viewBtn.textContent = "View";
        return;
      }
      const rows = form.STEPS.slice(0, 4)
        .flatMap((step) => step.fields)
        .map((field) => {
          const value = (() => {
            const raw = item.data[field.name];
            if (raw === undefined || raw === null || raw === "") return "";
            if (Array.isArray(raw)) return raw.join(", ");
            if (typeof raw === "object") return raw.name || "";
            if (field.type === "range") return `$${Number(raw).toLocaleString()} / year`;
            return String(raw);
          })();
          return `<div class="review-row"><dt>${escapeHtml(field.label)}</dt><dd class="${value ? "" : "is-empty"}">${value ? escapeHtml(value) : "Not provided"}</dd></div>`;
        })
        .join("");
      detail.innerHTML = `<dl class="review-list">${rows}</dl>`;
      detail.hidden = false;
      viewBtn.textContent = "Hide";
      return;
    }

    const deleteBtn = event.target.closest("[data-delete-submission]");
    if (deleteBtn) {
      const reference = deleteBtn.dataset.deleteSubmission;
      FF.ui.closeDialog(false);
      const ok = await FF.ui.confirm({
        title: "Delete this submission?",
        body: `Submission ${reference} will be permanently removed from this browser.`,
        confirmText: "Delete submission",
      });
      if (ok) {
        const currentHistory = FF.storage.getHistory();
        const next = currentHistory.filter((entry) => entry.reference !== reference);
        FF.storage.saveHistory(next);
        FF.ui.toast("Submission deleted.", "info");
        openHistory(null);
      } else {
        openHistory(null);
      }
      return;
    }
  });

  /* ------------------------------ Draft recovery --------------------------- */

  async function bootstrap() {
    FF.ui.initTheme();

    if (!FF.storage.isAvailable()) {
      FF.ui.toast("Browser storage is unavailable, so autosave is disabled.", "error", 6000);
    }

    const draft = FF.storage.getDraft();
    const hasContent =
      draft && draft.formData && Object.keys(draft.formData).some((key) => {
        const value = draft.formData[key];
        return Array.isArray(value) ? value.length > 0 : value !== "" && value !== undefined;
      });

    form.render();

    if (hasContent) {
      const resume = await FF.ui.confirm({
        title: "Welcome back",
        body: `We found an unfinished form from your previous session (saved ${FF.utils.timeAgo(draft.savedAt) || "recently"}). Would you like to continue where you left off?`,
        confirmText: "Continue where you left off",
        danger: false,
      });
      if (resume) {
        form.restoreDraft(draft);
        form.render();
        FF.ui.toast("Your previous progress was restored.", "success");
      } else {
        FF.storage.clearDraft();
        form.resetForm();
        form.render();
        FF.ui.toast("Started a new form.", "info");
      }
    }

    form.focusFirstField();

    setInterval(() => {
      if (!state.submission && !state.exited) form.saveDraft();
    }, 30000);
    setInterval(() => form.renderAutosave(), 20000);

    window.addEventListener("beforeunload", () => {
      if (!state.submission) form.saveDraft();
    });
  }

  window.addEventListener("error", () => {
    FF.ui.toast("Something went wrong, but your progress is safe.", "error");
  });

  bootstrap();
})();
