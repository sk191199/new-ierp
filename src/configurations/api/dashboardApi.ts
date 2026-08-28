import { API_ENDPOINTS, USE_MOCK_DASHBOARD, http, unwrapData, mockLatency } from "./api";
import type { DashboardSnapshot } from "@/models/dashboard/dashboard";
import { dashboardSnapshot } from "@/pages/Dashboard/dashboard.mock";
import { NormalizedApiError } from "@/models/common/api";

export const getDashboardSnapshot = async (): Promise<DashboardSnapshot> => {
  if (USE_MOCK_DASHBOARD) {
    await mockLatency();
    return dashboardSnapshot;
  }

  try {
    const response = await http.get(API_ENDPOINTS.dashboard.snapshot);
    return unwrapData<DashboardSnapshot>(response.data);
  } catch (cause) {
    // The deployed backend does not expose the dashboard route yet, so keep
    // the existing dashboard usable until that endpoint is registered.
    if (cause instanceof NormalizedApiError && cause.status === 404) {
      return dashboardSnapshot;
    }
    throw cause;
  }
};
