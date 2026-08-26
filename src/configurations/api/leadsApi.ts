import { API_ENDPOINTS, USE_MOCK, USE_MOCK_LEADS, http, unwrapData } from "./api";
import type { ApiPaginatedSuccess, ApiSuccess, ListQuery } from "@/models/common/api";
import type { Lead, LeadDraft, LeadFollowUp } from "@/models/lead/lead";
import { mapBackendLead, type BackendLead, type BackendLeadsResponse } from "@/utils/lead/leadMapper";
import {
  buildCreateFollowUpPayload,
  buildCreateLeadPayload,
  buildUpdateFollowUpPayload,
  buildUpdateLeadPayload,
} from "@/utils/lead/leadPayload";
import {
  addMockFollowUp,
  createMockLead,
  deleteMockLead,
  getLocalLeads,
  getMockLead,
  listMockLeads,
  saveMockLead,
  updateMockLead,
} from "@/utils/lead/leadMock";

// The page's existing KPI/featured calls use this accessor. Populate it from
// the real list response so live mode never falls back to local mock records.
let listedLeads: Lead[] = [];

export const listLeads = async (query: ListQuery): Promise<ApiPaginatedSuccess<Lead>> => {
  if (USE_MOCK_LEADS) {
    return listMockLeads(query);
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
    return getMockLead(id);
  }

  // API INTEGRATION: Fetch a single lead through the centralized endpoint,
  // then normalize the verified backend fields for the unchanged view UI.
  const response = await http.get(API_ENDPOINTS.leads.byId(id));
  return mapBackendLead(unwrapData<BackendLead>(response.data));
};

export const createLead = async (draft: LeadDraft): Promise<Lead> => {
  if (USE_MOCK && USE_MOCK_LEADS) {
    return createMockLead(draft);
  }

  const payload = buildCreateLeadPayload(draft);
  // Lead create uses the live API while the rest of the UI can remain on local mocks.
  const response = await http.post(API_ENDPOINTS.leads.list, payload);
  return unwrapData<Lead>(response.data);
};
export const updateLead = async (id: string, draft: LeadDraft): Promise<Lead> => {
  // API INTEGRATION: Use the dedicated lead mock flag so edit mode follows the
  // same live/mock behavior as the list and details lead services.
  if (USE_MOCK_LEADS) {
    return updateMockLead(id, draft);
  }

  // API INTEGRATION: Send Swagger's UpdateLeadRequest through the centralized
  // by-id endpoint and normalize the backend response for the existing UI.
  const response = await http.put(API_ENDPOINTS.leads.byId(id), buildUpdateLeadPayload(draft));
  return mapBackendLead(unwrapData<BackendLead>(response.data));
};

export const addFollowUp = async (leadId: string, draft: LeadDraft): Promise<LeadFollowUp> => {
  // MOCK MODE: Keep the existing local lead workflow usable without inventing
  // a second endpoint; the mock mutation mirrors the live resource operation.
  if (USE_MOCK_LEADS) {
    return addMockFollowUp(leadId, draft);
  }

  // NEW FOLLOW-UP: Use the dedicated child-resource endpoint. This must never
  // be sent through PUT /leads/{id}, which is reserved for Lead fields only.
  const response = await http.post<ApiSuccess<LeadFollowUp>>(
    API_ENDPOINTS.leads.followups(leadId),
    buildCreateFollowUpPayload(draft),
  );
  return unwrapData<LeadFollowUp>(response.data);
};

export type FollowUpUpdate = Parameters<typeof buildUpdateFollowUpPayload>[0];

export const updateFollowUp = async (
  followUpId: string,
  data: FollowUpUpdate,
): Promise<LeadFollowUp> => {
  const response = await http.put(
    API_ENDPOINTS.followUps(followUpId),
    buildUpdateFollowUpPayload(data),
  );
  return unwrapData<LeadFollowUp>(response.data);
};

export const saveLead = async (next: Lead): Promise<Lead> => {
  if (USE_MOCK) {
    return saveMockLead(next);
  }

  const response = await http.put(API_ENDPOINTS.leads.byId(next.id), next);
  return unwrapData<Lead>(response.data);
};

export const deleteLead = async (id: string): Promise<void> => {
  if (USE_MOCK) {
    await deleteMockLead(id);
    return;
  }

  await http.delete(API_ENDPOINTS.leads.byId(id));
};

export { getLeadKpis } from "@/utils/lead/leadUtils";
export const getAllMockLeads = (): Lead[] => (USE_MOCK_LEADS ? getLocalLeads() : listedLeads);
