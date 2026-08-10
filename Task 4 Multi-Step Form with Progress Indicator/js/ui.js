/* FormFlow — ui.js
 * Toasts, accessible dialogs, theme handling and focus utilities.
 */
window.FF = window.FF || {};

FF.ui = (function () {
  const { $, $$, escapeHtml } = FF.utils;

  /* ------------------------------ Toasts ------------------------------ */
  function toast(message, variant = "info", timeout = 4000) {
    const stack = $("#toast-stack");
    if (!stack) return;
    const node = document.createElement("div");
    node.className = `toast toast--${variant}`;
    node.setAttribute("role", variant === "error" ? "alert" : "status");
    node.innerHTML = `
      <span class="toast-icon" aria-hidden="true">${
        variant === "success" ? "✓" : variant === "error" ? "!" : "i"
      }</span>
      <span class="toast-text">${escapeHtml(message)}</span>
    `;
    stack.appendChild(node);
    const remove = () => {
      node.classList.add("is-leaving");
      setTimeout(() => node.remove(), 220);
    };
    setTimeout(remove, timeout);
    node.addEventListener("click", remove);
  }

  /* ------------------------------ Dialogs ----------------------------- */
  let openDialogEl = null;
  let lastFocused = null;

  const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function trapKeydown(event) {
    if (!openDialogEl) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeDialog(false);
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = $$(FOCUSABLE, openDialogEl).filter((el) => el.offsetParent !== null);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  let dialogResolver = null;

  function openDialog(dialogEl, onClose) {
    lastFocused = document.activeElement;
    openDialogEl = dialogEl;
    dialogResolver = onClose || null;
    $("#overlay").hidden = false;
    dialogEl.hidden = false;
    document.body.classList.add("is-locked");
    document.addEventListener("keydown", trapKeydown, true);
    const focusable = $$(FOCUSABLE, dialogEl);
    (focusable[0] || dialogEl).focus();
  }

  function closeDialog(result) {
    if (!openDialogEl) return;
    openDialogEl.hidden = true;
    $("#overlay").hidden = true;
    document.body.classList.remove("is-locked");
    document.removeEventListener("keydown", trapKeydown, true);
    const resolver = dialogResolver;
    openDialogEl = null;
    dialogResolver = null;
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
    if (typeof resolver === "function") resolver(result);
  }

  /** Accessible confirmation dialog. Resolves true/false. */
  function confirm({ title, body, confirmText = "Confirm", danger = true }) {
    return new Promise((resolve) => {
      const dialog = $("#confirm-dialog");
      $("#confirm-title").textContent = title;
      $("#confirm-body").textContent = body;
      const okBtn = $("#confirm-ok");
      okBtn.textContent = confirmText;
      okBtn.className = `btn ${danger ? "btn-danger" : "btn-primary"}`;
      openDialog(dialog, (result) => resolve(Boolean(result)));
    });
  }

  /* ------------------------------- Theme ------------------------------ */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const icon = $("#theme-icon");
    const btn = $("#btn-theme");
    if (icon) icon.textContent = theme === "dark" ? "☀" : "☾";
    if (btn)
      btn.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
      );
  }

  function initTheme() {
    const saved = FF.storage.getTheme();
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));
  }

  function toggleTheme() {
    const next =
      document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    FF.storage.saveTheme(next);
    toast(`${next === "dark" ? "Dark" : "Light"} theme enabled.`, "info", 2200);
  }

  /* ------------------------------ Helpers ----------------------------- */
  function focusField(name) {
    const el = document.querySelector(`[data-field="${name}"] .focus-target`);
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({
      behavior: FF.utils.prefersReducedMotion() ? "auto" : "smooth",
      block: "center",
    });
  }

  return { toast, confirm, openDialog, closeDialog, initTheme, toggleTheme, applyTheme, focusField };
})();