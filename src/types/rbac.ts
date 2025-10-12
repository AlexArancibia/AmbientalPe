// RBAC Types
export enum PermissionAction {
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  MANAGE = "MANAGE",
}

export enum PermissionResource {
  USER = "USER",
  ROLE = "ROLE",
  PERMISSION = "PERMISSION",
  CLIENT = "CLIENT",
  EQUIPMENT = "EQUIPMENT",
  QUOTATION = "QUOTATION",
  SERVICE_ORDER = "SERVICE_ORDER",
  PURCHASE_ORDER = "PURCHASE_ORDER",
  COMPANY = "COMPANY",
  DASHBOARD = "DASHBOARD",
  ADMIN = "ADMIN",
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string | null;
  isActive: boolean;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  action: PermissionAction;
  resource: PermissionResource;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  role: Role;
  assignedAt: Date;
  assignedBy?: string | null;
  expiresAt?: Date | null;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  role: Role;
  permission: Permission;
  createdAt: Date;
}

// Extended User type with roles
export interface UserWithRoles {
  id: string;
  email: string;
  name: string;
  phone?: string;
  image?: string;
  emailVerified: boolean;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  userRoles: UserRoleAssignment[];
}

// Permission checking types
export interface PermissionCheck {
  action: PermissionAction;
  resource: PermissionResource;
}

export interface RBACContext {
  userId: string;
  userRoles: Role[];
  permissions: Permission[];
}

// Default roles
export const DEFAULT_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  OPERATOR: "operator",
  VIEWER: "viewer",
} as const;

// Default permissions
export const DEFAULT_PERMISSIONS = {
  // User management
  USER_CREATE: {
    action: PermissionAction.CREATE,
    resource: PermissionResource.USER,
  },
  USER_READ: {
    action: PermissionAction.READ,
    resource: PermissionResource.USER,
  },
  USER_UPDATE: {
    action: PermissionAction.UPDATE,
    resource: PermissionResource.USER,
  },
  USER_DELETE: {
    action: PermissionAction.DELETE,
    resource: PermissionResource.USER,
  },
  USER_MANAGE: {
    action: PermissionAction.MANAGE,
    resource: PermissionResource.USER,
  },

  // Role management
  ROLE_CREATE: {
    action: PermissionAction.CREATE,
    resource: PermissionResource.ROLE,
  },
  ROLE_READ: {
    action: PermissionAction.READ,
    resource: PermissionResource.ROLE,
  },
  ROLE_UPDATE: {
    action: PermissionAction.UPDATE,
    resource: PermissionResource.ROLE,
  },
  ROLE_DELETE: {
    action: PermissionAction.DELETE,
    resource: PermissionResource.ROLE,
  },
  ROLE_MANAGE: {
    action: PermissionAction.MANAGE,
    resource: PermissionResource.ROLE,
  },

  // Client management
  CLIENT_CREATE: {
    action: PermissionAction.CREATE,
    resource: PermissionResource.CLIENT,
  },
  CLIENT_READ: {
    action: PermissionAction.READ,
    resource: PermissionResource.CLIENT,
  },
  CLIENT_UPDATE: {
    action: PermissionAction.UPDATE,
    resource: PermissionResource.CLIENT,
  },
  CLIENT_DELETE: {
    action: PermissionAction.DELETE,
    resource: PermissionResource.CLIENT,
  },
  CLIENT_MANAGE: {
    action: PermissionAction.MANAGE,
    resource: PermissionResource.CLIENT,
  },

  // Equipment management
  EQUIPMENT_CREATE: {
    action: PermissionAction.CREATE,
    resource: PermissionResource.EQUIPMENT,
  },
  EQUIPMENT_READ: {
    action: PermissionAction.READ,
    resource: PermissionResource.EQUIPMENT,
  },
  EQUIPMENT_UPDATE: {
    action: PermissionAction.UPDATE,
    resource: PermissionResource.EQUIPMENT,
  },
  EQUIPMENT_DELETE: {
    action: PermissionAction.DELETE,
    resource: PermissionResource.EQUIPMENT,
  },
  EQUIPMENT_MANAGE: {
    action: PermissionAction.MANAGE,
    resource: PermissionResource.EQUIPMENT,
  },

  // Quotation management
  QUOTATION_CREATE: {
    action: PermissionAction.CREATE,
    resource: PermissionResource.QUOTATION,
  },
  QUOTATION_READ: {
    action: PermissionAction.READ,
    resource: PermissionResource.QUOTATION,
  },
  QUOTATION_UPDATE: {
    action: PermissionAction.UPDATE,
    resource: PermissionResource.QUOTATION,
  },
  QUOTATION_DELETE: {
    action: PermissionAction.DELETE,
    resource: PermissionResource.QUOTATION,
  },
  QUOTATION_MANAGE: {
    action: PermissionAction.MANAGE,
    resource: PermissionResource.QUOTATION,
  },

  // Service Order management
  SERVICE_ORDER_CREATE: {
    action: PermissionAction.CREATE,
    resource: PermissionResource.SERVICE_ORDER,
  },
  SERVICE_ORDER_READ: {
    action: PermissionAction.READ,
    resource: PermissionResource.SERVICE_ORDER,
  },
  SERVICE_ORDER_UPDATE: {
    action: PermissionAction.UPDATE,
    resource: PermissionResource.SERVICE_ORDER,
  },
  SERVICE_ORDER_DELETE: {
    action: PermissionAction.DELETE,
    resource: PermissionResource.SERVICE_ORDER,
  },
  SERVICE_ORDER_MANAGE: {
    action: PermissionAction.MANAGE,
    resource: PermissionResource.SERVICE_ORDER,
  },

  // Purchase Order management
  PURCHASE_ORDER_CREATE: {
    action: PermissionAction.CREATE,
    resource: PermissionResource.PURCHASE_ORDER,
  },
  PURCHASE_ORDER_READ: {
    action: PermissionAction.READ,
    resource: PermissionResource.PURCHASE_ORDER,
  },
  PURCHASE_ORDER_UPDATE: {
    action: PermissionAction.UPDATE,
    resource: PermissionResource.PURCHASE_ORDER,
  },
  PURCHASE_ORDER_DELETE: {
    action: PermissionAction.DELETE,
    resource: PermissionResource.PURCHASE_ORDER,
  },
  PURCHASE_ORDER_MANAGE: {
    action: PermissionAction.MANAGE,
    resource: PermissionResource.PURCHASE_ORDER,
  },

  // Company management
  COMPANY_CREATE: {
    action: PermissionAction.CREATE,
    resource: PermissionResource.COMPANY,
  },
  COMPANY_READ: {
    action: PermissionAction.READ,
    resource: PermissionResource.COMPANY,
  },
  COMPANY_UPDATE: {
    action: PermissionAction.UPDATE,
    resource: PermissionResource.COMPANY,
  },
  COMPANY_DELETE: {
    action: PermissionAction.DELETE,
    resource: PermissionResource.COMPANY,
  },
  COMPANY_MANAGE: {
    action: PermissionAction.MANAGE,
    resource: PermissionResource.COMPANY,
  },

  // Dashboard access
  DASHBOARD_READ: {
    action: PermissionAction.READ,
    resource: PermissionResource.DASHBOARD,
  },

  // Admin access
  ADMIN_CREATE: {
    action: PermissionAction.CREATE,
    resource: PermissionResource.ADMIN,
  },
  ADMIN_READ: {
    action: PermissionAction.READ,
    resource: PermissionResource.ADMIN,
  },
  ADMIN_UPDATE: {
    action: PermissionAction.UPDATE,
    resource: PermissionResource.ADMIN,
  },
  ADMIN_DELETE: {
    action: PermissionAction.DELETE,
    resource: PermissionResource.ADMIN,
  },
  ADMIN_MANAGE: {
    action: PermissionAction.MANAGE,
    resource: PermissionResource.ADMIN,
  },
} as const;
