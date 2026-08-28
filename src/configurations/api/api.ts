/**
 * Public API boundary for feature services.
 *
 * The Axios client stays configured in one place, including development
 * tenant/user headers and token refresh behavior. Feature services should
 * import this module instead of reaching into the configuration folder.
 */
export {
  API_BASE_URL,
  API_ENDPOINTS,
  DEFAULT_PAGE_SIZE,
  DEV_TENANT_ID,
  DEV_USER_ID,
  MAX_PAGE_SIZE,
  USE_DEV_HEADERS,
  USE_MOCK,
  USE_MOCK_DASHBOARD,
  USE_MOCK_LEADS,
  USE_MOCK_OPPORTUNITIES,
} from "./config";
export { http, bindAuthSession, unwrapData } from "./requestBuilder";
export { normalizeError } from "./errorNormalizer";
export { mockLatency } from "./delay";

import { http } from "./requestBuilder";

export default http;
