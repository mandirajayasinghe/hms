export const required = (label) => (value) =>
  value === undefined || value === null || String(value).trim() === ""
    ? `${label} is required`
    : "";

export const minLength = (label, min) => (value) =>
  value && value.trim().length < min ? `${label} must be at least ${min} characters` : "";

export const email = (value) => {
  if (!value) return "";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(value) ? "" : "Enter a valid email address";
};

export const phone = (value) => {
  if (!value) return "";
  const re = /^[0-9+\-\s()]{7,20}$/;
  return re.test(value) ? "" : "Enter a valid phone number";
};

export const strongPassword = (value) => {
  if (!value) return "";
  if (value.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(value)) return "Password must contain at least one number";
  return "";
};

export const positiveNumber = (label) => (value) => {
  if (value === "" || value === undefined || value === null) return "";
  const n = Number(value);
  if (Number.isNaN(n)) return `${label} must be a number`;
  if (n <= 0) return `${label} must be greater than 0`;
  return "";
};

export const nonNegativeNumber = (label) => (value) => {
  if (value === "" || value === undefined || value === null) return "";
  const n = Number(value);
  if (Number.isNaN(n)) return `${label} must be a number`;
  if (n < 0) return `${label} cannot be negative`;
  return "";
};

export const futureDateTime = (label) => (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return `Invalid ${label.toLowerCase()}`;
  return d > new Date() ? "" : `${label} must be in the future`;
};

export const pastOrTodayDate = (label) => (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return `Invalid ${label.toLowerCase()}`;
  return d <= new Date() ? "" : `${label} cannot be in the future`;
};

export const usernameFormat = (value) => {
  if (!value) return "";
  return /^[a-zA-Z0-9._-]+$/.test(value)
    ? ""
    : "Username can only contain letters, numbers, dots, dashes, underscores";
};

/**
 * Runs a { field: [validatorFns] } map against a values object.
 * Returns { field: "error message" } for only the fields that failed.
 */
export function validateForm(values, rules) {
  const errors = {};
  for (const field of Object.keys(rules)) {
    for (const rule of rules[field]) {
      const message = rule(values[field]);
      if (message) {
        errors[field] = message;
        break;
      }
    }
  }
  return errors;
}

export const hasErrors = (errors) => Object.keys(errors).length > 0;