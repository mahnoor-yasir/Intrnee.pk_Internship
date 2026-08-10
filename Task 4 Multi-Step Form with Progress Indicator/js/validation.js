/* FormFlow — validation.js
 * Pure validation helpers. Each rule returns an error string or "".
 */
window.FF = window.FF || {};

FF.validation = (function () {
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  // Accepts international formats: +44 20 7946 0958, (021) 345-6789, 03001234567
  const PHONE_RE = /^\+?[0-9][0-9\s().-]{6,19}$/;

  function isEmpty(value) {
    if (Array.isArray(value)) return value.length === 0;
    if (value === null || value === undefined) return true;
    if (typeof value === "object") return false;
    return String(value).trim() === "";
  }

  function isValidUrl(value) {
    const raw = String(value).trim();
    if (!raw) return false;
    const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    try {
      const url = new URL(candidate);
      return Boolean(url.hostname) && url.hostname.includes(".") && !/\s/.test(raw);
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate a single field definition against a value.
   * Returns "" when valid.
   */
  function validateField(field, value) {
    const label = field.label;

    if (field.required && isEmpty(value)) {
      if (field.type === "checkboxGroup") return `Select at least one ${label.toLowerCase()}.`;
      if (field.type === "select" || field.type === "radioCards")
        return `Please choose a ${label.toLowerCase()}.`;
      if (field.type === "file") return `${label} is required.`;
      return `${label} is required.`;
    }

    if (isEmpty(value)) return "";

    switch (field.type) {
      case "email":
        if (!EMAIL_RE.test(String(value).trim()))
          return "Enter a valid email address, for example name@company.com.";
        break;
      case "tel":
        if (!PHONE_RE.test(String(value).trim()))
          return "Enter a valid phone number, including the country code if international.";
        break;
      case "url":
        if (!isValidUrl(value)) return "Enter a valid URL, for example https://example.com.";
        break;
      case "date": {
        const date = new Date(String(value));
        if (Number.isNaN(date.getTime())) return "Enter a valid date.";
        if (field.noFuture && date.getTime() > Date.now())
          return "Date of birth cannot be in the future.";
        if (field.minAge) {
          const min = new Date();
          min.setFullYear(min.getFullYear() - field.minAge);
          if (date.getTime() > min.getTime())
            return `You must be at least ${field.minAge} years old.`;
        }
        if (field.maxAge) {
          const max = new Date();
          max.setFullYear(max.getFullYear() - field.maxAge);
          if (date.getTime() < max.getTime()) return "Enter a realistic date of birth.";
        }
        break;
      }
      case "number": {
        const num = Number(value);
        if (!Number.isFinite(num)) return `${label} must be a number.`;
        if (field.min !== undefined && num < field.min)
          return `${label} cannot be less than ${field.min}.`;
        if (field.max !== undefined && num > field.max)
          return `${label} cannot be more than ${field.max}.`;
        break;
      }
      case "textarea":
        if (field.maxLength && String(value).length > field.maxLength)
          return `${label} must be ${field.maxLength} characters or fewer.`;
        if (field.minLength && String(value).trim().length < field.minLength)
          return `${label} must be at least ${field.minLength} characters.`;
        break;
      case "checkboxGroup":
        if (field.maxSelected && value.length > field.maxSelected)
          return `Select up to ${field.maxSelected} options.`;
        break;
      case "file":
        if (value && value.error) return value.error;
        break;
      default:
        if (field.maxLength && String(value).length > field.maxLength)
          return `${label} must be ${field.maxLength} characters or fewer.`;
        break;
    }

    return "";
  }

  /** Validate an uploaded File against accepted extensions / max size. */
  function validateFile(file, spec) {
    if (!file) return "No file selected.";
    const name = file.name || "";
    const extension = name.includes(".") ? name.split(".").pop().toLowerCase() : "";
    if (spec.extensions && !spec.extensions.includes(extension)) {
      return `Unsupported file type. Allowed: ${spec.extensions.join(", ").toUpperCase()}.`;
    }
    if (spec.maxBytes && file.size > spec.maxBytes) {
      return `File is too large. Maximum size is ${FF.utils.formatBytes(spec.maxBytes)}.`;
    }
    if (file.size === 0) return "This file appears to be empty.";
    return "";
  }

  /** Validate every field of a step. Returns { fieldName: message }. */
  function validateFields(fields, data) {
    const errors = {};
    fields.forEach((field) => {
      const message = validateField(field, data[field.name]);
      if (message) errors[field.name] = message;
    });
    return errors;
  }

  return { validateField, validateFields, validateFile, isEmpty, isValidUrl, EMAIL_RE, PHONE_RE };
})();
