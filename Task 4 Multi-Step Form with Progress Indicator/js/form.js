/* FormFlow — form.js
 * Form schema, state, rendering, navigation, review and submission.
 */
window.FF = window.FF || {};

FF.form = (function () {
  const { $, $$, escapeHtml, formatBytes, prefersReducedMotion } = FF.utils;
  const V = FF.validation;

  /* =========================== Schema =========================== */

  const COUNTRIES = [
    "Pakistan","India","United States","United Kingdom","Canada","Australia","Germany","France",
    "Netherlands","Spain","Italy","Sweden","Norway","Denmark","Ireland","Poland","Portugal",
    "United Arab Emirates","Saudi Arabia","Qatar","Turkey","Egypt","South Africa","Nigeria","Kenya",
    "Brazil","Mexico","Argentina","China","Japan","South Korea","Singapore","Malaysia","Indonesia",
    "Bangladesh","Sri Lanka","New Zealand","Other",
  ];

  const RESUME_SPEC = { extensions: ["pdf", "doc", "docx"], maxBytes: 5 * 1024 * 1024 };
  const PHOTO_SPEC = { extensions: ["jpg", "jpeg", "png", "webp"], maxBytes: 2 * 1024 * 1024 };

  const STEPS = [
    {
      id: "personal",
      title: "Personal Information",
      short: "Personal",
      description: "Tell us who you are. We use these details to contact you about your application.",
      fields: [
        { name: "firstName", label: "First Name", type: "text", required: true, placeholder: "Ayesha", autocomplete: "given-name", maxLength: 60, half: true },
        { name: "lastName", label: "Last Name", type: "text", required: true, placeholder: "Khan", autocomplete: "family-name", maxLength: 60, half: true },
        { name: "email", label: "Email Address", type: "email", required: true, placeholder: "ayesha.khan@company.com", autocomplete: "email", half: true },
        { name: "phone", label: "Phone Number", type: "tel", required: true, placeholder: "+92 300 1234567", autocomplete: "tel", help: "Include your country code for international numbers.", half: true },
        { name: "dob", label: "Date of Birth", type: "date", noFuture: true, minAge: 16, maxAge: 100, half: true },
        { name: "gender", label: "Gender", type: "select", options: ["Female", "Male", "Non-binary", "Prefer not to say"], placeholder: "Select an option", half: true },
        { name: "country", label: "Country", type: "select", required: true, options: COUNTRIES, placeholder: "Select your country", autocomplete: "country-name", half: true },
        { name: "city", label: "City", type: "text", required: true, placeholder: "Karachi", autocomplete: "address-level2", maxLength: 80, half: true },
        { name: "postalCode", label: "Postal Code", type: "text", placeholder: "75500", autocomplete: "postal-code", maxLength: 12, half: true },
      ],
    },
    {
      id: "professional",
      title: "Professional Information",
      short: "Professional",
      description: "Share your current role and experience so we can match you with the right opportunities.",
      fields: [
        { name: "jobTitle", label: "Current Job Title", type: "text", required: true, placeholder: "Frontend Engineer", maxLength: 80, half: true },
        { name: "company", label: "Company / Organization", type: "text", placeholder: "Northwind Labs", maxLength: 80, half: true },
        { name: "experience", label: "Years of Experience", type: "number", required: true, min: 0, max: 50, step: 1, placeholder: "4", half: true },
        { name: "employmentStatus", label: "Employment Status", type: "select", required: true, options: ["Employed full-time", "Employed part-time", "Self-employed", "Freelancing", "Student", "Unemployed", "Career break"], placeholder: "Select your status", half: true },
        { name: "industry", label: "Industry", type: "select", required: true, options: ["Software & Technology", "Finance & Banking", "Healthcare", "Education", "E-commerce & Retail", "Telecommunications", "Manufacturing", "Media & Entertainment", "Government", "Non-profit", "Other"], placeholder: "Select an industry", half: true },
        { name: "primarySkill", label: "Primary Skill", type: "text", required: true, placeholder: "React & TypeScript", maxLength: 60, half: true },
        { name: "website", label: "Professional Website", type: "url", placeholder: "https://ayeshakhan.dev", half: true },
        { name: "linkedin", label: "LinkedIn Profile", type: "url", placeholder: "https://linkedin.com/in/ayeshakhan", half: true },
        { name: "additionalSkills", label: "Additional Skills", type: "checkboxGroup", columns: 3, options: ["JavaScript","TypeScript","React","Node.js","Python","SQL","Figma","Testing","Docker","AWS","Kubernetes","Go"], help: "Select every skill you use regularly." },
      ],
    },
    {
      id: "preferences",
      title: "Preferences",
      short: "Preferences",
      description: "Help us understand the kind of work you are looking for.",
      fields: [
        { name: "workType", label: "Preferred Work Type", type: "radioCards", required: true, options: [
          { value: "Remote", hint: "Work from anywhere" },
          { value: "Hybrid", hint: "Mix of office and home" },
          { value: "On-site", hint: "Fully in the office" },
        ] },
        { name: "availability", label: "Availability", type: "select", required: true, options: ["Immediately", "Within 2 weeks", "Within 1 month", "1–3 months"], placeholder: "Select your availability", half: true },
        { name: "employmentType", label: "Preferred Employment Type", type: "select", required: true, options: ["Full-time", "Part-time", "Contract", "Freelance", "Internship"], placeholder: "Select employment type", half: true },
        { name: "interests", label: "Areas of Interest", type: "checkboxGroup", required: true, columns: 2, cards: true, options: [
          "Web Development","Software Engineering","UI/UX","Data Science","Artificial Intelligence",
          "Cybersecurity","Mobile Development","Cloud Computing","DevOps","Product Development",
        ], help: "Choose one or more areas you want to work in." },
        { name: "salary", label: "Preferred Salary Range", type: "range", min: 20000, max: 300000, step: 5000, default: 80000, help: "Expected annual compensation in USD." },
      ],
    },
    {
      id: "additional",
      title: "Additional Details",
      short: "Details",
      description: "Add context to your application and attach supporting documents.",
      fields: [
        { name: "bio", label: "Short Professional Bio", type: "textarea", required: true, minLength: 40, maxLength: 600, rows: 5, placeholder: "Frontend engineer with 4 years building accessible design systems…" },
        { name: "comments", label: "Additional Comments", type: "textarea", maxLength: 300, rows: 3, placeholder: "Anything else you would like us to know?" },
        { name: "portfolio", label: "Portfolio URL", type: "url", placeholder: "https://dribbble.com/ayesha", half: true },
        { name: "resume", label: "Resume / CV", type: "file", spec: RESUME_SPEC, required: true, accept: ".pdf,.doc,.docx", help: "PDF, DOC or DOCX up to 5 MB. Files stay on this device." },
        { name: "photo", label: "Profile Photo", type: "file", spec: PHOTO_SPEC, accept: ".jpg,.jpeg,.png,.webp", preview: true, help: "JPG, JPEG, PNG or WEBP up to 2 MB." },
      ],
    },
    { id: "review", title: "Review & Confirm", short: "Review", description: "Check everything below, then confirm and submit.", fields: [] },
  ];

  const TOTAL = STEPS.length;

  /* =========================== State =========================== */

  const state = {
    formData: {},
    currentStep: 0,
    completedSteps: [],
    errors: {},
    touched: {},
    stepSubmitted: {},
    confirmed: false,
    autosaveStatus: "idle",
    draftTimestamp: null,
    submitting: false,
    submission: null,
    exited: false,
  };

  function allFields() {
    return STEPS.flatMap((step) => step.fields);
  }

  function fieldByName(name) {
    return allFields().find((field) => field.name === name);
  }

  /* =========================== Persistence =========================== */

  function draftPayload() {
    return {
      formData: state.formData,
      currentStep: state.currentStep,
      completedSteps: state.completedSteps,
      confirmed: state.confirmed,
      savedAt: new Date().toISOString(),
    };
  }

  function setAutosaveStatus(status) {
    state.autosaveStatus = status;
    renderAutosave();
  }

  function renderAutosave() {
    const text = $("#autosave-text");
    const wrap = $("#autosave-status");
    if (!text || !wrap) return;
    wrap.dataset.status = state.autosaveStatus;
    if (state.autosaveStatus === "saving") {
      text.textContent = "Saving…";
    } else if (state.autosaveStatus === "error") {
      text.textContent = "Could not save locally";
    } else if (state.draftTimestamp) {
      const ago = FF.utils.timeAgo(state.draftTimestamp);
      text.textContent = ago === "just now" ? "Saved just now" : `Last saved ${ago}`;
    } else {
      text.textContent = "Not saved yet";
    }
  }

  function saveDraft({ silent = true } = {}) {
    if (state.submission) return true;
    setAutosaveStatus("saving");
    const payload = draftPayload();
    const ok = FF.storage.saveDraft(payload);
    if (ok) {
      state.draftTimestamp = payload.savedAt;
      setAutosaveStatus("saved");
      if (!silent) FF.ui.toast("Draft saved to this browser.", "success");
    } else {
      setAutosaveStatus("error");
      if (!silent)
        FF.ui.toast("Saving failed — browser storage is unavailable or full.", "error");
    }
    return ok;
  }

  const autosave = FF.utils.debounce(() => saveDraft(), 600);

  function restoreDraft(draft) {
    state.formData = draft.formData && typeof draft.formData === "object" ? draft.formData : {};
    state.completedSteps = Array.isArray(draft.completedSteps) ? draft.completedSteps : [];
    state.currentStep = Math.min(Math.max(Number(draft.currentStep) || 0, 0), TOTAL - 1);
    state.confirmed = Boolean(draft.confirmed);
    state.draftTimestamp = draft.savedAt || null;
    setAutosaveStatus("saved");
  }

  function resetForm() {
    state.formData = {};
    state.currentStep = 0;
    state.completedSteps = [];
    state.errors = {};
    state.touched = {};
    state.stepSubmitted = {};
    state.confirmed = false;
    state.submission = null;
    state.exited = false;
    state.draftTimestamp = null;
    setAutosaveStatus("idle");
  }

  /* =========================== Validation glue =========================== */

  function validateStep(index) {
    const step = STEPS[index];
    if (!step || step.fields.length === 0) return {};
    return V.validateFields(step.fields, state.formData);
  }

  function isStepValid(index) {
    return Object.keys(validateStep(index)).length === 0;
  }

  function canNavigateTo(index) {
    if (index <= state.currentStep) return true;
    for (let i = 0; i < index; i += 1) {
      if (!isStepValid(i)) return false;
    }
    return true;
  }

  /* =========================== Field rendering =========================== */

  function describedBy(field) {
    const ids = [];
    if (field.help) ids.push(`${field.name}-help`);
    if (state.errors[field.name]) ids.push(`${field.name}-error`);
    if (field.type === "textarea") ids.push(`${field.name}-count`);
    return ids.length ? ` aria-describedby="${ids.join(" ")}"` : "";
  }

  function fieldShell(field, control) {
    const error = state.errors[field.name];
    const help = field.help
      ? `<p class="field-help" id="${field.name}-help">${escapeHtml(field.help)}</p>`
      : "";
    const errorNode = error
      ? `<p class="field-error" id="${field.name}-error"><span aria-hidden="true">⚠</span> ${escapeHtml(error)}</p>`
      : "";
    const isGroup = ["checkboxGroup", "radioCards"].includes(field.type);
    const labelTag = isGroup
      ? `<span class="field-label" id="${field.name}-label">${escapeHtml(field.label)}${field.required ? ' <em class="req" aria-hidden="true">*</em>' : ""}</span>`
      : `<label class="field-label" for="${field.name}">${escapeHtml(field.label)}${field.required ? ' <em class="req" aria-hidden="true">*</em>' : ""}</label>`;

    return `
      <div class="field ${field.half ? "field--half" : ""} ${error ? "has-error" : ""}" data-field="${field.name}">
        ${labelTag}
        ${!field.required ? '<span class="optional-tag">Optional</span>' : ""}
        ${control}
        ${help}
        ${errorNode}
      </div>`;
  }

  function renderInput(field) {
    const value = state.formData[field.name] ?? "";
    const type = field.type === "url" ? "text" : field.type;
    const attrs = [
      `id="${field.name}"`,
      `name="${field.name}"`,
      `type="${type}"`,
      `class="input focus-target"`,
      `value="${escapeHtml(value)}"`,
      field.placeholder ? `placeholder="${escapeHtml(field.placeholder)}"` : "",
      field.autocomplete ? `autocomplete="${field.autocomplete}"` : "",
      field.maxLength ? `maxlength="${field.maxLength}"` : "",
      field.min !== undefined ? `min="${field.min}"` : "",
      field.max !== undefined ? `max="${field.max}"` : "",
      field.step !== undefined ? `step="${field.step}"` : "",
      field.type === "date" ? `max="${new Date().toISOString().slice(0, 10)}"` : "",
      field.required ? 'aria-required="true"' : "",
      state.errors[field.name] ? 'aria-invalid="true"' : "",
    ]
      .filter(Boolean)
      .join(" ");
    return fieldShell(field, `<input ${attrs}${describedBy(field)} />`);
  }

  function renderSelect(field) {
    const value = state.formData[field.name] ?? "";
    const options = field.options
      .map((option) => {
        const val = typeof option === "string" ? option : option.value;
        return `<option value="${escapeHtml(val)}"${val === value ? " selected" : ""}>${escapeHtml(val)}</option>`;
      })
      .join("");
    return fieldShell(
      field,
      `<div class="select-wrap">
        <select id="${field.name}" name="${field.name}" class="input focus-target"${field.required ? ' aria-required="true"' : ""}${state.errors[field.name] ? ' aria-invalid="true"' : ""}${describedBy(field)}>
          <option value="">${escapeHtml(field.placeholder || "Select an option")}</option>
          ${options}
        </select>
        <span class="select-caret" aria-hidden="true">▾</span>
      </div>`,
    );
  }

  function renderTextarea(field) {
    const value = state.formData[field.name] ?? "";
    const used = String(value).length;
    return fieldShell(
      field,
      `<textarea id="${field.name}" name="${field.name}" class="input textarea focus-target" rows="${field.rows || 4}"
        maxlength="${field.maxLength}" placeholder="${escapeHtml(field.placeholder || "")}"
        ${field.required ? 'aria-required="true"' : ""}${state.errors[field.name] ? ' aria-invalid="true"' : ""}${describedBy(field)}>${escapeHtml(value)}</textarea>
      <p class="char-count ${used > field.maxLength * 0.9 ? "is-warning" : ""}" id="${field.name}-count">
        <span data-count-for="${field.name}">${used}</span> / ${field.maxLength} characters
      </p>`,
    );
  }

  function renderCheckboxGroup(field) {
    const selected = Array.isArray(state.formData[field.name]) ? state.formData[field.name] : [];
    const items = field.options
      .map((option) => {
        const checked = selected.includes(option);
        return `
        <label class="choice ${field.cards ? "choice--card" : ""} ${checked ? "is-selected" : ""}">
          <input type="checkbox" class="choice-input focus-target" name="${field.name}" value="${escapeHtml(option)}" ${checked ? "checked" : ""} data-group="${field.name}" />
          <span class="choice-box" aria-hidden="true"></span>
          <span class="choice-text">${escapeHtml(option)}</span>
        </label>`;
      })
      .join("");
    return fieldShell(
      field,
      `<div class="choice-grid" style="--cols:${field.columns || 2}" role="group" aria-labelledby="${field.name}-label"${state.errors[field.name] ? ' aria-invalid="true"' : ""}${describedBy(field)}>${items}</div>`,
    );
  }

  function renderRadioCards(field) {
    const value = state.formData[field.name] ?? "";
    const items = field.options
      .map((option) => {
        const val = typeof option === "string" ? option : option.value;
        const hint = typeof option === "string" ? "" : option.hint;
        const checked = value === val;
        return `
        <label class="choice choice--card choice--radio ${checked ? "is-selected" : ""}">
          <input type="radio" class="choice-input focus-target" name="${field.name}" value="${escapeHtml(val)}" ${checked ? "checked" : ""} data-radio="${field.name}" />
          <span class="choice-dot" aria-hidden="true"></span>
          <span class="choice-text">
            <strong>${escapeHtml(val)}</strong>
            ${hint ? `<small>${escapeHtml(hint)}</small>` : ""}
          </span>
        </label>`;
      })
      .join("");
    return fieldShell(
      field,
      `<div class="choice-grid" style="--cols:3" role="radiogroup" aria-labelledby="${field.name}-label"${describedBy(field)}>${items}</div>`,
    );
  }

  function renderRange(field) {
    if (state.formData[field.name] === undefined) state.formData[field.name] = field.default;
    const value = Number(state.formData[field.name]);
    return fieldShell(
      field,
      `<div class="range-wrap">
        <input type="range" id="${field.name}" name="${field.name}" class="range focus-target"
          min="${field.min}" max="${field.max}" step="${field.step}" value="${value}"
          aria-valuetext="${value.toLocaleString()} US dollars"${describedBy(field)} />
        <output class="range-output" for="${field.name}" data-range-out="${field.name}">$${value.toLocaleString()}${value >= field.max ? "+" : ""} / year</output>
      </div>
      <div class="range-scale" aria-hidden="true"><span>$${field.min.toLocaleString()}</span><span>$${field.max.toLocaleString()}+</span></div>`,
    );
  }

  function renderFile(field) {
    const meta = state.formData[field.name];
    const spec = field.spec;
    const body = meta
      ? `<div class="file-card">
          ${
            field.preview && meta.dataUrl
              ? `<img class="file-thumb" src="${escapeHtml(meta.dataUrl)}" alt="Preview of ${escapeHtml(meta.name)}" />`
              : `<span class="file-badge" aria-hidden="true">${escapeHtml((meta.name.split(".").pop() || "file").toUpperCase())}</span>`
          }
          <span class="file-meta">
            <strong>${escapeHtml(meta.name)}</strong>
            <small>${escapeHtml(formatBytes(meta.size))} · <span class="file-status">Ready</span></small>
          </span>
          <button type="button" class="btn btn-quiet btn-sm focus-target" data-remove-file="${field.name}">Remove</button>
        </div>`
      : `<div class="dropzone" data-dropzone="${field.name}" tabindex="0" role="button"
            aria-label="${escapeHtml(field.label)}: drag and drop a file here, or press Enter to browse"${describedBy(field)}>
          <span class="dropzone-icon" aria-hidden="true">⬆</span>
          <p class="dropzone-title">Drag &amp; drop your file here</p>
          <p class="dropzone-sub">or <span class="link-like">browse from your device</span></p>
          <p class="dropzone-types">${spec.extensions.join(", ").toUpperCase()} · max ${formatBytes(spec.maxBytes)}</p>
        </div>`;

    return fieldShell(
      field,
      `${body}
      <input type="file" class="visually-hidden focus-target" id="${field.name}" name="${field.name}" accept="${field.accept}" data-file-input="${field.name}" />`,
    );
  }

  function renderField(field) {
    switch (field.type) {
      case "select":
        return renderSelect(field);
      case "textarea":
        return renderTextarea(field);
      case "checkboxGroup":
        return renderCheckboxGroup(field);
      case "radioCards":
        return renderRadioCards(field);
      case "range":
        return renderRange(field);
      case "file":
        return renderFile(field);
      default:
        return renderInput(field);
    }
  }

  /* =========================== Review + success =========================== */

  function displayValue(field) {
    const value = state.formData[field.name];
    if (field.type === "file") return value ? `${value.name} (${formatBytes(value.size)})` : "";
    if (field.type === "range") return value ? `$${Number(value).toLocaleString()} / year` : "";
    if (Array.isArray(value)) return value.join(", ");
    return value === undefined || value === null ? "" : String(value);
  }

  function renderReview() {
    const sections = STEPS.slice(0, 4)
      .map((step, index) => {
        const rows = step.fields
          .map((field) => {
            const value = displayValue(field);
            return `<div class="review-row">
              <dt>${escapeHtml(field.label)}</dt>
              <dd class="${value ? "" : "is-empty"}">${value ? escapeHtml(value) : "Not provided"}</dd>
            </div>`;
          })
          .join("");
        const photo =
          step.id === "additional" && state.formData.photo && state.formData.photo.dataUrl
            ? `<img class="review-photo" src="${escapeHtml(state.formData.photo.dataUrl)}" alt="Your uploaded profile photo" />`
            : "";
        return `
        <section class="review-card">
          <header class="review-head">
            <h3>${escapeHtml(step.title)}</h3>
            <button type="button" class="btn btn-ghost btn-sm" data-edit-step="${index}">
              Edit<span class="visually-hidden"> ${escapeHtml(step.title)}</span>
            </button>
          </header>
          ${photo}
          <dl class="review-list">${rows}</dl>
        </section>`;
      })
      .join("");

    return `
      ${sections}
      <div class="confirm-box ${state.confirmed ? "is-checked" : ""}">
        <label class="choice choice--confirm">
          <input type="checkbox" class="choice-input focus-target" id="confirm-accuracy" ${state.confirmed ? "checked" : ""} />
          <span class="choice-box" aria-hidden="true"></span>
          <span class="choice-text">I confirm that the information provided above is accurate.</span>
        </label>
      </div>`;
  }

  function renderSuccess() {
    const submission = state.submission;
    const summary = [
      ["Name", `${submission.data.firstName || ""} ${submission.data.lastName || ""}`.trim()],
      ["Email", submission.data.email],
      ["Role", submission.data.jobTitle],
      ["Work type", submission.data.workType],
      ["Availability", submission.data.availability],
    ]
      .filter(([, value]) => value)
      .map(
        ([label, value]) =>
          `<div class="review-row"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`,
      )
      .join("");

    return `
      <div class="success" role="status">
        <div class="success-badge" aria-hidden="true">
          <svg viewBox="0 0 52 52" class="success-check" role="presentation">
            <circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" stroke-width="2" />
            <path fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" d="M15 27l8 8 15-16" />
          </svg>
        </div>
        <h2 class="success-title">Application Submitted Successfully</h2>
        <p class="success-sub">Thanks for applying. A copy of your submission is stored locally in this browser.</p>
        <div class="success-meta">
          <div><span>Reference number</span><strong>${escapeHtml(submission.reference)}</strong></div>
          <div><span>Submitted</span><strong>${escapeHtml(FF.utils.formatDateTime(submission.submittedAt))}</strong></div>
          <div><span>Status</span><strong>Received</strong></div>
        </div>
        <dl class="review-list success-summary">${summary}</dl>
        <div class="success-actions">
          <button type="button" class="btn btn-primary" id="btn-new-form">Start New Form</button>
          <button type="button" class="btn btn-ghost" id="btn-view-data">View Submitted Data</button>
        </div>
      </div>`;
  }

  function renderExit() {
    return `
      <div class="success" role="status">
        <div class="success-badge success-badge--muted" aria-hidden="true">💾</div>
        <h2 class="success-title">Progress saved</h2>
        <p class="success-sub">
          Your draft is stored safely in this browser. You can close the tab and continue later on
          this device — nothing is lost.
        </p>
        <p class="success-meta-line">Last saved ${escapeHtml(FF.utils.timeAgo(state.draftTimestamp) || "just now")}</p>
        <div class="success-actions">
          <button type="button" class="btn btn-primary" id="btn-resume">Resume form</button>
        </div>
      </div>`;
  }

  /* =========================== Step rendering =========================== */

  function errorSummary() {
    const keys = Object.keys(state.errors);
    if (keys.length === 0) return "";
    const items = keys
      .map(
        (name) =>
          `<li><button type="button" class="link-btn" data-goto-error="${name}">${escapeHtml(fieldByName(name)?.label || name)}: ${escapeHtml(state.errors[name])}</button></li>`,
      )
      .join("");
    return `
      <div class="error-summary" role="alert" tabindex="-1" id="error-summary">
        <h3>Please fix ${keys.length} ${keys.length === 1 ? "error" : "errors"} before continuing.</h3>
        <ul>${items}</ul>
      </div>`;
  }

  function render() {
    const region = $("#step-region");
    const step = STEPS[state.currentStep];

    if (state.submission) {
      region.innerHTML = renderSuccess();
    } else if (state.exited) {
      region.innerHTML = renderExit();
    } else {
      const body =
        step.id === "review"
          ? renderReview()
          : `<div class="field-grid">${step.fields.map(renderField).join("")}</div>`;
      region.innerHTML = `
        <article class="step ${prefersReducedMotion() ? "" : "step--enter"}" aria-labelledby="step-title">
          <header class="step-head">
            <p class="step-eyebrow">Step ${state.currentStep + 1} of ${TOTAL}</p>
            <h1 class="step-title" id="step-title">${escapeHtml(step.title)}</h1>
            <p class="step-desc">${escapeHtml(step.description)}</p>
          </header>
          ${errorSummary()}
          ${body}
        </article>`;
    }

    renderChrome();
    renderAutosave();
  }

  function renderChrome() {
    const isTerminal = Boolean(state.submission) || state.exited;
    const percent = isTerminal
      ? 100
      : Math.round(((state.currentStep + 1) / TOTAL) * 100);

    $("#progress-fill").style.width = `${percent}%`;
    $("#mobile-progress-fill").style.width = `${percent}%`;
    $("#progress-bar").setAttribute("aria-valuenow", String(percent));
    $("#sidebar-step-label").textContent = isTerminal
      ? "Complete"
      : `Step ${state.currentStep + 1} of ${TOTAL}`;
    $("#sidebar-percent").textContent = `${percent}% Complete`;
    $("#mobile-step-label").textContent = isTerminal
      ? "Complete"
      : `Step ${state.currentStep + 1} of ${TOTAL} · ${STEPS[state.currentStep].title}`;
    $("#mobile-percent").textContent = `${percent}%`;

    const listHtml = STEPS.map((step, index) => {
      const done = state.completedSteps.includes(index) && index !== state.currentStep;
      const current = index === state.currentStep && !isTerminal;
      const reachable = canNavigateTo(index) && !isTerminal;
      return `
      <li class="step-item ${done ? "is-done" : ""} ${current ? "is-current" : ""} ${reachable ? "" : "is-locked"}">
        <button type="button" class="step-btn" data-step="${index}" ${reachable ? "" : "disabled"}
          ${current ? 'aria-current="step"' : ""}>
          <span class="step-index" aria-hidden="true">${done ? "✓" : index + 1}</span>
          <span class="step-copy">
            <strong>${escapeHtml(step.short)}</strong>
            <small>${done ? "Completed" : current ? "In progress" : reachable ? "Available" : "Locked"}</small>
          </span>
        </button>
      </li>`;
    }).join("");

    $("#step-list").innerHTML = listHtml;
    $("#mobile-step-list").innerHTML = listHtml;

    const formbar = $("#formbar");
    formbar.hidden = isTerminal;
    const isReview = state.currentStep === TOTAL - 1;
    $("#btn-back").disabled = state.currentStep === 0;
    $("#btn-next").hidden = isReview;
    const submitBtn = $("#btn-submit");
    submitBtn.hidden = !isReview;
    submitBtn.disabled = !state.confirmed || state.submitting;
    submitBtn.textContent = state.submitting ? "Submitting…" : "Submit application";
  }

  /* =========================== Navigation =========================== */

  function focusFirstField() {
    const step = STEPS[state.currentStep];
    if (state.submission || state.exited || !step) return;
    const first = $("#step-region .focus-target:not([type=file])");
    if (first) first.focus({ preventScroll: true });
    $("#main-content").scrollTop = 0;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }

  function goToStep(index, { validate = false } = {}) {
    if (index < 0 || index >= TOTAL) return;
    if (validate) {
      const errors = validateStep(state.currentStep);
      state.errors = errors;
      if (Object.keys(errors).length > 0) {
        render();
        const summary = $("#error-summary");
        if (summary) {
          summary.focus();
          summary.scrollIntoView({
            behavior: prefersReducedMotion() ? "auto" : "smooth",
            block: "center",
          });
        }
        FF.ui.toast(
          `Please fix ${Object.keys(errors).length} ${Object.keys(errors).length === 1 ? "error" : "errors"} to continue.`,
          "error",
        );
        return;
      }
      if (!state.completedSteps.includes(state.currentStep))
        state.completedSteps.push(state.currentStep);
    }
    if (!canNavigateTo(index)) {
      FF.ui.toast("Complete the earlier steps first.", "error");
      return;
    }
    state.errors = {};
    state.currentStep = index;
    saveDraft();
    render();
    focusFirstField();
  }

  /* =========================== Submission =========================== */

  function submit() {
    if (state.submitting) return;
    if (!state.confirmed) {
      FF.ui.toast("Please confirm your information is accurate.", "error");
      return;
    }
    for (let i = 0; i < TOTAL - 1; i += 1) {
      const errors = validateStep(i);
      if (Object.keys(errors).length > 0) {
        state.currentStep = i;
        state.errors = errors;
        render();
        FF.ui.toast(`Some details in “${STEPS[i].title}” need attention.`, "error");
        return;
      }
    }

    state.submitting = true;
    renderChrome();

    setTimeout(() => {
      try {
        const formDataCopy = JSON.parse(JSON.stringify(state.formData));
        
        if (formDataCopy.resume && formDataCopy.resume.dataUrl) {
          delete formDataCopy.resume.dataUrl;
        }
        if (formDataCopy.photo && formDataCopy.photo.dataUrl) {
          delete formDataCopy.photo.dataUrl;
        }

        const submission = {
          reference: FF.utils.referenceNumber(),
          submittedAt: new Date().toISOString(),
          status: "Received",
          data: formDataCopy,
        };

        const saved = FF.storage.addSubmission(submission);
        
        if (!saved) {
          throw new Error("Failed to save submission to browser storage");
        }
        
        FF.storage.clearDraft();

        state.submission = submission;
        state.submitting = false;
        state.draftTimestamp = null;
        render();
        FF.ui.toast("Application submitted successfully!", "success");
        
      } catch (error) {
        console.error("Submission error:", error);
        state.submitting = false;
        renderChrome();
        FF.ui.toast("Submission failed. Please try again.", "error");
      }
    }, 700);
  }

  /* =========================== File handling =========================== */

  async function handleFile(fieldName, file) {
    const field = fieldByName(fieldName);
    if (!field || !file) return;
    const message = V.validateFile(file, field.spec);
    if (message) {
      state.errors[fieldName] = message;
      render();
      FF.ui.toast(message, "error");
      return;
    }
    try {
      const meta = { name: file.name, size: file.size, type: file.type };
      if (field.preview) meta.dataUrl = await FF.utils.readFileAsDataURL(file);
      state.formData[fieldName] = meta;
      delete state.errors[fieldName];
      render();
      FF.ui.toast(`${file.name} attached.`, "success");
      saveDraft();
    } catch (error) {
      FF.ui.toast("That file could not be read. Please try another file.", "error");
    }
  }

  function removeFile(fieldName) {
    delete state.formData[fieldName];
    render();
    saveDraft();
    FF.ui.toast("File removed.", "info");
  }

  return {
    STEPS: STEPS,
    TOTAL: TOTAL,
    state: state,
    fieldByName: fieldByName,
    render: render,
    renderChrome: renderChrome,
    renderAutosave: renderAutosave,
    goToStep: goToStep,
    saveDraft: saveDraft,
    autosave: autosave,
    restoreDraft: restoreDraft,
    resetForm: resetForm,
    validateStep: validateStep,
    isStepValid: isStepValid,
    canNavigateTo: canNavigateTo,
    submit: submit,
    handleFile: handleFile,
    removeFile: removeFile,
    displayValue: displayValue,
    setAutosaveStatus: setAutosaveStatus,
    focusFirstField: focusFirstField,
  };
})();