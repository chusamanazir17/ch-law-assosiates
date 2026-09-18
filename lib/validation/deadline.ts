/**
 * Frontend Validation for Admin Tax Deadline Management
 */

export interface DeadlineFormData {
  category_id: string;
  tax_year_or_period: string;
  title: string;
  filing_deadline: string;
  official_source_url?: string;
  is_active: boolean;
}

export function validateDeadlineForm(data: DeadlineFormData): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.category_id) {
    errors.category_id = "Please select a tax category.";
  }

  if (!data.title?.trim()) {
    errors.title = "Please enter a descriptive deadline title.";
  }

  if (!data.tax_year_or_period?.trim()) {
    errors.tax_year_or_period = "Please specify the tax year or period (e.g. 'Tax Year 2026').";
  }

  if (!data.filing_deadline) {
    errors.filing_deadline = "Please select the filing deadline date.";
  } else {
    const parsedDate = new Date(data.filing_deadline);
    if (isNaN(parsedDate.getTime())) {
      errors.filing_deadline = "Invalid date format.";
    }
  }

  if (data.official_source_url && data.official_source_url.trim()) {
    try {
      new URL(data.official_source_url.trim());
    } catch {
      errors.official_source_url = "Official source must be a valid URL (starting with http:// or https://).";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
