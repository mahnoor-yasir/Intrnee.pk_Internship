/* FormFlow — utils.js
 * Small DOM + formatting helpers shared across modules.
 */
window.FF = window.FF || {};

FF.utils = (function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /** Escape a value for safe interpolation into innerHTML. */
  function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function debounce(fn, wait) {
    let timer = null;
    return function debounced(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  /** FF-2026-XXXXXX reference number (client-side only). */
  function referenceNumber() {
    const year = new Date().getFullYear();
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let suffix = "";
    const random = new Uint32Array(6);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(random);
      for (let i = 0; i < 6; i += 1) suffix += alphabet[random[i] % alphabet.length];
    } else {
      for (let i = 0; i < 6; i += 1)
        suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return `FF-${year}-${suffix}`;
  }

  function formatDateTime(iso) {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /** "just now" / "3 minutes ago" / "2 hours ago" */
  function timeAgo(iso) {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    if (Number.isNaN(diff)) return "";
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes === 1) return "1 minute ago";
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return "1 hour ago";
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? "1 day ago" : `${days} days ago`;
  }

  function formatBytes(bytes) {
    if (!bytes && bytes !== 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /** Read a File as a data URL (used for local-only previews). */
  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Could not read the selected file."));
      reader.readAsDataURL(file);
    });
  }

  function slug(value) {
    return String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  return {
    $,
    $$,
    escapeHtml,
    debounce,
    referenceNumber,
    formatDateTime,
    timeAgo,
    formatBytes,
    prefersReducedMotion,
    readFileAsDataURL,
    slug,
  };
})();