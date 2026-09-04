import type { OpportunityFormData } from "@/pages/CRM/Opportunities/ConvertOpportunityDialog";
import type { ApiPaginatedSuccess } from "@/models/common/api";
import type { Opportunity } from "@/models/opportunity/opportunity";
import type { LeadDraft } from "@/models/lead/lead";
import { API_ENDPOINTS, http, unwrapData, USE_MOCK_OPPORTUNITIES } from "./api";
import { getLead, updateLead } from "./leadsApi";
import { mockLatency } from "./delay";

let mockOpportunities: Opportunity[] = [];

export interface OpportunityListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  stage?: string;
  status?: string;
  ownerUserId?: string;
}

interface BackendOpportunityListResponse {
  success: true;
  data: Opportunity[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
  message?: string;
}

export const listOpportunities = async (
  params: OpportunityListParams = {},
): Promise<ApiPaginatedSuccess<Opportunity>> => {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;

  if (USE_MOCK_OPPORTUNITIES) {
    const search = params.search?.trim().toLowerCase() ?? "";
    const filtered = mockOpportunities.filter((opportunity) => {
      const matchesSearch = !search || [opportunity.opportunityNumber, opportunity.name, opportunity.leadNumber]
        .join(" ")
        .toLowerCase()
        .includes(search);
      const matchesStage = !params.stage || opportunity.stage === params.stage;
      const matchesStatus = !params.status || opportunity.status === params.status;
      return matchesSearch && matchesStage && matchesStatus;
    });
    const sorted = [...filtered].sort((left, right) => {
      const key = params.sortBy as keyof Opportunity | undefined;
      if (!key) return 0;
      const result = String(left[key] ?? "").localeCompare(String(right[key] ?? ""), undefined, { numeric: true });
      return params.sortDir === "desc" ? -result : result;
    });
    const start = (page - 1) * pageSize;
    return {
      success: true,
      data: sorted.slice(start, start + pageSize),
      pagination: { page, pageSize, total: sorted.length, totalPages: Math.max(1, Math.ceil(sorted.length / pageSize)) },
    };
  }

  const response = await http.get<BackendOpportunityListResponse>(
    API_ENDPOINTS.opportunities.list,
    {
      params: {
        ...params,
        // DataTable uses one-based pages; the opportunities API is zero-based.
        page: page - 1,
        pageSize,
      },
    },
  );
  const payload = response.data;

  return {
    success: payload.success,
    data: payload.data,
    pagination: {
      page,
      pageSize: payload.pagination.pageSize,
      total: payload.pagination.totalCount,
      totalPages: payload.pagination.totalPages,
    },
    message: payload.message,
  };
};

export const convertLeadToOpportunity = async (
  leadId: string,
  data: OpportunityFormData,
): Promise<unknown> => {
  if (USE_MOCK_OPPORTUNITIES) {
    await mockLatency();
    const lead = await getLead(leadId);
    const opportunityNumber = `OP-${String(1000 + mockOpportunities.length + 1).padStart(6, "0")}`;
    const convertedLead: LeadDraft = {
      companyName: lead.companyName,
      contactPerson: lead.leadName,
      phone: lead.phone,
      email: lead.email,
      industry: lead.industry ?? "",
      projectType: lead.projectType ?? "",
      leadSource: lead.leadSource,
      status: "Converted",
      assignedTo: lead.assignedTo,
      assignedToUserId: lead.assignedToUserId,
      website: lead.website ?? "",
      companySize: lead.companySize ?? "",
      annualRevenue: lead.annualRevenue ?? "",
      address: lead.address ?? "",
      subsidiary: lead.subsidiary ?? "",
      subsidiaryId: lead.subsidiaryId,
      projectDescription: lead.projectDescription ?? "",
      notes: lead.notes ?? "",
      followUpDate: "",
      newFollowUpDate: "",
      followUpType: "",
      followUpStatus: "",
      followUpNotes: "",
      followUpFile: null,
    };
    await updateLead(lead.id, convertedLead);
    mockOpportunities = [
      {
        id: `op-${Date.now()}`,
        opportunityNumber,
        name: data.opportunityName || lead.companyName,
        leadId: lead.id,
        leadNumber: lead.leadId,
        subsidiaryId: lead.subsidiaryId ?? null,
        customerId: null,
        stage: data.stage,
        opportunityValue: Number(data.opportunityValue),
        currencyCode: data.currencyCode || "USD",
        expectedCloseDate: data.expectedCloseDate,
        ownerUserId: data.ownerUserId || lead.assignedToUserId || lead.assignedTo || null,
        status: "New",
        probability: Number(data.probability) || 0,
        computations: null,
        notes: data.notes || data.nextSteps || null,
        closedReason: data.closeReason || null,
        createdAt: new Date().toISOString(),
        createdBy: "Current User",
        updatedAt: null,
        updatedBy: null,
        version: 1,
        followUps: [],
      },
      ...mockOpportunities,
    ];
    return data;
  }

  const response = await http.post(API_ENDPOINTS.opportunities.convertLead(leadId), data);
  return unwrapData<unknown>(response.data);
};

export const getOpportunityById = async (id: string): Promise<Opportunity> => {
  if (USE_MOCK_OPPORTUNITIES) {
    await mockLatency();
    const opportunity = mockOpportunities.find((item) => item.id === id);
    if (!opportunity) throw new Error("Opportunity was not found.");
    return opportunity;
  }

  const response = await http.get(API_ENDPOINTS.opportunities.byId(id));
  return unwrapData<Opportunity>(response.data);
};

export const deleteOpportunity = async (id: string): Promise<void> => {
  if (USE_MOCK_OPPORTUNITIES) {
    mockOpportunities = mockOpportunities.filter((opportunity) => opportunity.id !== id);
    return;
  }

  await http.delete(API_ENDPOINTS.opportunities.byId(id));
};

export type OpportunityUpdate = Pick<
  Opportunity,
  "name" | "stage" | "opportunityValue" | "probability" | "expectedCloseDate" | "notes"
>;

export const updateOpportunity = async (
  id: string,
  data: OpportunityUpdate,
): Promise<Opportunity> => {
  if (USE_MOCK_OPPORTUNITIES) {
    const index = mockOpportunities.findIndex((opportunity) => opportunity.id === id);
    if (index < 0) throw new Error("Opportunity was not found.");
    const updated = { ...mockOpportunities[index], ...data, updatedAt: new Date().toISOString(), version: mockOpportunities[index].version + 1 };
    mockOpportunities = mockOpportunities.map((opportunity, opportunityIndex) => opportunityIndex === index ? updated : opportunity);
    return updated;
  }

  const response = await http.put(API_ENDPOINTS.opportunities.byId(id), data);
  return unwrapData<Opportunity>(response.data);
};

export const convertOpportunityToSalesEnquiry = async (id: string): Promise<unknown> => {
  if (USE_MOCK_OPPORTUNITIES) {
    return { id };
  }

  const response = await http.post(API_ENDPOINTS.opportunities.convertToSalesEnquiry(id));
  return unwrapData<unknown>(response.data);
};
