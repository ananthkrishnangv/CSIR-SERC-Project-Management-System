import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useRBAC, Resource, Action, Role } from '../hooks/useRBAC';

interface RBACGuardProps {
    /** The resource being protected */
    resource?: Resource;
    /** The action being attempted (defaults to 'read') */
    action?: Action;
    /** Required roles (alternative to resource/action check) */
    roles?: Role[];
    /** Content to render if authorized */
    children: ReactNode;
    /** Custom fallback component for unauthorized access */
    fallback?: ReactNode;
    /** If true, redirects to access-denied page instead of showing fallback */
    redirectOnDenied?: boolean;
}

/**
 * RBACGuard Component - Protects routes and components based on user permissions
 * 
 * Usage examples:
 * 
 * // Protect by resource/action
 * <RBACGuard resource="users" action="read">
 *     <UsersPage />
 * </RBACGuard>
 * 
 * // Protect by roles
 * <RBACGuard roles={['ADMIN', 'DIRECTOR']}>
 *     <AdminContent />
 * </RBACGuard>
 * 
 * // With custom fallback
 * <RBACGuard resource="finance" action="manage" fallback={<ReadOnlyView />}>
 *     <EditableView />
 * </RBACGuard>
 */
export const RBACGuard = ({
    resource,
    action = 'read',
    roles,
    children,
    fallback,
    redirectOnDenied = true,
}: RBACGuardProps): ReactNode => {
    const { hasPermission, canAccessPage, hasRole } = useRBAC();

    let isAuthorized = false;

    // Check authorization based on provided props
    if (roles && roles.length > 0) {
        // Role-based check
        isAuthorized = hasRole(...roles);
    } else if (resource) {
        // Permission-based check - check both page access and action permission
        isAuthorized = canAccessPage(resource) && hasPermission(resource, action);
    } else {
        // No restrictions specified, allow access
        isAuthorized = true;
    }

    if (!isAuthorized) {
        if (fallback) {
            return fallback;
        }
        if (redirectOnDenied) {
            return <Navigate to="/access-denied" replace />;
        }
        return null;
    }

    return <>{children}</>;
};

/**
 * PageGuard - Simplified guard for page-level access control
 */
interface PageGuardProps {
    page: Resource;
    children: ReactNode;
}

export const PageGuard = ({ page, children }: PageGuardProps): ReactNode => {
    const { canAccessPage } = useRBAC();

    if (!canAccessPage(page)) {
        return <Navigate to="/access-denied" replace />;
    }

    return <>{children}</>;
};

/**
 * RoleGuard - Guard that checks for specific roles
 */
interface RoleGuardProps {
    roles: Role[];
    children: ReactNode;
    fallback?: ReactNode;
}

export const RoleGuard = ({ roles, children, fallback }: RoleGuardProps): ReactNode => {
    const { hasRole } = useRBAC();

    if (!hasRole(...roles)) {
        return fallback || <Navigate to="/access-denied" replace />;
    }

    return <>{children}</>;
};

/**
 * AdminOnly - Convenience component for admin-only content
 */
export const AdminOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }): ReactNode => {
    const { isAdmin } = useRBAC();

    if (!isAdmin) {
        return fallback || null;
    }

    return <>{children}</>;
};

export default RBACGuard;
