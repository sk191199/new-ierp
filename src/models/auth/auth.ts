export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  roleName: string;
  initials: string;
  tenantId: string;
  tenantName?: string;
}

interface BackendAuthUser {
  id: string;
  tenantId: string;
  tenantName?: string;
  email: string;
  userName?: string;
  displayName: string;
  roles?: string[];
  permissions?: string[];
}

export interface BackendLoginResponse {
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
  tokenType?: string;
  user: BackendAuthUser;
  roles?: string[];
  permissions?: string[];
}

export interface LoginRequest {
  tenantCode: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
  tokenType?: string;
  roles: string[];
  permissions: string[];
}
