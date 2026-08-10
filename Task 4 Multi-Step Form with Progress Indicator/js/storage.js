/* FormFlow — storage.js
 * Defensive localStorage wrapper. Every operation is guarded so a disabled or
 * full storage never breaks the interface.
 */
window.FF = window.FF || {};

FF.storage = (function () {
  const KEYS = {
    draft: "formflow_draft",
    theme: "formflow_theme",
    history: "formflow_submissions",
  };

  let available = true;
  try {
    const probe = "__formflow_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
  } catch (error) {
    available = false;
  }

  function readJSON(key, fallback) {
    if (!available) return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed === null || parsed === undefined ? fallback : parsed;
    } catch (error) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    if (!available) return false;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  function remove(key) {
    if (!available) return false;
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  return {
    KEYS: KEYS,
    isAvailable: function() {
      return available;
    },

    getDraft: function() {
      return readJSON(KEYS.draft, null);
    },
    
    saveDraft: function(draft) {
      return writeJSON(KEYS.draft, draft);
    },
    
    clearDraft: function() {
      return remove(KEYS.draft);
    },

    getTheme: function() {
      return readJSON(KEYS.theme, null);
    },
    
    saveTheme: function(theme) {
      return writeJSON(KEYS.theme, theme);
    },

    getHistory: function() {
      const list = readJSON(KEYS.history, []);
      if (!Array.isArray(list)) {
        if (list && typeof list === 'object') {
          return [list];
        }
        return [];
      }
      return list;
    },
    
    saveHistory: function(list) {
      if (!Array.isArray(list)) {
        return false;
      }
      return writeJSON(KEYS.history, list);
    },
    
    addSubmission: function(submission) {
      try {
        const history = this.getHistory();
        history.unshift(submission);
        const trimmed = history.slice(0, 25);
        return this.saveHistory(trimmed);
      } catch (error) {
        console.error('Error saving submission:', error);
        return false;
      }
    }
  };
})();