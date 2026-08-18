import { bindAuthSession } from "@/configurations/api/api";
import { ROUTES } from "@/constants/routes";
import { refreshSessionRequest } from "@/configurations/api/authApi";
import {
  accessTokenUpdated,
  sessionCleared,
  sessionEstablished,
  sessionFailed,
  sessionHydrating,
} from "@/redux/features/auth/authSlice";
import { permissionsCleared, permissionsLoaded } from "@/redux/features/permissions/permissionSlice";
import { tenantCleared, tenantLoaded } from "@/redux/features/tenant/tenantSlice";
import { store } from "@/redux/store";

export const bindHttpAuth = (): void => {
  bindAuthSession({
    getAccessToken: () => store.getState().auth.accessToken,
    setAccessToken: (token) => {
      store.dispatch(accessTokenUpdated(token));
    },
    clearSession: () => {
      store.dispatch(sessionCleared());
      store.dispatch(permissionsCleared());
      store.dispatch(tenantCleared());
    },
    onUnauthorized: () => {
      if (window.location.pathname !== ROUTES.login) {
        window.location.assign(ROUTES.login);
      }
    },
  });
};

/**
 * Restore the session from the refresh cookie (or the mock session flag).
 * Access tokens stay in memory; refresh tokens never enter localStorage.
 */
export const hydrateSession = async (): Promise<void> => {
  store.dispatch(sessionHydrating());
  try {
    const result = await refreshSessionRequest();
    store.dispatch(sessionEstablished({ user: result.user, accessToken: result.accessToken }));
    store.dispatch(permissionsLoaded({ roles: result.roles, permissions: result.permissions }));
    store.dispatch(tenantLoaded({ tenantId: result.user.tenantId, tenantName: "i-ERP HQ" }));
  } catch {
    store.dispatch(sessionFailed(null));
  }
};
