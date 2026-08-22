export const DOCUMENT_STATUSES = {
  draft: "Draft",
  submitted: "Submitted",
  pendingApproval: "Pending Approval",
  approved: "Approved",
  posted: "Posted",
  closed: "Closed",
  cancelled: "Cancelled",
} as const;

export const LEAD_STATUSES = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  disqualified: "Disqualified",
} as const;

export const PAYMENT_STATUSES = {
  paid: "Paid",
  pending: "Pending",
  draft: "Draft",
} as const;

export type LeadStatus = (typeof LEAD_STATUSES)[keyof typeof LEAD_STATUSES];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];
