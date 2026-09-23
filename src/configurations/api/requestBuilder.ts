import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { ERROR_CODES } from "@/constants/errorCodes";
import { NormalizedApiError, type ApiErrorBody } from "@/models/common/api";
import { API_BASE_URL, API_ENDPOINTS } from "./config";
import { normalizeError } from "./errorNormalizer";

type TokenReader = () => string | null;
type SessionClearer = () => void;
type TokenRefresher = () => Promise<string>;

/**
 * Auth callbacks are bound after the Redux store exists. This avoids a
 * circular import between the Axios client and the store module.
 */
let readAccessToken: TokenReader = () => null;
let clearSession: SessionClearer = () => undefined;
let onUnauthorized: () => void = () => undefined;
let refreshToken: TokenRefresher = () => Promise.reject(new Error("Session refresh is unavailable."));
let refreshFailureHandled = false;

export const bindAuthSession = (bindings: {
  getAccessToken: TokenReader;
  clearSession: SessionClearer;
  onUnauthorized: () => void;
  refreshAccessToken: TokenRefresher;
}): void => {
  readAccessToken = bindings.getAccessToken;
  clearSession = bindings.clearSession;
  onUnauthorized = bindings.onUnauthorized;
  refreshToken = bindings.refreshAccessToken;
};

export const http = axios.create({
  baseURL: API_BASE_URL,
  // The backend returns the refresh token in the response body, not a cookie.
  withCredentials: false,
  timeout: 20_000,
  headers: {
    "Content-Type": "application/json",
  },
});

const isAuthRequest = (url?: string): boolean =>
  Boolean(
    url?.includes(API_ENDPOINTS.auth.login) || url?.includes(API_ENDPOINTS.auth.refresh),
  );

http.interceptors.request.use((config) => {
  if (isAuthRequest(config.url)) {
    config.headers.delete("Authorization");
    return config;
  }

  const token = readAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshInFlight: Promise<string> | null = null;

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
    refreshFailureHandled = false;
    refreshInFlight = refreshToken()
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
};

const handleRefreshFailure = (): void => {
  if (refreshFailureHandled) {
    return;
  }

  refreshFailureHandled = true;
  clearSession();
  onUnauthorized();
};

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as RetryableConfig | undefined;

    if (
      !original ||
      !isAuthFailure(error) ||
      original._retry ||
      isAuthRequest(original.url)
    ) {
      return Promise.reject(normalizeError(error));
    }

    original._retry = true;

    try {
      const token = await refreshAccessToken();
      original.headers.Authorization = `Bearer ${token}`;
      return await http(original);
    } catch (refreshError) {
      handleRefreshFailure();
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
