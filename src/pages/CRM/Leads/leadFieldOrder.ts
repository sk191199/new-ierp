export const LEAD_FIELD_ORDER_KEY = "ierp.lead-management-field-order";
export const LEAD_CUSTOM_FIELDS_KEY = "ierp.lead-management-custom-fields";
export const LEAD_FIELD_VISIBILITY_KEY = "ierp.lead-management-field-visibility";

export interface LeadCustomField {
  id: string;
  label: string;
  type: "Text / Char" | "Number" | "Date" | "Long Text";
  required: boolean;
  module: string;
  screen: string;
  section: string;
}

export const defaultLeadFieldOrder = {
  primary: [
    "companyName",
    "contactPerson",
    "phone",
    "email",
    "industry",
    "projectType",
    "leadSource",
    "status",
    "assignedTo",
    "website",
    "companySize",
    "annualRevenue",
    "address",
  ],
  followUps: ["followUpDate", "newFollowUpDate", "followUpStatus", "followUpType", "followUpFile", "followUpNotes"],
};

export type LeadFieldOrder = typeof defaultLeadFieldOrder;

export const readLeadFieldOrder = (): LeadFieldOrder => {
  if (typeof window === "undefined") {
    return defaultLeadFieldOrder;
  }

  try {
    const stored = JSON.parse(window.localStorage.getItem(LEAD_FIELD_ORDER_KEY) ?? "null") as Partial<LeadFieldOrder> | null;
    const primaryOrder = stored?.primary?.length ? stored.primary : defaultLeadFieldOrder.primary;
    const requiredPrimary = new Map(defaultLeadFieldOrder.primary.map((field, index) => [index, field]));
    const optionalPrimary = primaryOrder.filter((field) => !requiredPrimaryHasPosition(field));
    let optionalIndex = 0;

    return {
      primary: defaultLeadFieldOrder.primary.map((field, index) =>
        requiredPrimary.get(index) === field ? field : optionalPrimary[optionalIndex++] ?? field,
      ),
      followUps: stored?.followUps?.length ? stored.followUps : defaultLeadFieldOrder.followUps,
    };
  } catch {
    return defaultLeadFieldOrder;
  }
};

const requiredPrimaryHasPosition = (field: string) =>
  new Set(["companyName", "contactPerson", "phone", "email", "status", "address"]).has(field);

export const saveLeadFieldOrder = (order: LeadFieldOrder) => {
  window.localStorage.setItem(LEAD_FIELD_ORDER_KEY, JSON.stringify(order));
  window.dispatchEvent(new CustomEvent<LeadFieldOrder>(LEAD_FIELD_ORDER_KEY, { detail: order }));
};

export const clearLeadFieldOrder = () => {
  window.localStorage.removeItem(LEAD_FIELD_ORDER_KEY);
  window.dispatchEvent(new CustomEvent<LeadFieldOrder>(LEAD_FIELD_ORDER_KEY, { detail: defaultLeadFieldOrder }));
};

export const readLeadCustomFields = (): LeadCustomField[] => {
  try {
    const stored = JSON.parse(window.localStorage.getItem(LEAD_CUSTOM_FIELDS_KEY) ?? "[]") as Array<Partial<LeadCustomField>>;
    return stored.map((field) => ({
      id: field.id ?? `custom_${Date.now()}`,
      label: field.label ?? "Custom field",
      type: field.type ?? "Text / Char",
      required: Boolean(field.required),
      module: field.module ?? "CRM & Customer Engagement",
      screen: field.screen ?? "Lead Management",
      section: field.section ?? "Additional Information",
    }));
  } catch {
    return [];
  }
};

export const saveLeadCustomFields = (fields: LeadCustomField[]) => {
  window.localStorage.setItem(LEAD_CUSTOM_FIELDS_KEY, JSON.stringify(fields));
  window.dispatchEvent(new CustomEvent<LeadCustomField[]>(LEAD_CUSTOM_FIELDS_KEY, { detail: fields }));
};

export const readLeadFieldVisibility = (): Record<string, boolean> => {
  try {
    return JSON.parse(window.localStorage.getItem(LEAD_FIELD_VISIBILITY_KEY) ?? "{}") as Record<string, boolean>;
  } catch {
    return {};
  }
};

export const saveLeadFieldVisibility = (visibility: Record<string, boolean>) => {
  window.localStorage.setItem(LEAD_FIELD_VISIBILITY_KEY, JSON.stringify(visibility));
  window.dispatchEvent(new CustomEvent<Record<string, boolean>>(LEAD_FIELD_VISIBILITY_KEY, { detail: visibility }));
};
