/**
 * Frontend Validation for Tax Reminder Subscription Form
 */

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
  if (name && name.length > 100) {
    errors.name = "Name must not exceed 100 characters.";
  }

  const email = data.email ? data.email.trim() : "";
  if (!email) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Please enter a valid email address (e.g. name@example.com).";
  }

  if (!Array.isArray(data.category_ids) || data.category_ids.length === 0) {
    errors.category_ids = "Please select at least one tax category.";
  }

  if (!data.consent) {
    errors.consent = "You must confirm consent to receive tax deadline reminders.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
