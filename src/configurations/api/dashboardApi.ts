import { API_ENDPOINTS, USE_MOCK, http, unwrapData, mockLatency } from "./api";
import type { DashboardSnapshot } from "@/models/dashboard/dashboard";
import { dashboardSnapshot } from "@/pages/Dashboard/dashboard.mock";

export const getDashboardSnapshot = async (): Promise<DashboardSnapshot> => {
  if (USE_MOCK) {
    await mockLatency();
    return dashboardSnapshot;
  }

  const response = await http.get(API_ENDPOINTS.dashboard.snapshot);
  return unwrapData<DashboardSnapshot>(response.data);
};
