/* =============================================================================
 * VaultDrop — Drag & drop image uploader (frontend-only)
 * Vanilla JavaScript ES6+. No frameworks, no build step, no backend.
 *
 * NOTE ON SECURITY: all validation here happens in the browser and is for UX
 * only. A real upload service MUST re-validate MIME types, size and content
 * (and virus-scan) on the server. Files are never executed — only rendered as
 * images inside <img> elements.
 * ========================================================================== */
(() => {
  "use strict";

  /* ------------------------------ Config --------------------------------- */
  const CONFIG = {
    ACCEPTED_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/gif"],
    ACCEPTED_EXT: ["jpg", "jpeg", "png", "gif"],
    MAX_FILE_SIZE: 10 * 1024 * 1024,      // 10 MB per image
    STORAGE_BUDGET: 1024 * 1024 * 1024,      // conservative localStorage budget
    STORAGE_WARN_RATIO: 0.8,
    KEYS: { images: "vaultdrop.images", theme: "vaultdrop.theme", view: "vaultdrop.view", prefs: "vaultdrop.prefs" },
    UPLOAD: { tickMs: 90, minStep: 4, maxStep: 13, prepareMs: 350, processMs: 700 },
    TOAST_MS: 4200,
  };

  const STATUS = { WAITING: "waiting", PREPARING: "preparing", UPLOADING: "uploading", PROCESSING: "processing", COMPLETED: "completed", FAILED: "failed" };

  /* ------------------------------ State ---------------------------------- */
  const state = {
    images: [],          // persisted library
    queue: [],           // transient upload queue
    view: "grid",
    search: "",
    filter: "all",
    sort: "newest",
    lightboxIds: [],
    lightboxIndex: -1,
    lastFocused: null,
  };

  /* ------------------------------ DOM refs -------------------------------- */
  const $ = (sel) => document.querySelector(sel);
  const el = {
    dropzone: $("#dropzone"), dzTitle: $("#dzTitle"), dzSub: $("#dzSub"),
    browseBtn: $("#browseBtn"), fileInput: $("#fileInput"), errorList: $("#errorList"),
    statTotal: $("#statTotal"), statSize: $("#statSize"), statDone: $("#statDone"), statFailed: $("#statFailed"),
    queuePanel: $("#queuePanel"), queueList: $("#queueList"), clearQueueBtn: $("#clearQueueBtn"),
    gallery: $("#gallery"), emptyState: $("#emptyState"),
    searchInput: $("#searchInput"), filterSelect: $("#filterSelect"), sortSelect: $("#sortSelect"),
    clearAllBtn: $("#clearAllBtn"), themeToggle: $("#themeToggle"),
    storageText: $("#storageText"), storageBar: $("#storageBar"), storageMeter: $("#storageMeter"),
    lightbox: $("#lightbox"), lbImg: $("#lbImg"), lbName: $("#lbName"), lbMeta: $("#lbMeta"),
    lbDetails: $("#lbDetails"), lbClose: $("#lbClose"), lbPrev: $("#lbPrev"), lbNext: $("#lbNext"),
    dialog: $("#dialog"), dlgTitle: $("#dlgTitle"), dlgText: $("#dlgText"), dlgInputWrap: $("#dlgInputWrap"),
    dlgInput: $("#dlgInput"), dlgCancel: $("#dlgCancel"), dlgConfirm: $("#dlgConfirm"), dlgExtra: $("#dlgExtra"),
    toasts: $("#toasts"), live: $("#liveRegion"),
  };

  /* ------------------------------ Utilities ------------------------------- */
  const uid = () => `img_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  const formatBytes = (bytes) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(i === 0 ? 0 : value < 10 ? 2 : 1)} ${units[i]}`;
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  const extensionOf = (name = "") => (name.split(".").pop() || "").toLowerCase();
  const escapeHtml = (str = "") => String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const capitalize = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

  const debounce = (fn, wait = 160) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  };

  /* ------------------------------ Toasts ---------------------------------- */
  function toast(type, message) {
    const node = document.createElement("div");
    node.className = `toast ${type}`;
    node.innerHTML =
      `<span class="toast-dot" aria-hidden="true"></span>
       <span class="toast-text"><b>${escapeHtml(capitalize(type))}</b>${escapeHtml(message)}</span>
       <button class="toast-close" type="button" aria-label="Dismiss notification">✕</button>`;
    const dismiss = () => {
      node.classList.add("leaving");
      setTimeout(() => node.remove(), 220);
    };
    node.querySelector(".toast-close").addEventListener("click", dismiss);
    el.toasts.appendChild(node);
    setTimeout(dismiss, CONFIG.TOAST_MS);
    announce(message);
  }
  const announce = (msg) => { el.live.textContent = msg; };

  /* --------------------------- Dialog helpers ----------------------------- */
  let dialogResolve = null;

  function openDialog({ title, text, confirmLabel = "Confirm", extraLabel = null, input = null }) {
    return new Promise((resolve) => {
      dialogResolve = resolve;
      state.lastFocused = document.activeElement;
      el.dlgTitle.textContent = title;
      el.dlgText.textContent = text;
      el.dlgConfirm.textContent = confirmLabel;
      el.dlgExtra.hidden = !extraLabel;
      if (extraLabel) el.dlgExtra.textContent = extraLabel;
      el.dlgInputWrap.hidden = input === null;
      el.dlgInput.value = input ?? "";
      el.dialog.hidden = false;
      (input === null ? el.dlgConfirm : el.dlgInput).focus();
      if (input !== null) el.dlgInput.select();
    });
  }

  function closeDialog(result) {
    if (el.dialog.hidden) return;
    el.dialog.hidden = true;
    const resolve = dialogResolve;
    dialogResolve = null;
    if (state.lastFocused && document.contains(state.lastFocused)) state.lastFocused.focus();
    if (resolve) resolve(result);
  }

  el.dlgCancel.addEventListener("click", () => closeDialog({ action: "cancel" }));
  el.dlgConfirm.addEventListener("click", () => closeDialog({ action: "confirm", value: el.dlgInput.value.trim() }));
  el.dlgExtra.addEventListener("click", () => closeDialog({ action: "extra" }));
  el.dialog.addEventListener("mousedown", (e) => { if (e.target === el.dialog) closeDialog({ action: "cancel" }); });
  el.dlgInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); el.dlgConfirm.click(); } });

  /* ------------------------------ Storage --------------------------------- */
  function safeParse(raw, fallback) {
    try { const v = JSON.parse(raw); return v ?? fallback; } catch { return fallback; }
  }

  function loadState() {
    try {
      state.images = safeParse(localStorage.getItem(CONFIG.KEYS.images), []) || [];
      if (!Array.isArray(state.images)) state.images = [];
      state.view = localStorage.getItem(CONFIG.KEYS.view) === "list" ? "list" : "grid";
      const prefs = safeParse(localStorage.getItem(CONFIG.KEYS.prefs), {}) || {};
      state.filter = prefs.filter || "all";
      state.sort = prefs.sort || "newest";
      state.search = prefs.search || "";
    } catch (err) {
      console.error("Failed to read localStorage", err);
      toast("error", "Saved data could not be read. Starting with an empty library.");
      state.images = [];
    }
  }

  /** Persist library; returns true on success, false on quota/other failure. */
  function persistImages() {
    try {
      localStorage.setItem(CONFIG.KEYS.images, JSON.stringify(state.images));
      updateStorageIndicator();
      return true;
    } catch (err) {
      console.error("localStorage write failed", err);
      toast("error", "Storage limit reached. Remove some images and try again.");
      updateStorageIndicator();
      return false;
    }
  }

  function persistPrefs() {
    try {
      localStorage.setItem(CONFIG.KEYS.view, state.view);
      localStorage.setItem(CONFIG.KEYS.prefs, JSON.stringify({ filter: state.filter, sort: state.sort, search: state.search }));
    } catch (err) { console.warn("Preferences could not be saved", err); }
  }

  const usedStorageBytes = () => state.images.reduce((sum, img) => sum + (img.data ? img.data.length : 0), 0);

  let storageWarned = false;
  function updateStorageIndicator() {
    const used = usedStorageBytes();
    const ratio = Math.min(used / CONFIG.STORAGE_BUDGET, 1);
    const pct = Math.round(ratio * 100);
    el.storageText.textContent = `${formatBytes(used)} / ${formatBytes(CONFIG.STORAGE_BUDGET)}`;
    el.storageBar.style.width = `${pct}%`;
    el.storageBar.classList.toggle("warn", ratio >= CONFIG.STORAGE_WARN_RATIO && ratio < 0.95);
    el.storageBar.classList.toggle("crit", ratio >= 0.95);
    el.storageMeter.setAttribute("aria-valuenow", String(pct));
    if (ratio >= CONFIG.STORAGE_WARN_RATIO && !storageWarned) {
      storageWarned = true;
      toast("warning", "Storage is almost full. Consider removing some images.");
    }
    if (ratio < CONFIG.STORAGE_WARN_RATIO) storageWarned = false;
  }

  /* ------------------------------- Theme ---------------------------------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    el.themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
    el.themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    try { localStorage.setItem(CONFIG.KEYS.theme, theme); } catch { /* ignore */ }
  }

  function initTheme() {
    let theme = null;
    try { theme = localStorage.getItem(CONFIG.KEYS.theme); } catch { /* ignore */ }
    if (theme !== "dark" && theme !== "light") {
      theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    applyTheme(theme);
  }

  el.themeToggle.addEventListener("click", () => {
    applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });

  /* ----------------------------- Validation ------------------------------- */
  function validateFile(file) {
    if (!file || typeof file !== "object" || typeof file.name !== "string") {
      return "Invalid file object. The item could not be read.";
    }
    const ext = extensionOf(file.name);
    const typeOk = CONFIG.ACCEPTED_TYPES.includes((file.type || "").toLowerCase());
    const extOk = CONFIG.ACCEPTED_EXT.includes(ext);
    if (!typeOk || !extOk) return "Unsupported file type. Please upload a JPG, PNG, or GIF image.";
    if (file.size === 0) return "This file is empty (0 bytes).";
    if (file.size > CONFIG.MAX_FILE_SIZE) return "This file exceeds the 10 MB limit.";
    return null;
  }

  function showErrors(errors) {
    el.errorList.innerHTML = errors
      .map((e) => `<li><b>${escapeHtml(e.name)}</b> — ${escapeHtml(e.message)}</li>`)
      .join("");
  }
  const clearErrors = () => { el.errorList.innerHTML = ""; };

  /* ------------------------- FileReader / intake --------------------------- */
  const readFileAsDataURL = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("FileReader failed to read this file."));
    reader.onabort = () => reject(new Error("Reading this file was aborted."));
    reader.readAsDataURL(file);
  });

  const findDuplicate = (file, dataUrl) =>
    state.images.find((img) => img.data === dataUrl || (img.originalName === file.name && img.size === file.size));

  /** Entry point for both drop and file picker. */
  async function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    clearErrors();

    const errors = [];
    const valid = [];
    files.forEach((file) => {
      const message = validateFile(file);
      if (message) errors.push({ name: file && file.name ? file.name : "Unknown file", message });
      else valid.push(file);
    });

    if (errors.length) {
      showErrors(errors);
      toast("error", `${errors.length} file${errors.length > 1 ? "s were" : " was"} rejected. See details above.`);
    }
    if (!valid.length) return;

    toast("info", `${valid.length} file${valid.length > 1 ? "s are" : " is"} waiting to upload.`);

    let completed = 0;
    for (const file of valid) {
      // Sequential processing keeps the queue readable and the UI responsive.
      // eslint-disable-next-line no-await-in-loop
      const ok = await ingestFile(file);
      if (ok) completed += 1;
    }
    if (completed) toast("success", `${completed} image${completed > 1 ? "s" : ""} uploaded successfully.`);
  }

  async function ingestFile(file) {
    const item = {
      id: uid(), name: file.name, size: file.size, type: file.type,
      progress: 0, status: STATUS.WAITING, thumb: "", removable: true,
    };
    state.queue.push(item);
    renderQueue();

    let dataUrl;
    try {
      dataUrl = await readFileAsDataURL(file);
      if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) throw new Error("The file is not a readable image.");
    } catch (err) {
      failQueueItem(item, err.message || "Could not read this file.");
      showErrors([{ name: file.name, message: err.message || "FileReader error." }]);
      return false;
    }
    if (!state.queue.includes(item)) return false;  // removed while reading

    item.thumb = dataUrl;
    renderQueue();

    // Duplicate detection
    const dupe = findDuplicate(file, dataUrl);
    if (dupe) {
      const res = await openDialog({
        title: "Duplicate image detected",
        text: `"${file.name}" is already in your library. Skip it, or upload another copy?`,
        confirmLabel: "Skip duplicate",
        extraLabel: "Upload anyway",
      });
      if (res.action !== "extra") {
        removeQueueItem(item.id);
        toast("info", "This image is already in your library — skipped.");
        return false;
      }
    }

    item.removable = false;
    const done = await simulateUpload(item);
    if (!done) return false;

    const record = {
      id: item.id,
      name: file.name,
      originalName: file.name,
      type: file.type,
      size: file.size,
      data: dataUrl,
      uploadedAt: new Date().toISOString(),
      status: STATUS.COMPLETED,
    };
    state.images.unshift(record);

    if (!persistImages()) {
      // Roll back the record so the UI never shows something that isn't saved.
      state.images = state.images.filter((i) => i.id !== record.id);
      failQueueItem(item, "Storage limit reached — this image was not saved.");
      renderGallery();
      return false;
    }

    renderGallery();
    renderStats();
    return true;
  }

  /* ------------------------ Simulated upload engine ------------------------ */
  /** Frontend-only simulation: Preparing → Uploading → Processing → Completed. */
  function simulateUpload(item) {
    return new Promise((resolve) => {
      setStatus(item, STATUS.PREPARING);
      setTimeout(() => {
        if (!state.queue.includes(item)) return resolve(false);
        setStatus(item, STATUS.UPLOADING);

        const timer = setInterval(() => {
          if (!state.queue.includes(item)) { clearInterval(timer); return resolve(false); }
          const step = CONFIG.UPLOAD.minStep + Math.random() * (CONFIG.UPLOAD.maxStep - CONFIG.UPLOAD.minStep);
          item.progress = Math.min(100, item.progress + step);
          updateQueueItem(item);

          if (item.progress >= 100) {
            clearInterval(timer);
            setStatus(item, STATUS.PROCESSING);
            setTimeout(() => {
              if (!state.queue.includes(item)) return resolve(false);
              setStatus(item, STATUS.COMPLETED);
              resolve(true);
            }, CONFIG.UPLOAD.processMs);
          }
        }, CONFIG.UPLOAD.tickMs);
      }, CONFIG.UPLOAD.prepareMs);
    });
  }

  function setStatus(item, status) {
    item.status = status;
    updateQueueItem(item);
    announce(`${item.name}: ${status}`);
  }

  function failQueueItem(item, message) {
    item.status = STATUS.FAILED;
    item.error = message;
    updateQueueItem(item);
    renderStats();
    toast("error", `${item.name}: ${message}`);
  }

  /* ------------------------------ Queue UI -------------------------------- */
  function renderQueue() {
    el.queuePanel.hidden = state.queue.length === 0;
    el.queueList.innerHTML = state.queue.map(queueItemHtml).join("");
  }

  function queueItemHtml(item) {
    const pct = Math.round(item.progress);
    return `<li class="queue-item" data-queue-id="${item.id}" data-state="${item.status}">
      ${item.thumb ? `<img class="queue-thumb" src="${item.thumb}" alt="" />` : `<span class="queue-thumb" aria-hidden="true"></span>`}
      <div>
        <div class="queue-name">${escapeHtml(item.name)}</div>
        <div class="queue-sub">
          <span class="badge ${item.status}">${escapeHtml(capitalize(item.status))}</span>
          <span>${formatBytes(item.size)}</span>
          <span class="queue-pct">${pct}%</span>
          ${item.error ? `<span>${escapeHtml(item.error)}</span>` : ""}
        </div>
        <div class="progress" role="progressbar" aria-label="Upload progress for ${escapeHtml(item.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}">
          <span style="width:${pct}%"></span>
        </div>
      </div>
      <div class="queue-actions">
        ${item.status === STATUS.COMPLETED || item.status === STATUS.FAILED || item.removable
          ? `<button class="btn btn-ghost btn-sm" type="button" data-queue-remove="${item.id}">Remove</button>` : ""}
      </div>
    </li>`;
  }

  /** Targeted DOM update — avoids re-rendering the whole queue each tick. */
  function updateQueueItem(item) {
    const node = el.queueList.querySelector(`[data-queue-id="${item.id}"]`);
    if (!node) { renderQueue(); return; }
    const pct = Math.round(item.progress);
    node.dataset.state = item.status;
    node.querySelector(".queue-pct").textContent = `${pct}%`;
    const badge = node.querySelector(".badge");
    badge.className = `badge ${item.status}`;
    badge.textContent = capitalize(item.status);
    const bar = node.querySelector(".progress");
    bar.setAttribute("aria-valuenow", String(pct));
    bar.firstElementChild.style.width = `${pct}%`;
    if (item.thumb && node.firstElementChild.tagName !== "IMG") renderQueue();
  }

  function removeQueueItem(id) {
    state.queue = state.queue.filter((i) => i.id !== id);
    renderQueue();
  }

  el.queueList.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-queue-remove]");
    if (btn) removeQueueItem(btn.dataset.queueRemove);
  });

  el.clearQueueBtn.addEventListener("click", () => {
    state.queue = state.queue.filter((i) => i.status !== STATUS.COMPLETED && i.status !== STATUS.FAILED);
    renderQueue();
  });

  /* ------------------------- Drag & drop handling -------------------------- */
  let dragDepth = 0;

  const hasFiles = (e) => Array.from(e.dataTransfer?.types || []).includes("Files");

  ["dragenter", "dragover", "dragleave", "drop"].forEach((type) => {
    // Prevent the browser from navigating to dropped files outside the zone.
    window.addEventListener(type, (e) => { if (hasFiles(e)) e.preventDefault(); });
  });

  el.dropzone.addEventListener("dragenter", (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    dragDepth += 1;
    setDragState(true);
  });

  el.dropzone.addEventListener("dragover", (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragState(true);
  });

  el.dropzone.addEventListener("dragleave", () => {
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) setDragState(false);
  });

  el.dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dragDepth = 0;
    setDragState(false);
    flashSuccess();
    handleFiles(e.dataTransfer?.files);
  });

  function setDragState(active) {
    el.dropzone.classList.toggle("is-dragging", active);
    el.dzTitle.textContent = active ? "Drop your images here" : "Drag & drop your images";
    el.dzSub.textContent = active
      ? "Release to add them to your upload queue"
      : "or browse from your device — JPG, JPEG, PNG, GIF · max 10 MB each";
  }

  function flashSuccess() {
    el.dropzone.classList.add("is-success");
    setTimeout(() => el.dropzone.classList.remove("is-success"), 700);
  }

  /* --------------------------- File picker -------------------------------- */
  const openPicker = () => el.fileInput.click();
  el.browseBtn.addEventListener("click", (e) => { e.stopPropagation(); openPicker(); });
  el.dropzone.addEventListener("click", (e) => { if (e.target === el.browseBtn) return; openPicker(); });
  el.dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPicker(); }
  });
  el.fileInput.addEventListener("change", (e) => {
    handleFiles(e.target.files);
    e.target.value = "";   // allow re-selecting the same file
  });

  /* ------------------------------ Gallery --------------------------------- */
  function visibleImages() {
    const term = state.search.trim().toLowerCase();
    let list = state.images.filter((img) => {
      if (term && !img.name.toLowerCase().includes(term)) return false;
      const ext = extensionOf(img.name) || (img.type || "").split("/")[1];
      switch (state.filter) {
        case "jpg": return ext === "jpg" || ext === "jpeg";
        case "png": return ext === "png";
        case "gif": return ext === "gif";
        case "completed": return img.status === STATUS.COMPLETED;
        case "failed": return img.status === STATUS.FAILED;
        default: return true;
      }
    });

    const byDate = (a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt);
    const sorters = {
      newest: (a, b) => byDate(b, a),
      oldest: byDate,
      az: (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      za: (a, b) => b.name.localeCompare(a.name, undefined, { sensitivity: "base" }),
      largest: (a, b) => b.size - a.size,
      smallest: (a, b) => a.size - b.size,
    };
    list = list.slice().sort(sorters[state.sort] || sorters.newest);
    return list;
  }

  function cardHtml(img) {
    const ext = (extensionOf(img.name) || "img").toUpperCase();
    const alt = `Uploaded image: ${img.name}`;
    const actions =
      `<button class="btn btn-ghost btn-sm" type="button" data-action="preview" data-id="${img.id}">Preview</button>
       <button class="btn btn-ghost btn-sm" type="button" data-action="download" data-id="${img.id}">Download</button>
       <button class="btn btn-ghost btn-sm" type="button" data-action="rename" data-id="${img.id}">Rename</button>
       <button class="btn btn-danger-ghost btn-sm" type="button" data-action="delete" data-id="${img.id}">Delete</button>`;

    if (state.view === "list") {
      return `<article class="card" data-id="${img.id}">
        <div class="card-media"><img src="${img.data}" alt="${escapeHtml(alt)}" loading="lazy" /></div>
        <div class="card-body"><div class="card-name">${escapeHtml(img.name)}</div>
          <span class="badge ${img.status}">${escapeHtml(capitalize(img.status))}</span></div>
        <div class="card-cell">${ext}</div>
        <div class="card-cell">${formatBytes(img.size)}</div>
        <div class="card-cell hide-md">${escapeHtml(formatDate(img.uploadedAt))}</div>
        <div class="card-actions">${actions}</div>
      </article>`;
    }

    return `<article class="card" data-id="${img.id}">
      <div class="card-media">
        <img src="${img.data}" alt="${escapeHtml(alt)}" loading="lazy" />
        <div class="card-overlay">
          <button class="overlay-btn" type="button" data-action="preview" data-id="${img.id}">Preview image</button>
        </div>
      </div>
      <div class="card-body">
        <div class="card-name">${escapeHtml(img.name)}</div>
        <div class="card-meta">
          <span>${ext}</span><span>${formatBytes(img.size)}</span><span>${escapeHtml(formatDate(img.uploadedAt))}</span>
        </div>
        <span class="badge ${img.status}">${escapeHtml(capitalize(img.status))}</span>
        <div class="card-actions">${actions}</div>
      </div>
    </article>`;
  }

  function renderGallery() {
    const list = visibleImages();
    el.gallery.className = `gallery ${state.view === "list" ? "list-view" : "grid-view"}`;
    el.gallery.innerHTML = list.map(cardHtml).join("");
    el.gallery.hidden = list.length === 0;
    renderEmptyState(list.length);
    renderStats();
  }

  function renderEmptyState(count) {
    if (count > 0) { el.emptyState.hidden = true; return; }
    let title = "Your image library is empty.";
    let text = "Drop an image above or browse your device to get started.";
    let icon = "🗂";
    if (state.images.length > 0 && state.search.trim()) {
      title = "No images found."; text = "No images match your search. Try a different filename."; icon = "🔍";
    } else if (state.images.length > 0) {
      title = "No images match this filter."; text = "Adjust the filter or sorting options to see more results."; icon = "🧭";
    }
    el.emptyState.innerHTML =
      `<span class="empty-icon" aria-hidden="true">${icon}</span><h3>${title}</h3><p>${text}</p>`;
    el.emptyState.hidden = false;
  }

  function renderStats() {
    el.statTotal.textContent = String(state.images.length);
    el.statSize.textContent = formatBytes(state.images.reduce((s, i) => s + i.size, 0));
    el.statDone.textContent = String(state.images.filter((i) => i.status === STATUS.COMPLETED).length);
    el.statFailed.textContent = String(state.queue.filter((i) => i.status === STATUS.FAILED).length);
  }

  /* --------------------------- Gallery actions ----------------------------- */
  // Event delegation: one listener handles every card action.
  el.gallery.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === "preview") openLightbox(id);
    else if (action === "download") downloadImage(id);
    else if (action === "rename") renameImage(id);
    else if (action === "delete") deleteImage(id);
  });

  const getImage = (id) => state.images.find((i) => i.id === id);

  function downloadImage(id) {
    const img = getImage(id);
    if (!img) return;
    try {
      const link = document.createElement("a");
      link.href = img.data;
      link.download = img.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast("success", `Downloading "${img.name}".`);
    } catch (err) {
      console.error(err);
      toast("error", "This image could not be downloaded.");
    }
  }

  async function renameImage(id) {
    const img = getImage(id);
    if (!img) return;
    const res = await openDialog({
      title: "Rename image",
      text: "Choose a new display name. The original filename is kept for reference.",
      confirmLabel: "Save name",
      input: img.name,
    });
    if (res.action !== "confirm") return;
    const value = (res.value || "").trim();
    if (!value) { toast("warning", "The name cannot be empty."); return; }
    img.name = value;
    if (persistImages()) {
      renderGallery();
      if (!el.lightbox.hidden) renderLightbox();
      toast("success", "Image renamed.");
    }
  }

  async function deleteImage(id) {
    const img = getImage(id);
    if (!img) return;
    const res = await openDialog({
      title: "Delete image",
      text: `"${img.name}" will be permanently removed from your library. This cannot be undone.`,
      confirmLabel: "Delete image",
    });
    if (res.action !== "confirm") return;
    state.images = state.images.filter((i) => i.id !== id);
    persistImages();
    if (!el.lightbox.hidden) closeLightbox();
    renderGallery();
    toast("success", "Image deleted.");
  }

  el.clearAllBtn.addEventListener("click", async () => {
    if (!state.images.length) { toast("info", "Your library is already empty."); return; }
    const res = await openDialog({
      title: "Clear all images",
      text: `All ${state.images.length} image(s) will be permanently removed from this browser.`,
      confirmLabel: "Clear everything",
    });
    if (res.action !== "confirm") return;
    state.images = [];
    persistImages();
    renderGallery();
    toast("success", "Library cleared.");
  });

  /* ------------------------- Search / filter / sort ------------------------ */
  el.searchInput.addEventListener("input", debounce((e) => {
    state.search = e.target.value;
    persistPrefs();
    renderGallery();
  }, 140));

  el.filterSelect.addEventListener("change", (e) => { state.filter = e.target.value; persistPrefs(); renderGallery(); });
  el.sortSelect.addEventListener("change", (e) => { state.sort = e.target.value; persistPrefs(); renderGallery(); });

  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });

  function setView(view) {
    state.view = view === "list" ? "list" : "grid";
    document.querySelectorAll(".view-btn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === state.view)));
    persistPrefs();
    renderGallery();
  }

  /* ------------------------------ Lightbox --------------------------------- */
  function openLightbox(id) {
    const list = visibleImages();
    const index = list.findIndex((i) => i.id === id);
    if (index === -1) return;
    state.lightboxIds = list.map((i) => i.id);
    state.lightboxIndex = index;
    state.lastFocused = document.activeElement;
    el.lightbox.hidden = false;
    renderLightbox();
    el.lbClose.focus();
  }

  function renderLightbox() {
    const img = getImage(state.lightboxIds[state.lightboxIndex]);
    if (!img) { closeLightbox(); return; }
    el.lbImg.src = img.data;
    el.lbImg.alt = `Full preview of ${img.name}`;
    el.lbName.textContent = img.name;
    el.lbMeta.textContent = `${state.lightboxIndex + 1} of ${state.lightboxIds.length} · ${formatBytes(img.size)}`;
    el.lbDetails.innerHTML = [
      ["Filename", img.name],
      ["Original name", img.originalName],
      ["Extension", (extensionOf(img.name) || "—").toUpperCase()],
      ["MIME type", img.type || "—"],
      ["File size", formatBytes(img.size)],
      ["Uploaded", formatDate(img.uploadedAt)],
      ["Status", capitalize(img.status)],
    ].map(([k, v]) => `<div><dt>${k}</dt><dd>${escapeHtml(String(v))}</dd></div>`).join("");
    const multiple = state.lightboxIds.length > 1;
    el.lbPrev.hidden = !multiple;
    el.lbNext.hidden = !multiple;
  }

  function stepLightbox(delta) {
    if (state.lightboxIds.length < 2) return;
    state.lightboxIndex = (state.lightboxIndex + delta + state.lightboxIds.length) % state.lightboxIds.length;
    renderLightbox();
  }

  function closeLightbox() {
    el.lightbox.hidden = true;
    el.lbImg.removeAttribute("src");
    if (state.lastFocused && document.contains(state.lastFocused)) state.lastFocused.focus();
  }

  el.lbClose.addEventListener("click", closeLightbox);
  el.lbPrev.addEventListener("click", () => stepLightbox(-1));
  el.lbNext.addEventListener("click", () => stepLightbox(1));
  el.lightbox.addEventListener("mousedown", (e) => { if (e.target === el.lightbox) closeLightbox(); });

  el.lightbox.querySelectorAll("[data-lb-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = state.lightboxIds[state.lightboxIndex];
      if (btn.dataset.lbAction === "download") downloadImage(id);
      if (btn.dataset.lbAction === "rename") renameImage(id);
      if (btn.dataset.lbAction === "delete") deleteImage(id);
    });
  });

  /* --------------------------- Keyboard support ---------------------------- */
  document.addEventListener("keydown", (e) => {
    if (!el.dialog.hidden) {
      if (e.key === "Escape") { e.preventDefault(); closeDialog({ action: "cancel" }); }
      if (e.key === "Tab") trapFocus(e, el.dialog);
      return;
    }
    if (!el.lightbox.hidden) {
      if (e.key === "Escape") { e.preventDefault(); closeLightbox(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); stepLightbox(-1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); stepLightbox(1); }
      else if (e.key === "Tab") trapFocus(e, el.lightbox);
    }
  });

  /** Keeps keyboard focus inside an open modal. */
  function trapFocus(e, container) {
    const focusables = container.querySelectorAll('button:not([hidden]), input, select, a[href], [tabindex]:not([tabindex="-1"])');
    const items = Array.from(focusables).filter((n) => n.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* -------------------------- Global error safety -------------------------- */
  window.addEventListener("error", (e) => {
    console.error("Unexpected error", e.error || e.message);
    toast("error", "Something unexpected happened, but VaultDrop is still running.");
  });
  window.addEventListener("unhandledrejection", (e) => {
    console.error("Unhandled rejection", e.reason);
  });

  /* -------------------------------- Init ----------------------------------- */
  function init() {
    initTheme();
    loadState();
    el.searchInput.value = state.search;
    el.filterSelect.value = state.filter;
    el.sortSelect.value = state.sort;
    setView(state.view);
    updateStorageIndicator();
    renderQueue();
    renderGallery();
  }

  init();
})();
