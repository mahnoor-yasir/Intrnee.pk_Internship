/**
 * NEXORA — local state store
 * Frontend-only persistence for the demo subscription, bookmarks, preferences,
 * activity log and notifications. Payment-card data is NEVER stored here.
 */
(function (ns) {
  "use strict";

  const KEYS = {
    subscription: "nexora:subscription",
    bookmarks: "nexora:bookmarks",
    prefs: "nexora:prefs",
    activity: "nexora:activity",
    notifications: "nexora:notifications",
  };

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* storage unavailable — the session still works in memory */
    }
  }

  const listeners = [];
  function emit() {
    listeners.forEach(function (fn) {
      try {
        fn();
      } catch (e) {
        console.error("[NEXORA] store listener failed", e);
      }
    });
  }
  function subscribe(fn) {
    listeners.push(fn);
    return function () {
      const i = listeners.indexOf(fn);
      if (i > -1) listeners.splice(i, 1);
    };
  }

  /* ------------------------------- Subscription ------------------------ */

  function getSubscription() {
    return readJSON(KEYS.subscription, null);
  }

  function setSubscription(sub) {
    writeJSON(KEYS.subscription, sub);
    emit();
  }

  function clearSubscription() {
    writeJSON(KEYS.subscription, null);
    emit();
  }

  /* -------------------------------- Bookmarks -------------------------- */

  function getBookmarks() {
    const list = readJSON(KEYS.bookmarks, []);
    return Array.isArray(list) ? list : [];
  }

  function isBookmarked(id) {
    return getBookmarks().indexOf(id) > -1;
  }

  function toggleBookmark(id) {
    const list = getBookmarks();
    const i = list.indexOf(id);
    if (i > -1) list.splice(i, 1);
    else list.push(id);
    writeJSON(KEYS.bookmarks, list);
    emit();
    return i < 0; // true when newly bookmarked
  }

  function removeBookmark(id) {
    const list = getBookmarks().filter(function (x) {
      return x !== id;
    });
    writeJSON(KEYS.bookmarks, list);
    emit();
  }

  /* ------------------------------- Preferences ------------------------- */

  const DEFAULT_PREFS = {
    theme: "system",
    reducedMotion: false,
    newsletter: false,
    compactCards: false,
    autoplayCarousel: true,
  };

  function getPrefs() {
    const stored = readJSON(KEYS.prefs, {});
    return Object.assign({}, DEFAULT_PREFS, stored && typeof stored === "object" ? stored : {});
  }

  function setPref(key, value) {
    const prefs = getPrefs();
    prefs[key] = value;
    writeJSON(KEYS.prefs, prefs);
    emit();
    return prefs;
  }

  /* -------------------------------- Activity --------------------------- */

  function getActivity() {
    const list = readJSON(KEYS.activity, []);
    return Array.isArray(list) ? list : [];
  }

  function logActivity(label, detail) {
    const list = getActivity();
    list.unshift({ label: String(label), detail: detail ? String(detail) : "", at: Date.now() });
    writeJSON(KEYS.activity, list.slice(0, 25));
    emit();
  }

  function clearActivity() {
    writeJSON(KEYS.activity, []);
    emit();
  }

  /* ------------------------------ Notifications ------------------------ */

  function getNotifications() {
    const list = readJSON(KEYS.notifications, []);
    return Array.isArray(list) ? list : [];
  }

  function notify(title, body) {
    const list = getNotifications();
    list.unshift({
      id: "n" + Date.now() + Math.random().toString(36).slice(2, 6),
      title: String(title),
      body: body ? String(body) : "",
      at: Date.now(),
      read: false,
    });
    writeJSON(KEYS.notifications, list.slice(0, 20));
    emit();
  }

  function markRead(id) {
    const list = getNotifications().map(function (n) {
      return n.id === id ? Object.assign({}, n, { read: true }) : n;
    });
    writeJSON(KEYS.notifications, list);
    emit();
  }

  function markAllRead() {
    const list = getNotifications().map(function (n) {
      return Object.assign({}, n, { read: true });
    });
    writeJSON(KEYS.notifications, list);
    emit();
  }

  function clearNotifications() {
    writeJSON(KEYS.notifications, []);
    emit();
  }

  function unreadCount() {
    return getNotifications().filter(function (n) {
      return !n.read;
    }).length;
  }

  /* --------------------------------- Helpers --------------------------- */

  function money(amount) {
    return "$" + Number(amount).toLocaleString("en-US");
  }

  function formatDate(value) {
    const d = value instanceof Date ? value : new Date(value);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  function relativeTime(ts) {
    const diff = Date.now() - ts;
    const mins = Math.round(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return mins + (mins === 1 ? " minute ago" : " minutes ago");
    const hours = Math.round(mins / 60);
    if (hours < 24) return hours + (hours === 1 ? " hour ago" : " hours ago");
    const days = Math.round(hours / 24);
    if (days < 30) return days + (days === 1 ? " day ago" : " days ago");
    return formatDate(ts);
  }

  function addMonths(date, months) {
    const d = new Date(date.getTime());
    d.setMonth(d.getMonth() + months);
    return d;
  }

  function reference() {
    return "NX-" + String(Date.now()).slice(-6) + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  function clearAll() {
    Object.keys(KEYS).forEach(function (k) {
      writeJSON(KEYS[k], null);
    });
    emit();
  }

  ns.store = {
    KEYS: KEYS,
    subscribe: subscribe,
    getSubscription: getSubscription,
    setSubscription: setSubscription,
    clearSubscription: clearSubscription,
    getBookmarks: getBookmarks,
    isBookmarked: isBookmarked,
    toggleBookmark: toggleBookmark,
    removeBookmark: removeBookmark,
    getPrefs: getPrefs,
    setPref: setPref,
    getActivity: getActivity,
    logActivity: logActivity,
    clearActivity: clearActivity,
    getNotifications: getNotifications,
    notify: notify,
    markRead: markRead,
    markAllRead: markAllRead,
    clearNotifications: clearNotifications,
    unreadCount: unreadCount,
    money: money,
    formatDate: formatDate,
    relativeTime: relativeTime,
    addMonths: addMonths,
    reference: reference,
    clearAll: clearAll,
  };
})((window.NEXORA = window.NEXORA || {}));
