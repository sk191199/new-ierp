import type { LeadDraft } from "@/models/lead/lead";

const TEST_UUID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

const annualRevenueValue = (value: string): number => {
  const normalized = value.replace(/[$,]/g, "").trim();
  const firstValue = normalized.split("-")[0]?.trim() ?? "";
  const amount = Number(firstValue.replace(/M\+?$/i, "000000").replace(/K\+?$/i, "000"));
  return Number.isFinite(amount) ? amount : 0;
};

const localToday = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toFollowUpIsoDateTime = (date: string): string =>
  new Date(`${date}T00:00:00`).toISOString();

const normalizeWebsite = (website: string): string =>
  website.trim().replace(/^htpp:\/\//i, "http://");

const isUuid = (value: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export const buildCreateLeadPayload = (draft: LeadDraft) => {
  const followUpDate = draft.followUpDate || localToday();
  const nextFollowUpDate = draft.newFollowUpDate || followUpDate;

  return {
    companyName: draft.companyName,
    contactPerson: draft.contactPerson,
    phone: draft.phone,
    email: draft.email,
    industry: draft.industry,
    address: draft.address,
    annualRevenue: annualRevenueValue(draft.annualRevenue),
    assignedTo: TEST_UUID,
    companySize: draft.companySize,
    leadSource: draft.leadSource,
    projectDescription: draft.projectDescription,
    projectType: draft.projectType,
    status: draft.status,
    subsidiary: draft.subsidiary,
    subsidiaryId: TEST_UUID,
    website: normalizeWebsite(draft.website),
    notes: draft.notes,
    followUp: {
      activityType: draft.followUpType || "Call",
      followUpDate: toFollowUpIsoDateTime(followUpDate),
      nextFollowUpDate: toFollowUpIsoDateTime(nextFollowUpDate),
      remarks: draft.followUpNotes,
      status: draft.followUpStatus || "Pending",
      attachments: [],
    },
  };
};

// NEW FOLLOW-UP: A follow-up is a separate backend resource, so its request
// body is built independently from the Lead update payload.
export const buildCreateFollowUpPayload = (draft: LeadDraft) => {
  const followUpDate = draft.followUpDate || localToday();
  const nextFollowUpDate = draft.newFollowUpDate || followUpDate;

  return {
    activityType: draft.followUpType || "Call",
    followUpDate: toFollowUpIsoDateTime(followUpDate),
    nextFollowUpDate: toFollowUpIsoDateTime(nextFollowUpDate),
    remarks: draft.followUpNotes,
    status: draft.followUpStatus || "Pending",
    // File upload is not part of the existing JSON follow-up contract.
    attachments: [],
  };
};

export interface FollowUpUpdateData {
  activityType: string;
  status: string;
  followUpDate: string;
  nextFollowUpDate: string;
  remarks: string;
}

export const buildUpdateFollowUpPayload = (data: FollowUpUpdateData) => ({
  activityType: data.activityType,
  followUpDate: data.followUpDate,
  status: data.status,
  nextFollowUpDate: toFollowUpIsoDateTime(data.nextFollowUpDate),
  remarks: data.remarks,
});

export const buildUpdateLeadPayload = (draft: LeadDraft) => ({
  companyName: draft.companyName,
  contactPerson: draft.contactPerson,
  phone: draft.phone,
  email: draft.email,
  industry: draft.industry,
  address: draft.address,
  annualRevenue: annualRevenueValue(draft.annualRevenue),
  assignedTo: draft.assignedToUserId ?? (isUuid(draft.assignedTo) ? draft.assignedTo : undefined),
  companySize: draft.companySize,
  leadSource: draft.leadSource,
  projectDescription: draft.projectDescription,
  projectType: draft.projectType,
  status: draft.status,
  subsidiary: draft.subsidiary,
  subsidiaryId: draft.subsidiaryId && isUuid(draft.subsidiaryId) ? draft.subsidiaryId : undefined,
  website: normalizeWebsite(draft.website),
  notes: draft.notes,
});
