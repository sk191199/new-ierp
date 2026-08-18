import { API_ENDPOINTS, USE_MOCK, http, unwrapData, mockLatency } from "./api";
import { NormalizedApiError } from "@/models/common/api";
import type { LoginRequest, LoginResponse } from "@/models/auth/auth";
import { ERROR_CODES } from "@/constants/errorCodes";
import { DEMO_LOGIN, demoLoginResponse } from "@/pages/Auth/auth.mock";

const MOCK_SESSION_KEY = "ierp.mock-session";
const TEMPORARY_FRONTEND_LOGIN_FALLBACK = true;

const matchesDemoLogin = (payload: LoginRequest): boolean =>
  payload.email.trim().toLowerCase() === DEMO_LOGIN.email && payload.password === DEMO_LOGIN.password;

export const persistMockSession = (active: boolean): void => {
  if (active) {
    sessionStorage.setItem(MOCK_SESSION_KEY, "1");
    return;
  }
  sessionStorage.removeItem(MOCK_SESSION_KEY);
};

export const hasMockSession = (): boolean => sessionStorage.getItem(MOCK_SESSION_KEY) === "1";

export const loginRequest = async (payload: LoginRequest): Promise<LoginResponse> => {
  // TEMPORARY FRONTEND TESTING:
  // Backend login endpoint is currently not implemented.
  // This fallback allows frontend authentication testing while lead APIs use the live backend.
  // Remove or disable this fallback when the backend login API is available.
  if (TEMPORARY_FRONTEND_LOGIN_FALLBACK && matchesDemoLogin(payload)) {
    await mockLatency();
    persistMockSession(true);
    return demoLoginResponse;
  }

  if (USE_MOCK) {
    await mockLatency();

    if (!matchesDemoLogin(payload)) {
      throw new NormalizedApiError(ERROR_CODES.UNAUTHORIZED, "Invalid email or password.", 401);
    }

    persistMockSession(true);
    return demoLoginResponse;
  }

  const response = await http.post(API_ENDPOINTS.auth.login, payload);
  return unwrapData<LoginResponse>(response.data);
};

export const refreshSessionRequest = async (): Promise<LoginResponse> => {
  // TEMPORARY FRONTEND TESTING: Restore the temporary demo session after a page refresh.
  if (TEMPORARY_FRONTEND_LOGIN_FALLBACK && hasMockSession()) {
    await mockLatency(120);
    return demoLoginResponse;
  }

  if (USE_MOCK) {
    await mockLatency(120);
    if (!hasMockSession()) {
      throw new NormalizedApiError(ERROR_CODES.UNAUTHORIZED, "No session to restore.", 401);
    }
    return demoLoginResponse;
  }

  const response = await http.post(API_ENDPOINTS.auth.refresh);
  return unwrapData<LoginResponse>(response.data);
};

export const logoutRequest = async (): Promise<void> => {
  // TEMPORARY FRONTEND TESTING: Clear the temporary session without calling the unavailable API.
  if (TEMPORARY_FRONTEND_LOGIN_FALLBACK && hasMockSession()) {
    persistMockSession(false);
    return;
  }

  if (USE_MOCK) {
    persistMockSession(false);
    return;
  }

  await http.post(API_ENDPOINTS.auth.logout);
};
