import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { ERROR_CODES } from "@/constants/errorCodes";
import { NormalizedApiError, type ApiErrorBody } from "@/models/common/api";
import { API_BASE_URL, API_ENDPOINTS, DEV_TENANT_ID, DEV_USER_ID, USE_DEV_HEADERS } from "./config";
import { normalizeError } from "./errorNormalizer";

type TokenReader = () => string | null;
type TokenWriter = (token: string | null) => void;
type SessionClearer = () => void;

/**
 * Auth callbacks are bound after the Redux store exists. This avoids a
 * circular import between the Axios client and the store module.
 */
let readAccessToken: TokenReader = () => null;
let writeAccessToken: TokenWriter = () => undefined;
let clearSession: SessionClearer = () => undefined;
let onUnauthorized: () => void = () => undefined;

export const bindAuthSession = (bindings: {
  getAccessToken: TokenReader;
  setAccessToken: TokenWriter;
  clearSession: SessionClearer;
  onUnauthorized: () => void;
}): void => {
  readAccessToken = bindings.getAccessToken;
  writeAccessToken = bindings.setAccessToken;
  clearSession = bindings.clearSession;
  onUnauthorized = bindings.onUnauthorized;
};

export const http = axios.create({
  baseURL: API_BASE_URL,
  // withCredentials: true,
  withCredentials: false,
  timeout: 20_000,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config) => {
  const token = readAccessToken();
  // API contract: a request explicitly carrying the development identity headers must remain JWT-free.
  const usesDevelopmentHeaders =
    config.headers.has("X-Tenant-Id") || config.headers.has("X-User-Id");

  if (USE_DEV_HEADERS || usesDevelopmentHeaders) {
    // TEMPORARY DEVELOPMENT AUTH: Backend JWT issuing is not implemented yet.
    // These headers replace Authorization until production JWT authentication is enabled.
    if (USE_DEV_HEADERS) {
      config.headers["X-Tenant-Id"] = DEV_TENANT_ID;
      config.headers["X-User-Id"] = DEV_USER_ID;
    }
    // API contract: development calls must not include the mock access token.
    config.headers.delete("Authorization");
    // API diagnostics: log header presence without exposing tokens or other credentials.
    console.log("API request headers", {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL ?? ""}${config.url ?? ""}`,
      tenantHeaderPresent: Boolean(config.headers["X-Tenant-Id"]),
      userHeaderPresent: Boolean(config.headers["X-User-Id"]),
      authorizationHeaderPresent: config.headers.has("Authorization"),
    });
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshInFlight: Promise<string> | null = null;

const isRefreshRequest = (url?: string): boolean =>
  Boolean(url?.includes(API_ENDPOINTS.auth.refresh));

const isAuthFailure = (error: AxiosError<ApiErrorBody>): boolean => {
  const status = error.response?.status;
  const code = error.response?.data?.error;
  return status === 401 || code === ERROR_CODES.TOKEN_EXPIRED || code === ERROR_CODES.UNAUTHORIZED;
};

/**
 * Queue failed requests behind a single refresh call. Concurrent 401s would
 * otherwise rotate the refresh cookie multiple times and invalidate the session.
 */
const refreshAccessToken = async (): Promise<string> => {
  if (!refreshInFlight) {
    refreshInFlight = http
      .post<{ success: boolean; data: { accessToken: string } }>(API_ENDPOINTS.auth.refresh)
      .then((response) => {
        const token = response.data.data.accessToken;
        writeAccessToken(token);
        return token;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
};

http.interceptors.response.use(
  (response) => {
    // TEMPORARY API DEBUG: Remove after API integration is confirmed.
    console.log("TEMPORARY API DEBUG: Axios response status", response.status);
    console.log("TEMPORARY API DEBUG: Axios response headers", response.headers);

    console.log(
      "TEMPORARY API DEBUG: correlation/request ID",
      response.headers["x-correlation-id"] ?? response.headers["x-request-id"] ?? null,
    );
    return response;
  },
  async (error: AxiosError<ApiErrorBody>) => {
    // TEMPORARY API DEBUG: Remove after API integration is confirmed.
    console.error("TEMPORARY API DEBUG: Axios error status", error.response?.status);
    console.error("TEMPORARY API DEBUG: Axios error response data", error.response?.data);
    console.error("TEMPORARY API DEBUG: Axios error response headers", error.response?.headers);
    console.error(
      "TEMPORARY API DEBUG: correlation/request ID",
      error.response?.headers["x-correlation-id"] ??
        error.response?.headers["x-request-id"] ??
        null,
    );
    const original = error.config as RetryableConfig | undefined;
    // API contract: retries for development-header requests must not introduce an Authorization header.
    const usesDevelopmentHeaders =
      original?.headers.has("X-Tenant-Id") || original?.headers.has("X-User-Id");

    if (
      !original ||
      USE_DEV_HEADERS ||
      usesDevelopmentHeaders ||
      !isAuthFailure(error) ||
      original._retry ||
      isRefreshRequest(original.url)
    ) {
      return Promise.reject(normalizeError(error));
    }

    original._retry = true;

    try {
      const token = await refreshAccessToken();
      original.headers.Authorization = `Bearer ${token}`;
      return await http(original);
    } catch (refreshError) {
      clearSession();
      onUnauthorized();
      return Promise.reject(normalizeError(refreshError));
    }
  },
);

export const unwrapData = <T>(payload: { success: boolean; data?: T; message?: string }): T => {
  if (!payload.success || payload.data === undefined) {
    throw new NormalizedApiError(
      ERROR_CODES.INTERNAL_ERROR,
      payload.message ?? "The API response was missing data.",
      0,
    );
  }
  return payload.data;
};
