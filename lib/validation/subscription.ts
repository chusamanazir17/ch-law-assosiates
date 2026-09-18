/**
 * Frontend Validation for Tax Reminder Subscription Form
 */

const CATEGORY_ID_RE = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|[a-z0-9]+(?:-[a-z0-9]+)*)$/i;

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateSubscription(data: {
  name: string;
  email: string;
  category_ids: string[];
  consent: boolean;
}): ValidationResult {
  const errors: Record<string, string> = {};

  const name = data.name ? data.name.trim() : "";
  if (!name) {
    errors.name = "Please enter your full name.";
  } else if (name.length < 2 || name.length > 100) {
    errors.name = "Name must be between 2 and 100 characters.";
  }

  const email = data.email ? data.email.trim() : "";
  if (!email) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Please enter a valid email address (e.g. name@example.com).";
  }

  if (!Array.isArray(data.category_ids) || data.category_ids.length === 0) {
    errors.category_ids = "Please select at least one tax category.";
  } else if (data.category_ids.length > 20) {
    errors.category_ids = "Please select no more than 20 tax categories.";
  } else if (new Set(data.category_ids).size !== data.category_ids.length) {
    errors.category_ids = "Duplicate tax categories are not allowed.";
  } else if (data.category_ids.some((id) => !CATEGORY_ID_RE.test(id) || id.length > 80)) {
    errors.category_ids = "One or more tax categories are invalid.";
  }

  if (!data.consent) {
    errors.consent = "You must confirm consent to receive tax deadline reminders.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
