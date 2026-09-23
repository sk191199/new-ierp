import { selectPermissions } from "@/redux/features/permissions/permissionSlice";
import { useAppSelector } from "@/redux/hooks";
import { hasPermission } from "@/utils/permissions/hasPermission";

// Admin-tier roles (e.g. "Super Admin", "Demo Admin") come back from the
// backend without an explicit granular permissions array yet, so treat any
// admin role as fully permissioned until the backend ships that list.
const FULL_ACCESS_ROLE_PATTERN = /admin/i;

export const usePermissions = () => {
  const { roles, permissions: granted } = useAppSelector(selectPermissions);
  const hasFullAccess = roles.some((role) => FULL_ACCESS_ROLE_PATTERN.test(role));

  return {
    granted,
    can: (permission?: string | string[]) => hasFullAccess || hasPermission(granted, permission),
  };
};
