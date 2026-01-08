import { useAuthStore } from '../stores/authStore';

// Define resources and actions for RBAC
export type Resource =
    | 'dashboard'
    | 'dg-dashboard'
    | 'projects'
    | 'finance'
    | 'staff'
    | 'rc-meetings'
    | 'documents'
    | 'reports'
    | 'timeline'
    | 'settings'
    | 'users'
    | 'profile'
    | 'bulk-import'
    | 'archive';

export type Action = 'read' | 'create' | 'update' | 'delete' | 'manage';

export type Role = 'ADMIN' | 'DIRECTOR' | 'SUPERVISOR' | 'PROJECT_HEAD' | 'EMPLOYEE' | 'EXTERNAL_OWNER';

// Permission matrix: defines what each role can access
const ROLE_PERMISSIONS: Record<Role, Partial<Record<Resource, Action[]>>> = {
    ADMIN: {
        'dashboard': ['read', 'manage'],
        'dg-dashboard': ['read', 'manage'],
        'projects': ['read', 'create', 'update', 'delete', 'manage'],
        'finance': ['read', 'create', 'update', 'delete', 'manage'],
        'staff': ['read', 'create', 'update', 'delete', 'manage'],
        'rc-meetings': ['read', 'create', 'update', 'delete', 'manage'],
        'documents': ['read', 'create', 'update', 'delete', 'manage'],
        'reports': ['read', 'create', 'update', 'delete', 'manage'],
        'timeline': ['read', 'manage'],
        'settings': ['read', 'update', 'manage'],
        'users': ['read', 'create', 'update', 'delete', 'manage'],
        'profile': ['read', 'update'],
        'bulk-import': ['read', 'create', 'manage'],
        'archive': ['read', 'manage'],
    },
    DIRECTOR: {
        'dashboard': ['read'],
        'dg-dashboard': ['read', 'manage'],
        'projects': ['read', 'create', 'update', 'manage'],
        'finance': ['read', 'create', 'update', 'manage'],
        'staff': ['read', 'manage'],
        'rc-meetings': ['read', 'create', 'update', 'manage'],
        'documents': ['read', 'create', 'update'],
        'reports': ['read', 'create', 'manage'],
        'timeline': ['read'],
        'settings': ['read'],
        'users': ['read'],
        'profile': ['read', 'update'],
        'bulk-import': ['read'],
        'archive': ['read'],
    },
    SUPERVISOR: {
        'dashboard': ['read'],
        'projects': ['read', 'create', 'update'],
        'finance': ['read', 'create'],
        'staff': ['read'],
        'rc-meetings': ['read'],
        'documents': ['read', 'create', 'update'],
        'reports': ['read', 'create'],
        'timeline': ['read'],
        'settings': ['read'],
        'profile': ['read', 'update'],
        'archive': ['read'],
    },
    PROJECT_HEAD: {
        'dashboard': ['read'],
        'projects': ['read', 'update'],
        'finance': ['read', 'create'],
        'staff': ['read'],
        'rc-meetings': ['read'],
        'documents': ['read', 'create', 'update'],
        'reports': ['read', 'create'],
        'timeline': ['read'],
        'profile': ['read', 'update'],
    },
    EMPLOYEE: {
        'dashboard': ['read'],
        'projects': ['read'],
        'finance': ['read'],
        'documents': ['read', 'create'],
        'timeline': ['read'],
        'profile': ['read', 'update'],
    },
    EXTERNAL_OWNER: {
        'dashboard': ['read'],
        'projects': ['read'],
        'finance': ['read'],
        'documents': ['read'],
        'reports': ['read'],
        'timeline': ['read'],
        'profile': ['read', 'update'],
    },
};

// Page access mapping - which pages each role can access
const PAGE_ACCESS: Record<Role, Resource[]> = {
    ADMIN: [
        'dashboard', 'dg-dashboard', 'projects', 'finance', 'staff',
        'rc-meetings', 'documents', 'reports', 'timeline', 'settings',
        'users', 'profile', 'bulk-import', 'archive'
    ],
    DIRECTOR: [
        'dashboard', 'dg-dashboard', 'projects', 'finance', 'staff',
        'rc-meetings', 'documents', 'reports', 'timeline', 'settings',
        'users', 'profile', 'bulk-import', 'archive'
    ],
    SUPERVISOR: [
        'dashboard', 'projects', 'finance', 'staff', 'rc-meetings',
        'documents', 'reports', 'timeline', 'settings', 'profile', 'archive'
    ],
    PROJECT_HEAD: [
        'dashboard', 'projects', 'finance', 'staff', 'rc-meetings',
        'documents', 'reports', 'timeline', 'profile'
    ],
    EMPLOYEE: [
        'dashboard', 'projects', 'finance', 'documents', 'timeline', 'profile'
    ],
    EXTERNAL_OWNER: [
        'dashboard', 'projects', 'finance', 'documents', 'reports', 'timeline', 'profile'
    ],
};

export interface UseRBACReturn {
    /** Check if user has permission for a specific action on a resource */
    hasPermission: (resource: Resource, action: Action) => boolean;
    /** Check if user can access a specific page */
    canAccessPage: (page: Resource) => boolean;
    /** Check if user has any of the specified roles */
    hasRole: (...roles: Role[]) => boolean;
    /** Check if user is admin */
    isAdmin: boolean;
    /** Current user role */
    userRole: Role | null;
    /** Get all permissions for current user */
    getPermissions: () => Partial<Record<Resource, Action[]>>;
    /** Get all accessible pages for current user */
    getAccessiblePages: () => Resource[];
}

/**
 * RBAC Hook - provides permission checking functions
 */
export const useRBAC = (): UseRBACReturn => {
    const { user } = useAuthStore();
    const userRole = (user?.role as Role) || null;

    const hasPermission = (resource: Resource, action: Action): boolean => {
        if (!userRole) return false;

        const permissions = ROLE_PERMISSIONS[userRole];
        if (!permissions) return false;

        const resourcePermissions = permissions[resource];
        if (!resourcePermissions) return false;

        return resourcePermissions.includes(action);
    };

    const canAccessPage = (page: Resource): boolean => {
        if (!userRole) return false;

        const accessiblePages = PAGE_ACCESS[userRole];
        return accessiblePages?.includes(page) ?? false;
    };

    const hasRole = (...roles: Role[]): boolean => {
        if (!userRole) return false;
        return roles.includes(userRole);
    };

    const isAdmin = userRole === 'ADMIN';

    const getPermissions = (): Partial<Record<Resource, Action[]>> => {
        if (!userRole) return {};
        return ROLE_PERMISSIONS[userRole] || {};
    };

    const getAccessiblePages = (): Resource[] => {
        if (!userRole) return [];
        return PAGE_ACCESS[userRole] || [];
    };

    return {
        hasPermission,
        canAccessPage,
        hasRole,
        isAdmin,
        userRole,
        getPermissions,
        getAccessiblePages,
    };
};

export { ROLE_PERMISSIONS, PAGE_ACCESS };
