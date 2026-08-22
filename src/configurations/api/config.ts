/**
 * Every backend path lives here. Pages and services must not embed URL strings.
 * Resource names follow the process-flow contract: /api/v1/ + plural snake_case.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5080";

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
export const USE_MOCK_LEADS = import.meta.env.VITE_USE_MOCK_LEADS !== "false";
export const USE_MOCK_OPPORTUNITIES = import.meta.env.VITE_USE_MOCK_OPPORTUNITIES !== "false";
export const USE_DEV_HEADERS = import.meta.env.VITE_USE_DEV_HEADERS !== "false";
export const DEV_TENANT_ID =
  import.meta.env.VITE_DEV_TENANT_ID || "11111111-1111-1111-1111-111111111111";
export const DEV_USER_ID =
  import.meta.env.VITE_DEV_USER_ID || "22222222-2222-2222-2222-222222222222";

export const API_ENDPOINTS = {
  auth: {
    login: "/api/v1/auth/login",
    refresh: "/api/v1/auth/refresh",
    logout: "/api/v1/auth/logout",
    me: " /api/v1/auth/me".trim(),
  },
  leads: {
    list: "/api/crm/leads",
    byId: (id: string) => `/api/crm/leads/${id}`,
    followups: (leadId: string) => `/api/crm/leads/${leadId}/followups`,
    timeline: (leadId: string) => `/api/crm/leads/${leadId}/timeline`,
  },
  opportunityFollowUps: (id: string) => `/api/crm/opportunity-followups/${id}`,
  opportunities: {
    list: "/api/crm/opportunities",
    byId: (id: string) => `/api/crm/opportunities/${id}`,
    convertToSalesEnquiry: (id: string) => `/api/crm/opportunities/${id}/convert-to-sales-enquiry`,
    convertLead: (leadId: string) => `/api/crm/leads/${leadId}/convert-to-opportunity`,
  },
  dashboard: {
    snapshot: "/api/v1/dashboard/snapshot",
  },
  metadata: {
    screen: (screenCode: string) => `/api/v1/metadata/screens/${screenCode}`,
  },
} as const;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
