const PHONE_RE = /^[+()\-\s0-9]{7,24}$/;

const SERVICE_LABELS: Record<string, string> = {
  tax: "Tax Services",
  estamp: "E-Stamping",
  property: "Property Services",
  business: "Business Registration",
  legal: "Legal Documentation",
};

export interface InquiryInput {
  name: string;
  phone: string;
  service: string;
  message: string | null;
}

export function validateInquiry(input: unknown): InquiryInput {
  if (!input || typeof input !== "object") throw new Error("Invalid inquiry payload.");
  const value = input as Record<string, unknown>;

  const name = typeof value.name === "string" ? value.name.trim() : "";
  if (name.length < 2 || name.length > 100) {
    throw new Error("Please enter a valid name.");
  }

  const phone = typeof value.phone === "string" ? value.phone.trim() : "";
  if (!PHONE_RE.test(phone)) {
    throw new Error("Please enter a valid phone number.");
  }

  const serviceKey = typeof value.service === "string" ? value.service.trim() : "";
  const service = SERVICE_LABELS[serviceKey];
  if (!service) throw new Error("Please select a valid service.");

  const rawMessage = typeof value.message === "string" ? value.message.trim() : "";
  if (rawMessage.length > 1500) {
    throw new Error("Please keep your message to 1500 characters or fewer.");
  }
  const message = rawMessage || null;

  return { name, phone, service, message };
}
