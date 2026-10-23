import useAuthStore from "../../stores/authStore";
import usePermissionStore from "../../stores/permissionStore";

export const SUPER_ADMIN_ROLE = "SUPER_ADMIN";

export const usePermission = () => {
  const user = useAuthStore((state) => state.user);
  const allRoles = usePermissionStore((state) => state.accessRoles);

  const isSuperAdmin = (user?.permissions || []).includes(SUPER_ADMIN_ROLE);

  const hasPermission = (moduleName, action) => {
    if (!user) return false;

    // Get user's assigned roles/permissions profiles
    const userRoles = user.permissions || [];

    // If user has SUPER_ADMIN role, they bypass all permission checks
    if (isSuperAdmin) {
      return true;
    }

    // Check if user has permission in any of their assigned roles
    return userRoles.some(roleName => {
      // Find the role in the list of all roles fetched from backend
      const roleDetails = allRoles.find(r => r.permissionName === roleName);
      if (!roleDetails || !roleDetails.modulePermissions) return false;

      // Deaktiv (PASSIVE) rol heç bir hüquq vermir
      if (roleDetails.status && roleDetails.status !== "ACTIVE") return false;

      // Find the module in the role's permissions
      const modulePerm = roleDetails.modulePermissions.find(m => m.moduleUrl === moduleName);
      if (!modulePerm || !modulePerm.actions) return false;

      // Check if the requested action is allowed
      return modulePerm.actions.includes(action);
    });
  };

  return { hasPermission, isSuperAdmin };
};
