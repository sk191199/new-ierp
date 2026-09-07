import { bindAuthSession } from "@/configurations/api/api";
import { ROUTES } from "@/constants/routes";
import { hasRefreshToken, refreshSessionRequest, saveRefreshToken } from "@/configurations/api/authApi";
import {
  sessionCleared,
  sessionEstablished,
  sessionFailed,
  sessionHydrating,
} from "@/redux/features/auth/authSlice";
import { permissionsCleared, permissionsLoaded } from "@/redux/features/permissions/permissionSlice";
import { tenantCleared, tenantLoaded } from "@/redux/features/tenant/tenantSlice";
import { store } from "@/redux/store";

let hydrationInFlight: Promise<void> | null = null;

export const bindHttpAuth = (): void => {
  bindAuthSession({
    getAccessToken: () => store.getState().auth.accessToken,
    clearSession: () => {
      store.dispatch(sessionCleared());
      store.dispatch(permissionsCleared());
      store.dispatch(tenantCleared());
      saveRefreshToken();
    },
    onUnauthorized: () => {
      if (window.location.pathname !== ROUTES.login) {
        window.location.assign(ROUTES.login);
      }
    },
    refreshAccessToken: async () => {
      const result = await refreshSessionRequest();
      store.dispatch(sessionEstablished({ user: result.user, accessToken: result.accessToken }));
      store.dispatch(permissionsLoaded({ roles: result.roles, permissions: result.permissions }));
      store.dispatch(tenantLoaded({ tenantId: result.user.tenantId, tenantName: result.user.tenantName }));
      return result.accessToken;
    },
  });
};

/**
 * Restore the session from the refresh cookie or session-stored refresh token.
 * Access tokens stay in memory and never enter localStorage.
 */
export const hydrateSession = (): Promise<void> => {
  if (!hydrationInFlight) {
    hydrationInFlight = (async () => {
      store.dispatch(sessionHydrating());
      if (!hasRefreshToken()) {
        store.dispatch(sessionFailed(null));
        return;
      }

      try {
        const result = await refreshSessionRequest();
        store.dispatch(sessionEstablished({ user: result.user, accessToken: result.accessToken }));
        store.dispatch(permissionsLoaded({ roles: result.roles, permissions: result.permissions }));
        store.dispatch(tenantLoaded({ tenantId: result.user.tenantId, tenantName: result.user.tenantName }));
      } catch {
        saveRefreshToken();
        store.dispatch(sessionFailed(null));
      }
    })().finally(() => {
      hydrationInFlight = null;
    });
  }

  return hydrationInFlight;
};
