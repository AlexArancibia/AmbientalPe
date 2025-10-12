import { prisma } from "@/lib/db";
import {
  DEFAULT_PERMISSIONS,
  DEFAULT_ROLES,
  PermissionAction,
  PermissionResource,
} from "@/types/rbac";

export async function seedRBAC() {
  // Crear permisos
  const permissions = await Promise.all(
    Object.entries(DEFAULT_PERMISSIONS).map(async ([_key, permission]) => {
      const result = await prisma.permission.upsert({
        where: {
          action_resource: {
            action: permission.action,
            resource: permission.resource,
          },
        },
        update: {},
        create: {
          action: permission.action,
          resource: permission.resource,
          description: `Permission to ${permission.action.toLowerCase()} ${permission.resource.toLowerCase()}`,
        },
      });
      return result;
    })
  );

  // Crear roles

  // Rol de Super Administrador
  const superAdminRole = await prisma.role.upsert({
    where: { name: DEFAULT_ROLES.SUPER_ADMIN },
    update: {},
    create: {
      name: DEFAULT_ROLES.SUPER_ADMIN,
      displayName: "Super Administrador",
      description: "Acceso completo al sistema con todos los permisos",
      isSystem: true,
      isActive: true,
    },
  });

  // Rol de Administrador
  const adminRole = await prisma.role.upsert({
    where: { name: DEFAULT_ROLES.ADMIN },
    update: {},
    create: {
      name: DEFAULT_ROLES.ADMIN,
      displayName: "Administrador",
      description: "Acceso administrativo a la mayoría de funciones del sistema",
      isSystem: true,
      isActive: true,
    },
  });

  // Rol de Gerente
  const managerRole = await prisma.role.upsert({
    where: { name: DEFAULT_ROLES.MANAGER },
    update: {},
    create: {
      name: DEFAULT_ROLES.MANAGER,
      displayName: "Gerente",
      description: "Acceso de gestión a operaciones de monitoreo ambiental y recursos",
      isSystem: true,
      isActive: true,
    },
  });

  // Rol de Operador
  const operatorRole = await prisma.role.upsert({
    where: { name: DEFAULT_ROLES.OPERATOR },
    update: {},
    create: {
      name: DEFAULT_ROLES.OPERATOR,
      displayName: "Operador",
      description: "Acceso operacional a tareas diarias, órdenes de servicio y equipos",
      isSystem: true,
      isActive: true,
    },
  });

  // Rol de Observador
  const viewerRole = await prisma.role.upsert({
    where: { name: DEFAULT_ROLES.VIEWER },
    update: {},
    create: {
      name: DEFAULT_ROLES.VIEWER,
      displayName: "Observador",
      description: "Acceso de solo lectura a funciones básicas del sistema",
      isSystem: true,
      isActive: true,
    },
  });

  // Asignar permisos a roles

  // Super Admin obtiene todos los permisos
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Admin obtiene la mayoría de permisos excepto los específicos de super admin
  const adminPermissions = permissions.filter(
    (p) => !p.resource.includes("ROLE") || p.action !== PermissionAction.MANAGE
  );
  for (const permission of adminPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Manager obtiene permisos de gestión para recursos de monitoreo ambiental
  const managerPermissions = permissions.filter(
    (p) =>
      (p.resource === PermissionResource.USER &&
        p.action !== PermissionAction.DELETE) ||
      p.resource === PermissionResource.DASHBOARD ||
      p.resource === PermissionResource.CLIENT ||
      p.resource === PermissionResource.EQUIPMENT ||
      p.resource === PermissionResource.QUOTATION ||
      (p.resource === PermissionResource.COMPANY &&
        p.action === PermissionAction.READ)
  );
  for (const permission of managerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: managerRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: managerRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Operator obtiene permisos operacionales para órdenes de servicio y equipos
  const operatorPermissions = permissions.filter(
    (p) =>
      p.resource === PermissionResource.SERVICE_ORDER ||
      p.resource === PermissionResource.PURCHASE_ORDER ||
      p.resource === PermissionResource.EQUIPMENT ||
      p.resource === PermissionResource.DASHBOARD ||
      (p.resource === PermissionResource.CLIENT &&
        p.action === PermissionAction.READ) ||
      (p.resource === PermissionResource.QUOTATION &&
        (p.action === PermissionAction.READ ||
          p.action === PermissionAction.CREATE))
  );
  for (const permission of operatorPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: operatorRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: operatorRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Viewer obtiene permisos de solo lectura
  const viewerPermissions = permissions.filter(
    (p) =>
      p.action === PermissionAction.READ &&
      (p.resource === PermissionResource.DASHBOARD ||
        p.resource === PermissionResource.CLIENT ||
        p.resource === PermissionResource.EQUIPMENT ||
        p.resource === PermissionResource.QUOTATION ||
        p.resource === PermissionResource.SERVICE_ORDER ||
        p.resource === PermissionResource.PURCHASE_ORDER)
  );
  for (const permission of viewerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: viewerRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: viewerRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Asignar rol por defecto a usuarios existentes
  const existingUsers = await prisma.user.findMany({
    where: {
      userRoles: {
        none: {},
      },
    },
  });

  for (const user of existingUsers) {
    // Asignar rol de operador por defecto
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: operatorRole.id,
      },
    });
  }

  return {
    roles: [superAdminRole, adminRole, managerRole, operatorRole, viewerRole],
    permissions: permissions.length,
  };
}

// Ejecutar seed si este archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedRBAC()
    .then(() => {
      process.exit(0);
    })
    .catch((_error) => {
      process.exit(1);
    });
}
