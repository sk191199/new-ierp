import { API_ENDPOINTS, http, unwrapData } from "./api";
import type { BackendLoginResponse, LoginRequest, LoginResponse } from "@/models/auth/auth";

const REFRESH_TOKEN_KEY = "ierp.refresh-token";

export const saveRefreshToken = (token?: string): void => {
  if (token) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

const getRefreshToken = (): string | null => sessionStorage.getItem(REFRESH_TOKEN_KEY);

export const hasRefreshToken = (): boolean => Boolean(getRefreshToken());

const createInitials = (displayName: string): string =>
  displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const mapLoginResponse = (response: BackendLoginResponse): LoginResponse => {
  const roles = response.roles ?? response.user.roles ?? [];
  const permissions = response.permissions ?? response.user.permissions ?? [];

  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    accessTokenExpiresAt: response.accessTokenExpiresAt,
    refreshTokenExpiresAt: response.refreshTokenExpiresAt,
    tokenType: response.tokenType,
    roles,
    permissions,
    user: {
      id: response.user.id,
      email: response.user.email,
      displayName: response.user.displayName,
      roleName: roles[0] ?? "",
      initials: createInitials(response.user.displayName),
      tenantId: response.user.tenantId,
      tenantName: response.user.tenantName,
    },
  };
};

export const loginRequest = async (payload: LoginRequest): Promise<LoginResponse> => {
  const response = await http.post(API_ENDPOINTS.auth.login, payload);
  const result = mapLoginResponse(unwrapData<BackendLoginResponse>(response.data));
  saveRefreshToken(result.refreshToken);
  return result;
};

export const refreshSessionRequest = async (): Promise<LoginResponse> => {
  const refreshToken = getRefreshToken();
  const response = await http.post(
    API_ENDPOINTS.auth.refresh,
    refreshToken ? { refreshToken } : undefined,
  );
  const result = mapLoginResponse(unwrapData<BackendLoginResponse>(response.data));
  saveRefreshToken(result.refreshToken ?? refreshToken ?? undefined);
  return result;
};

export const logoutRequest = async (): Promise<void> => {
  try {
    await http.post(API_ENDPOINTS.auth.logout);
  } finally {
    saveRefreshToken();
  }
};
