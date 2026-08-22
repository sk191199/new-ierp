import type { OpportunityFormData } from "@/pages/CRM/Opportunities/ConvertOpportunityDialog";
import type { ApiPaginatedSuccess } from "@/models/common/api";
import type { Opportunity } from "@/models/opportunity/opportunity";
import { API_ENDPOINTS, http, unwrapData, USE_MOCK_OPPORTUNITIES } from "./api";

export interface OpportunityListParams {
  page?: number;
  pageSize?: number;
  search?: string;
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
    return {
      success: true,
      data: [],
      pagination: { page, pageSize, total: 0, totalPages: 0 },
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
    return data;
  }

  const response = await http.post(API_ENDPOINTS.opportunities.convertLead(leadId), data);
  return unwrapData<unknown>(response.data);
};

export const getOpportunityById = async (id: string): Promise<Opportunity> => {
  if (USE_MOCK_OPPORTUNITIES) {
    throw new Error("Opportunity details are unavailable in mock mode.");
  }

  const response = await http.get(API_ENDPOINTS.opportunities.byId(id));
  return unwrapData<Opportunity>(response.data);
};

export const deleteOpportunity = async (id: string): Promise<void> => {
  if (USE_MOCK_OPPORTUNITIES) {
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
    throw new Error("Opportunity editing is unavailable in mock mode.");
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
