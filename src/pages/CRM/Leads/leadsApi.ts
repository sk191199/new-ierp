import { API_ENDPOINTS, USE_MOCK, USE_MOCK_LEADS, http, unwrapData } from "@/configurations/api";
import { mockLatency } from "@/configurations/api/delay";
import { ERROR_CODES } from "@/constants/errorCodes";
import type { ApiPaginatedSuccess, ListQuery } from "@/models/common/api";
import { NormalizedApiError } from "@/models/common/api";
import type { Lead, LeadAttachment, LeadDraft, LeadFollowUp } from "@/models/lead/lead";
import { resolveAiNextAction, resolveLeadConfidence } from "@/models/lead/lead";
import { leadRecords } from "./leads.mock";

const TEST_UUID = "3fa85f64-5717-4562-b3fc-2c963f66afa6"; // dummy id's

const annualRevenueValue = (value: string): number => {
  const normalized = value.replace(/[$,]/g, "").trim();
  const firstValue = normalized.split("-")[0]?.trim() ?? "";
  const amount = Number(firstValue.replace(/M\+?$/i, "000000").replace(/K\+?$/i, "000"));
  return Number.isFinite(amount) ? amount : 0;
};

/**
 * The form displays the browser's local current date when followUpDate is
 * blank, but does not write that display value back to the draft. Use the
 * same local date at the API boundary so the request never contains null.
 */
const localToday = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** API contract: CRM requires ISO date-time values, not null dates. */
const toFollowUpIsoDateTime = (date: string): string =>
  new Date(`${date}T00:00:00`).toISOString();

/** Correct the known HTPP scheme typo without changing the value shown in the UI. */
const normalizeWebsite = (website: string): string =>
  website.trim().replace(/^htpp:\/\//i, "http://");

// API INTEGRATION: The update DTO requires UUIDs for backend relationship IDs.
const isUuid = (value: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const enrichLead = (lead: Lead): Lead => ({
  ...lead,
  confidence: lead.confidence ?? resolveLeadConfidence(lead.leadScore, lead.status),
  aiNextAction: lead.aiNextAction ?? resolveAiNextAction(lead.leadScore),
});

let localLeads = [...leadRecords];

type BackendFollowUp = {
  id?: string;
  activityType?: string;
  followUpDate?: string;
  nextFollowUpDate?: string;
  status?: string;
  remarks?: string;
  createdAt?: string;
  createdBy?: string;
  attachments?: BackendAttachment[];
};

type BackendAttachment = {
  fileName?: string;
  filePath?: string;
  contentType?: string;
  fileSize?: number;
  createdAt?: string;
};

type BackendLead = {
  id: string;
  leadNumber: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  industry?: string;
  address?: string;
  annualRevenue?: number;
  assignedToUserId?: string;
  companySize?: string;
  leadSource: string;
  projectType?: string;
  projectDescription?: string;
  status: Lead["status"];
  subsidiary?: string;
  subsidiaryId?: string;
  website?: string;
  notes?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  version?: number;
  followUps?: BackendFollowUp[];
};

type BackendLeadsResponse = {
  success: true;
  data: BackendLead[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  message?: string | null;
};

/**
 * The backend's lead and pagination field names differ from the table's
 * established Lead model. Keep that adaptation in the service layer so the
 * existing UI can render real records without component changes.
 */
const mapBackendLead = (lead: BackendLead): Lead => {
  const followUp = lead.followUps?.[0];
  // API INTEGRATION: Preserve every follow-up and attachment supplied by the
  // detail response instead of reducing the response to its first entry.
  const followUps: LeadFollowUp[] | undefined = lead.followUps?.map((item) => ({
    id: item.id,
    activityType: item.activityType,
    followUpDate: item.followUpDate,
    nextFollowUpDate: item.nextFollowUpDate,
    remarks: item.remarks,
    status: item.status,
    createdAt: item.createdAt,
    createdBy: item.createdBy,
    attachments: item.attachments?.map(
      (attachment): LeadAttachment => ({
        fileName: attachment.fileName,
        filePath: attachment.filePath,
        contentType: attachment.contentType,
        fileSize: attachment.fileSize,
        createdAt: attachment.createdAt,
      }),
    ),
  }));

  return enrichLead({
    id: lead.id,
    leadId: lead.leadNumber,
    // API INTEGRATION: Preserve the backend leadNumber display for live table rows.
    isBackendLead: true,
    leadName: lead.contactPerson,
    companyName: lead.companyName,
    email: lead.email,
    phone: lead.phone,
    leadSource: lead.leadSource,
    status: lead.status,
    // API INTEGRATION: Retain model compatibility while marking that the API
    // supplied no score; the view uses this marker rather than displaying 0.
    leadScore: 0,
    leadScoreAvailable: false,
    assignedTo: lead.assignedToUserId ?? "",
    createdDate: lead.createdAt?.slice(0, 10) ?? "",
    industry: lead.industry,
    projectType: lead.projectType,
    website: lead.website,
    companySize: lead.companySize,
    annualRevenue: lead.annualRevenue === undefined ? undefined : String(lead.annualRevenue),
    address: lead.address,
    subsidiary: lead.subsidiary,
    subsidiaryId: lead.subsidiaryId,
    notes: lead.notes,
    projectDescription: lead.projectDescription,
    createdBy: lead.createdBy,
    updatedAt: lead.updatedAt,
    updatedBy: lead.updatedBy,
    version: lead.version,
    followUps,
    followUpDate: followUp?.followUpDate,
    followUpType: followUp?.activityType,
    followUpStatus: followUp?.status,
    followUpNotes: followUp?.remarks,
  });
};

// The page's existing KPI/featured calls use this accessor. Populate it from
// the real list response so live mode never falls back to local mock records.
let listedLeads: Lead[] = [];

const applyListQuery = (items: Lead[], query: ListQuery): ApiPaginatedSuccess<Lead> => {
  const search = query.search?.trim().toLowerCase() ?? "";
  const status = String(query.status ?? "");
  const filtered = items.filter((lead) => {
    const matchesSearch =
      !search ||
      [lead.leadId, lead.leadName, lead.companyName, lead.email, lead.assignedTo, lead.status]
        .join(" ")
        .toLowerCase()
        .includes(search);
    const matchesStatus = !status || lead.status === status;
    return matchesSearch && matchesStatus;
  });

  const sortBy = query.sortBy as keyof Lead | undefined;
  const sorted = [...filtered].sort((a, b) => {
    if (!sortBy) {
      return 0;
    }
    const left = String(a[sortBy] ?? "");
    const right = String(b[sortBy] ?? "");
    const result = left.localeCompare(right, undefined, { numeric: true });
    return query.sortDir === "desc" ? -result : result;
  });

  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  const data = sorted.slice(start, start + pageSize).map(enrichLead);

  return {
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total: sorted.length,
      totalPages: Math.max(1, Math.ceil(sorted.length / pageSize)),
    },
  };
};

export const listLeads = async (query: ListQuery): Promise<ApiPaginatedSuccess<Lead>> => {
  if (USE_MOCK_LEADS) {
    await mockLatency();
    return applyListQuery(localLeads, query);
  }

  // API contract: omit empty filters while retaining the backend's page/pageSize names.
  const params = {
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 20,
    ...(query.search ? { search: query.search } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.sortBy ? { sortBy: query.sortBy } : {}),
    ...(query.sortDir ? { sortDir: query.sortDir } : {}),
  };
  // TEMPORARY API DEBUG: The interceptor logs method/header presence; this
  // log makes the final query directly comparable with the backend request.
  console.log("TEMPORARY API DEBUG: GET CRM leads", {
    method: "GET",
    url: API_ENDPOINTS.leads.list,
    params,
  });

  const response = await http.get<BackendLeadsResponse>(API_ENDPOINTS.leads.list, { params });
  const payload = response.data;
  const data = payload.data.map(mapBackendLead);
  listedLeads = data;

  return {
    success: payload.success,
    data,
    pagination: {
      page: payload.pagination.page,
      pageSize: payload.pagination.pageSize,
      // Backend calls this totalCount; the existing table expects total.
      total: payload.pagination.totalCount,
      totalPages: payload.pagination.totalPages,
    },
    message: payload.message ?? undefined,
  };
};

export const getLead = async (id: string): Promise<Lead> => {
  // API INTEGRATION: Keep the existing lead-by-id mock behavior behind the
  // dedicated lead mock flag so live mode always calls the backend.
  if (USE_MOCK_LEADS) {
    await mockLatency();
    const match = localLeads.find((lead) => lead.id === id || lead.leadId === id);
    if (!match) {
      throw new NormalizedApiError(ERROR_CODES.NOT_FOUND, "Lead was not found.", 404);
    }
    return enrichLead(match);
  }

  // API INTEGRATION: Fetch a single lead through the centralized endpoint,
  // then normalize the verified backend fields for the unchanged view UI.
  const response = await http.get(API_ENDPOINTS.leads.byId(id));
  return mapBackendLead(unwrapData<BackendLead>(response.data));
};

const buildCreateLeadPayload = (draft: LeadDraft) => {
  // The current form displays today's follow-up date even when its draft value
  // is empty. Mirror that behavior and use it for an omitted next date so the
  // always-present followUp object matches the backend's non-null date contract.
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
    // assignedTo: draft.assignedTo,
    // Temporary dummy UUID for testing
    assignedTo: TEST_UUID,
    companySize: draft.companySize,
    leadSource: draft.leadSource,
    projectDescription: draft.projectDescription,
    projectType: draft.projectType,
    status: draft.status,
    subsidiary: draft.subsidiary,
    // Temporary dummy UUID for testing
    subsidiaryId: TEST_UUID,
    website: normalizeWebsite(draft.website),
    notes: draft.notes,
    followUp: {
      // Defaults retain the existing optional UI while sending the required
      // string values demonstrated by the successful Postman request.
      activityType: draft.followUpType || "Call",
      followUpDate: toFollowUpIsoDateTime(followUpDate),
      nextFollowUpDate: toFollowUpIsoDateTime(nextFollowUpDate),
      remarks: draft.followUpNotes,
      status: draft.followUpStatus || "Pending",
      attachments: [],
    },
  };
};

/**
 * API INTEGRATION: Maps the edit form to Swagger's UpdateLeadRequest.
 * Follow-up fields are intentionally omitted because this endpoint does not
 * accept them; Swagger exposes separate follow-up endpoints for that work.
 */
const buildUpdateLeadPayload = (draft: LeadDraft) => ({
  companyName: draft.companyName,
  contactPerson: draft.contactPerson,
  phone: draft.phone,
  email: draft.email,
  industry: draft.industry,
  address: draft.address,
  annualRevenue: annualRevenueValue(draft.annualRevenue),
  // Preserve the backend UUID loaded into the draft; never substitute TEST_UUID.
  assignedTo: isUuid(draft.assignedTo) ? draft.assignedTo : undefined,
  companySize: draft.companySize,
  leadSource: draft.leadSource,
  projectDescription: draft.projectDescription,
  projectType: draft.projectType,
  status: draft.status,
  subsidiary: draft.subsidiary,
  // Preserve the backend UUID loaded into the draft; never substitute TEST_UUID.
  subsidiaryId: draft.subsidiaryId && isUuid(draft.subsidiaryId) ? draft.subsidiaryId : undefined,
  website: normalizeWebsite(draft.website),
  notes: draft.notes,
});



export const createLead = async (draft: LeadDraft): Promise<Lead> => {
  // TEMPORARY API DEBUG: Remove after API integration is confirmed.
  console.log("TEMPORARY API DEBUG: USE_MOCK", USE_MOCK);
  console.log("TEMPORARY API DEBUG: API_BASE_URL", import.meta.env.VITE_API_BASE_URL);
  console.log("TEMPORARY API DEBUG: POST endpoint", API_ENDPOINTS.leads.list);

  if (USE_MOCK && USE_MOCK_LEADS) {
    await mockLatency();

    const nextNumber = 1000 + localLeads.length + 1;

    const created: Lead = {
      id: `ld-${nextNumber}`,
      leadId: `LD-${nextNumber}`,
      leadName: draft.contactPerson,
      companyName: draft.companyName,
      email: draft.email,
      phone: draft.phone,

      leadSource: draft.leadSource || "Website",
      status: draft.status,

      leadScore: 40,
      confidence: resolveLeadConfidence(40, draft.status),
      aiNextAction: resolveAiNextAction(40),

      assignedTo: draft.assignedTo || "Unassigned",

      createdDate: new Date().toISOString().slice(0, 10),

      industry: draft.industry,
      projectType: draft.projectType,
      website: draft.website,
      companySize: draft.companySize,
      annualRevenue: draft.annualRevenue,
      address: draft.address,

      subsidiary: draft.subsidiary,
      notes: draft.notes,

      followUpDate: draft.followUpDate,
      followUpType: draft.followUpType,
      followUpNotes: draft.followUpNotes,
    };

    localLeads = [created, ...localLeads];

    return created;
  }

  const payload = buildCreateLeadPayload(draft);
  // TEMPORARY API DEBUG: Compare this credential-free payload with Postman.
  console.log("TEMPORARY API DEBUG: final create-lead payload", payload);
  // Lead create uses the live API while the rest of the UI can remain on local mocks.
  try {
    const response = await http.post(API_ENDPOINTS.leads.list, payload);
    // TEMPORARY API DEBUG: Remove after API integration is confirmed.
    console.log("TEMPORARY API DEBUG: Backend response status", response.status);
    console.log("TEMPORARY API DEBUG: Backend response body", response.data);
    console.log("TEMPORARY API DEBUG: Backend response headers", response.headers);
    return unwrapData<Lead>(response.data);
  } catch (cause) {
    // TEMPORARY API DEBUG: Remove after API integration is confirmed.
    if (cause instanceof Error && "response" in cause) {
      const response = (cause as { response?: { status?: number; data?: unknown; headers?: unknown } }).response;
      console.error("TEMPORARY API DEBUG: Axios error status", response?.status);
      console.error("TEMPORARY API DEBUG: Axios error response data", response?.data);
      console.error("TEMPORARY API DEBUG: Axios error response headers", response?.headers);
    }
    throw cause;
  }
};
export const updateLead = async (id: string, draft: LeadDraft): Promise<Lead> => {
  // API INTEGRATION: Use the dedicated lead mock flag so edit mode follows the
  // same live/mock behavior as the list and details lead services.
  if (USE_MOCK_LEADS) {
    await mockLatency();
    const index = localLeads.findIndex((lead) => lead.id === id);
    if (index < 0) {
      throw new NormalizedApiError(ERROR_CODES.NOT_FOUND, "Lead was not found.", 404);
    }
    const updated: Lead = {
      ...localLeads[index],
      leadName: draft.contactPerson,
      companyName: draft.companyName,
      email: draft.email,
      phone: draft.phone,
      leadSource: draft.leadSource,
      status: draft.status,
      assignedTo: draft.assignedTo,
      industry: draft.industry,
      projectType: draft.projectType,
      website: draft.website,
      companySize: draft.companySize,
      annualRevenue: draft.annualRevenue,
      address: draft.address,
      subsidiary: draft.subsidiary,
      subsidiaryId: draft.subsidiaryId,
      projectDescription: draft.projectDescription,
      notes: draft.notes,
      followUpDate: draft.followUpDate,
      followUpType: draft.followUpType,
      followUpNotes: draft.followUpNotes,
    };
    localLeads = localLeads.map((lead, leadIndex) => (leadIndex === index ? updated : lead));
    return updated;
  }

  // API INTEGRATION: Send Swagger's UpdateLeadRequest through the centralized
  // by-id endpoint and normalize the backend response for the existing UI.
  const response = await http.put(API_ENDPOINTS.leads.byId(id), buildUpdateLeadPayload(draft));
  return mapBackendLead(unwrapData<BackendLead>(response.data));
};

export const saveLead = async (next: Lead): Promise<Lead> => {
  if (USE_MOCK) {
    await mockLatency();
    const index = localLeads.findIndex((lead) => lead.id === next.id);
    if (index < 0) {
      throw new NormalizedApiError(ERROR_CODES.NOT_FOUND, "Lead was not found.", 404);
    }
    localLeads = localLeads.map((lead, leadIndex) => (leadIndex === index ? next : lead));
    return next;
  }

  const response = await http.put(API_ENDPOINTS.leads.byId(next.id), next);
  return unwrapData<Lead>(response.data);
};

export const deleteLead = async (id: string): Promise<void> => {
  if (USE_MOCK) {
    await mockLatency();
    localLeads = localLeads.filter((lead) => lead.id !== id);
    return;
  }

  await http.delete(API_ENDPOINTS.leads.byId(id));
};

export const getLeadKpis = (items: Lead[]) => {
  const qualified = items.filter((lead) => lead.status === "Qualified").length;
  const disqualified = items.filter((lead) => lead.status === "Disqualified").length;
  const average =
    items.length === 0 ? 0 : items.reduce((sum, lead) => sum + lead.leadScore, 0) / items.length;

  return {
    total: items.length,
    qualified,
    disqualified,
    averageScore: Number(average.toFixed(1)),
  };
};

export const getAllMockLeads = (): Lead[] => (USE_MOCK_LEADS ? localLeads : listedLeads);
