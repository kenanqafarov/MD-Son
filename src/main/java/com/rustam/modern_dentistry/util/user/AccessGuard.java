package com.rustam.modern_dentistry.util.user;

import com.rustam.modern_dentistry.dao.entity.settings.permission.Permission;
import com.rustam.modern_dentistry.dao.entity.users.BaseUser;
import com.rustam.modern_dentistry.exception.custom.ForbiddenException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collection;
import java.util.Collections;
import java.util.Optional;

/**
 * SUPER_ADMIN rolu bütün yoxlamalardan keçir, ona görə bu ad yalnız sistem roluna
 * məxsusdur: başqa rol bu adı ala bilməz, yalnız super admin onu təyin edə və
 * super admin istifadəçini dəyişə bilər.
 */
public final class AccessGuard {

    public static final String SUPER_ADMIN = "SUPER_ADMIN";
    /** Texnik hesabı ilə daxil olan istifadəçi: yalnız özünə təyin olunmuş laboratoriya sifarişləri */
    public static final String TECHNICIAN = "TECHNICIAN";
    public static final String LAB_MODULE = "Gələn sifarişlər";

    private AccessGuard() {
    }

    public static boolean isReservedName(String permissionName) {
        return permissionName != null && SUPER_ADMIN.equalsIgnoreCase(permissionName.trim());
    }

    public static boolean isSuperAdminRole(Permission permission) {
        return permission != null && isReservedName(permission.getPermissionName());
    }

    public static boolean holdsSuperAdminRole(BaseUser user) {
        return user != null && user.getPermissions() != null
                && user.getPermissions().stream().anyMatch(AccessGuard::isSuperAdminRole);
    }

    public static boolean currentHasAuthority(String authority) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals(SUPER_ADMIN) || a.equals(authority));
    }

    public static boolean isCurrentSuperAdmin() {
        return currentHasAuthority(SUPER_ADMIN);
    }

    public static Optional<BaseUser> currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails details) {
            return Optional.ofNullable(details.user());
        }
        return Optional.empty();
    }

    public static void requireSuperAdminToAssign(Collection<Permission> permissions) {
        Collection<Permission> roles = permissions == null ? Collections.emptyList() : permissions;
        if (roles.stream().anyMatch(AccessGuard::isSuperAdminRole) && !isCurrentSuperAdmin()) {
            throw new ForbiddenException("SUPER_ADMIN rolunu yalnız super admin təyin edə bilər");
        }
    }

    /** Laboratoriya modulunda UPDATE/STATUS hüququ olmayan texnik yalnız öz sifarişini dəyişə bilər */
    public static void requireOwnOrderUnlessLabManager(String orderTechnicianId) {
        boolean labManager = currentHasAuthority(LAB_MODULE + ":UPDATE") || currentHasAuthority(LAB_MODULE + ":STATUS");
        if (labManager) return;
        String currentId = currentUser().map(BaseUser::getId).orElse(null);
        if (currentId == null || !currentId.equals(orderTechnicianId)) {
            throw new ForbiddenException("Texnik yalnız özünə təyin olunmuş sifarişi dəyişə bilər");
        }
    }

    public static void requireSuperAdminToModify(BaseUser target) {
        if (holdsSuperAdminRole(target) && !isCurrentSuperAdmin()) {
            throw new ForbiddenException("Super admin istifadəçini yalnız super admin dəyişə bilər");
        }
    }
}
