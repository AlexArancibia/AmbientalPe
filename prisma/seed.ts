import {
  PermissionAction,
  PermissionResource,
  PrismaClient,
} from "@prisma/client";
import { auth } from "../src/lib/auth";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting complete seed process for AMBIENTALPE...");

  // ================================
  // 1. CLEAR ALL DATA
  // ================================
  console.log("🗑️ Clearing all existing data...");

  // Delete in correct order to avoid foreign key constraints
  await prisma.purchaseOrderItem.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.serviceOrderItem.deleteMany({});
  await prisma.serviceOrder.deleteMany({});
  await prisma.quotationItem.deleteMany({});
  await prisma.quotation.deleteMany({});
  await prisma.equipment.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.bankAccount.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.userRole.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.verification.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.rolePermission.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.permission.deleteMany({});

  console.log("✅ All data cleared successfully");

  // ================================
  // 2. ROLES AND PERMISSIONS
  // ================================
  console.log("👥 Creating roles and permissions...");

  // Create all permissions
  const permissions = [
    // Dashboard permissions
    { action: PermissionAction.READ, resource: PermissionResource.DASHBOARD },

    // User management permissions
    { action: PermissionAction.CREATE, resource: PermissionResource.USER },
    { action: PermissionAction.READ, resource: PermissionResource.USER },
    { action: PermissionAction.UPDATE, resource: PermissionResource.USER },
    { action: PermissionAction.DELETE, resource: PermissionResource.USER },
    { action: PermissionAction.MANAGE, resource: PermissionResource.USER },

    // Role management permissions
    { action: PermissionAction.CREATE, resource: PermissionResource.ROLE },
    { action: PermissionAction.READ, resource: PermissionResource.ROLE },
    { action: PermissionAction.UPDATE, resource: PermissionResource.ROLE },
    { action: PermissionAction.DELETE, resource: PermissionResource.ROLE },
    { action: PermissionAction.MANAGE, resource: PermissionResource.ROLE },

    // Permission management
    { action: PermissionAction.CREATE, resource: PermissionResource.PERMISSION },
    { action: PermissionAction.READ, resource: PermissionResource.PERMISSION },
    { action: PermissionAction.UPDATE, resource: PermissionResource.PERMISSION },
    { action: PermissionAction.DELETE, resource: PermissionResource.PERMISSION },
    { action: PermissionAction.MANAGE, resource: PermissionResource.PERMISSION },

    // Client permissions
    { action: PermissionAction.CREATE, resource: PermissionResource.CLIENT },
    { action: PermissionAction.READ, resource: PermissionResource.CLIENT },
    { action: PermissionAction.UPDATE, resource: PermissionResource.CLIENT },
    { action: PermissionAction.DELETE, resource: PermissionResource.CLIENT },
    { action: PermissionAction.MANAGE, resource: PermissionResource.CLIENT },

    // Equipment permissions
    { action: PermissionAction.CREATE, resource: PermissionResource.EQUIPMENT },
    { action: PermissionAction.READ, resource: PermissionResource.EQUIPMENT },
    { action: PermissionAction.UPDATE, resource: PermissionResource.EQUIPMENT },
    { action: PermissionAction.DELETE, resource: PermissionResource.EQUIPMENT },
    { action: PermissionAction.MANAGE, resource: PermissionResource.EQUIPMENT },

    // Quotation permissions
    { action: PermissionAction.CREATE, resource: PermissionResource.QUOTATION },
    { action: PermissionAction.READ, resource: PermissionResource.QUOTATION },
    { action: PermissionAction.UPDATE, resource: PermissionResource.QUOTATION },
    { action: PermissionAction.DELETE, resource: PermissionResource.QUOTATION },
    { action: PermissionAction.MANAGE, resource: PermissionResource.QUOTATION },

    // Service Order permissions
    { action: PermissionAction.CREATE, resource: PermissionResource.SERVICE_ORDER },
    { action: PermissionAction.READ, resource: PermissionResource.SERVICE_ORDER },
    { action: PermissionAction.UPDATE, resource: PermissionResource.SERVICE_ORDER },
    { action: PermissionAction.DELETE, resource: PermissionResource.SERVICE_ORDER },
    { action: PermissionAction.MANAGE, resource: PermissionResource.SERVICE_ORDER },

    // Purchase Order permissions
    { action: PermissionAction.CREATE, resource: PermissionResource.PURCHASE_ORDER },
    { action: PermissionAction.READ, resource: PermissionResource.PURCHASE_ORDER },
    { action: PermissionAction.UPDATE, resource: PermissionResource.PURCHASE_ORDER },
    { action: PermissionAction.DELETE, resource: PermissionResource.PURCHASE_ORDER },
    { action: PermissionAction.MANAGE, resource: PermissionResource.PURCHASE_ORDER },

    // Company permissions
    { action: PermissionAction.CREATE, resource: PermissionResource.COMPANY },
    { action: PermissionAction.READ, resource: PermissionResource.COMPANY },
    { action: PermissionAction.UPDATE, resource: PermissionResource.COMPANY },
    { action: PermissionAction.DELETE, resource: PermissionResource.COMPANY },
    { action: PermissionAction.MANAGE, resource: PermissionResource.COMPANY },

    // Admin permissions
    { action: PermissionAction.READ, resource: PermissionResource.ADMIN },
    { action: PermissionAction.MANAGE, resource: PermissionResource.ADMIN },
  ];

  const createdPermissions = [];
  for (const perm of permissions) {
    const permission = await prisma.permission.create({
      data: {
        action: perm.action,
        resource: perm.resource,
        description: `${perm.action} permission for ${perm.resource}`,
      },
    });
    createdPermissions.push(permission);
  }

  // Create roles
  const superAdminRole = await prisma.role.create({
    data: {
      name: "super_admin",
      displayName: "Super Admin",
      description: "Full system access with all permissions",
      isSystem: true,
    },
  });

  const adminRole = await prisma.role.create({
    data: {
      name: "admin",
      displayName: "Admin",
      description: "Administrative access to manage users and system settings",
      isSystem: true,
    },
  });

  const managerRole = await prisma.role.create({
    data: {
      name: "manager",
      displayName: "Gestor",
      description: "Gestión de órdenes de servicio, cotizaciones y órdenes de compra",
      isSystem: true,
    },
  });

  const operatorRole = await prisma.role.create({
    data: {
      name: "operator",
      displayName: "Operador",
      description: "Operaciones básicas y consultas",
      isSystem: true,
    },
  });

  const viewerRole = await prisma.role.create({
    data: {
      name: "viewer",
      displayName: "Viewer",
      description: "Read-only access to basic features",
      isSystem: true,
    },
  });

  // Assign permissions to roles

  // Super Admin gets all permissions
  for (const permission of createdPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Admin gets most permissions except super admin specific ones
  const adminPermissions = createdPermissions.filter(
    (p) => !p.resource.includes("ROLE") || p.action !== PermissionAction.MANAGE
  );
  for (const permission of adminPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Manager gets business operation permissions
  const managerPermissions = createdPermissions.filter(
    (p) =>
      p.resource === PermissionResource.DASHBOARD ||
      (p.resource === PermissionResource.CLIENT &&
        [PermissionAction.READ, PermissionAction.CREATE, PermissionAction.UPDATE].includes(
          p.action as any
        )) ||
      (p.resource === PermissionResource.EQUIPMENT &&
        [PermissionAction.READ, PermissionAction.CREATE, PermissionAction.UPDATE].includes(
          p.action as any
        )) ||
      (p.resource === PermissionResource.QUOTATION &&
        [
          PermissionAction.READ,
          PermissionAction.CREATE,
          PermissionAction.UPDATE,
          PermissionAction.MANAGE,
        ].includes(p.action as any)) ||
      (p.resource === PermissionResource.SERVICE_ORDER &&
        [
          PermissionAction.READ,
          PermissionAction.CREATE,
          PermissionAction.UPDATE,
          PermissionAction.MANAGE,
        ].includes(p.action as any)) ||
      (p.resource === PermissionResource.PURCHASE_ORDER &&
        [
          PermissionAction.READ,
          PermissionAction.CREATE,
          PermissionAction.UPDATE,
          PermissionAction.MANAGE,
        ].includes(p.action as any)) ||
      (p.resource === PermissionResource.COMPANY && p.action === PermissionAction.READ)
  );
  for (const permission of managerPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: managerRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Operator gets read and create permissions
  const operatorPermissions = createdPermissions.filter(
    (p) =>
      p.resource === PermissionResource.DASHBOARD ||
      (p.resource === PermissionResource.CLIENT &&
        [PermissionAction.READ, PermissionAction.CREATE].includes(p.action as any)) ||
      (p.resource === PermissionResource.EQUIPMENT && p.action === PermissionAction.READ) ||
      (p.resource === PermissionResource.QUOTATION &&
        [PermissionAction.READ, PermissionAction.CREATE].includes(p.action as any)) ||
      (p.resource === PermissionResource.SERVICE_ORDER &&
        [PermissionAction.READ, PermissionAction.CREATE].includes(p.action as any)) ||
      (p.resource === PermissionResource.PURCHASE_ORDER && p.action === PermissionAction.READ) ||
      (p.resource === PermissionResource.COMPANY && p.action === PermissionAction.READ)
  );
  for (const permission of operatorPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: operatorRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Viewer gets only read permissions
  const viewerPermissions = createdPermissions.filter(
    (p) =>
      (p.resource === PermissionResource.DASHBOARD && p.action === PermissionAction.READ) ||
      (p.resource === PermissionResource.CLIENT && p.action === PermissionAction.READ) ||
      (p.resource === PermissionResource.EQUIPMENT && p.action === PermissionAction.READ) ||
      (p.resource === PermissionResource.QUOTATION && p.action === PermissionAction.READ) ||
      (p.resource === PermissionResource.SERVICE_ORDER && p.action === PermissionAction.READ) ||
      (p.resource === PermissionResource.PURCHASE_ORDER && p.action === PermissionAction.READ) ||
      (p.resource === PermissionResource.COMPANY && p.action === PermissionAction.READ)
  );
  for (const permission of viewerPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: viewerRole.id,
        permissionId: permission.id,
      },
    });
  }

  // ================================
  // 3. USER CREATION - Using Better Auth API
  // ================================
  console.log("👥 Creating users...");

  const users = [
    {
      name: "Super Admin",
      email: "superadmin@ambientalpe.com",
      password: "SuperAdmin123",
      phone: "+51 999 888 777",
      language: "ES" as const,
      position: "Super Administrador",
      department: "Administración",
      role: superAdminRole,
    },
    {
      name: "Admin User",
      email: "admin@ambientalpe.com",
      password: "Admin123",
      phone: "+51 999 888 776",
      language: "ES" as const,
      position: "Administrador",
      department: "Administración",
      role: adminRole,
    },
    {
      name: "Carlos Gestor",
      email: "gestor@ambientalpe.com",
      password: "Gestor123",
      phone: "+51 999 888 775",
      language: "ES" as const,
      position: "Gestor de Proyectos",
      department: "Operaciones",
      role: managerRole,
    },
    {
      name: "María Operadora",
      email: "operador@ambientalpe.com",
      password: "Operador123",
      phone: "+51 999 888 774",
      language: "ES" as const,
      position: "Operadora",
      department: "Operaciones",
      role: operatorRole,
    },
    {
      name: "Juan Viewer",
      email: "viewer@ambientalpe.com",
      password: "Viewer123",
      phone: "+51 999 888 773",
      language: "ES" as const,
      position: "Consultor",
      department: "Consultoría",
      role: viewerRole,
    },
  ];

  const createdUsers = [];

  for (const userData of users) {
    try {
      console.log(`🆕 Creating user: ${userData.email}`);

      const result = await auth.api.signUpEmail({
        body: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
        },
      });

      if (!result.user) {
        console.error(
          `❌ Failed to create user ${userData.email}: No user returned`
        );
        continue;
      }

      // Update additional fields
      const newUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (newUser) {
        await prisma.user.update({
          where: { id: newUser.id },
          data: {
            phone: userData.phone,
            language: userData.language,
            position: userData.position,
            department: userData.department,
            role: userData.role.name,
            emailVerified: true,
            image: "/images/avatars/default-avatar.png",
          },
        });

        // Assign role
        await prisma.userRole.create({
          data: {
            userId: newUser.id,
            roleId: userData.role.id,
            assignedBy: "system",
          },
        });

        createdUsers.push(newUser);
        console.log(
          `✅ User ${userData.email} created successfully with role ${userData.role.name}`
        );
      }
    } catch (error: any) {
      console.error(
        `❌ Error creating user ${userData.email}:`,
        error.message || error
      );
    }
  }

  // Get the manager user for orders
  const managerUser = createdUsers.find((u) => u.email === "gestor@ambientalpe.com");
  if (!managerUser) {
    throw new Error("Manager user not found");
  }

  // ================================
  // 4. COMPANY INFORMATION
  // ================================
  console.log("🏢 Creating company information...");
  const company = await prisma.company.create({
    data: {
      id: "company-ambientalpe-001",
      name: "AMBIENTALPE S.A.C.",
      ruc: "20123456789",
      address: "Av. Principal 123, Lima, Perú",
      email: "contacto@ambientalpe.com",
      phone: "+51 1 234 5678",
      logo: "/images/ambientalpe-logo.png",
    },
  });

  // Create bank accounts
  await prisma.bankAccount.createMany({
    data: [
      {
        companyId: company.id,
        bankName: "Banco de Crédito del Perú",
        accountNumber: "194-1234567-0-89",
        accountType: "Cuenta Corriente",
        currency: "PEN",
        isDefault: true,
      },
      {
        companyId: company.id,
        bankName: "Banco de Crédito del Perú",
        accountNumber: "194-7654321-1-45",
        accountType: "Cuenta Corriente",
        currency: "USD",
        isDefault: false,
      },
      {
        companyId: company.id,
        bankName: "Interbank",
        accountNumber: "200-3001234567",
        accountType: "Cuenta Corriente",
        currency: "PEN",
        isDefault: false,
      },
    ],
  });

  // ================================
  // 5. CLIENTS
  // ================================
  console.log("👥 Creating clients...");

  await prisma.client.createMany({
    data: [
      {
        name: "Minera del Sur S.A.",
        ruc: "20456789123",
        address: "Av. Minería 456, Arequipa",
        type: "CLIENT",
        email: "contacto@minerasur.com",
        contactPerson: "Ing. Pedro García",
        creditLine: 50000.0,
        paymentMethod: "Transferencia bancaria",
        startDate: new Date("2023-01-15"),
      },
      {
        name: "Industrias Químicas SAC",
        ruc: "20567891234",
        address: "Jr. Industrial 789, Callao",
        type: "CLIENT",
        email: "info@indquimicas.com",
        contactPerson: "Lic. Ana Martínez",
        creditLine: 30000.0,
        paymentMethod: "Transferencia bancaria",
        startDate: new Date("2023-03-20"),
      },
      {
        name: "Constructora Lima S.A.",
        ruc: "20678912345",
        address: "Av. Construcción 321, Lima",
        type: "CLIENT",
        email: "ventas@constructoralima.com",
        contactPerson: "Arq. Luis Fernández",
        creditLine: 75000.0,
        paymentMethod: "Letra de cambio",
        startDate: new Date("2022-11-10"),
      },
      {
        name: "Equipos Científicos Perú",
        ruc: "20789123456",
        address: "Av. Ciencia 654, Lima",
        type: "PROVIDER",
        email: "ventas@equiposcientificos.pe",
        contactPerson: "Ing. Roberto Silva",
        creditLine: 0.0,
        paymentMethod: "Transferencia bancaria",
        startDate: new Date("2023-02-01"),
      },
      {
        name: "Servicios Ambientales Perú SAC",
        ruc: "20891234567",
        address: "Jr. Ambiental 987, Lima",
        type: "PROVIDER",
        email: "contacto@servambientales.pe",
        contactPerson: "Lic. Carmen Ruiz",
        creditLine: 0.0,
        paymentMethod: "Contado",
        startDate: new Date("2023-04-15"),
      },
    ],
  });

  // ================================
  // 6. EQUIPMENT
  // ================================
  console.log("🔧 Creating equipment...");

  await prisma.equipment.createMany({
    data: [
      {
        name: "Muestreador de Aire Portátil",
        type: "Muestreador",
        code: "MAP-001",
        description: "Muestreador de aire de alto volumen para partículas PM10 y PM2.5",
        status: "AVAILABLE",
        isCalibrated: true,
        calibrationDate: new Date("2024-09-15"),
        serialNumber: "SN-MAP-2024-001",
        observations: "En perfectas condiciones",
      },
      {
        name: "Sonómetro Digital Clase 1",
        type: "Medidor de Ruido",
        code: "SDC1-002",
        description: "Sonómetro digital profesional clase 1 con calibrador",
        status: "AVAILABLE",
        isCalibrated: true,
        calibrationDate: new Date("2024-08-20"),
        serialNumber: "SN-SDC1-2024-002",
        observations: "Incluye trípode y pantalla anti-viento",
      },
      {
        name: "Medidor Multiparamétrico de Agua",
        type: "Medidor de Calidad de Agua",
        code: "MMA-003",
        description: "Medidor portátil de pH, conductividad, OD, temperatura",
        status: "IN_USE",
        isCalibrated: true,
        calibrationDate: new Date("2024-09-01"),
        serialNumber: "SN-MMA-2024-003",
        observations: "Actualmente en campo - Proyecto Minera del Sur",
      },
      {
        name: "Luxómetro Digital",
        type: "Medidor de Iluminación",
        code: "LUX-004",
        description: "Medidor de iluminancia digital de alta precisión",
        status: "AVAILABLE",
        isCalibrated: true,
        calibrationDate: new Date("2024-07-10"),
        serialNumber: "SN-LUX-2024-004",
        observations: "Calibrado recientemente",
      },
      {
        name: "Anemómetro Digital",
        type: "Medidor Meteorológico",
        code: "ANE-005",
        description: "Anemómetro digital para velocidad y dirección del viento",
        status: "MAINTENANCE",
        isCalibrated: false,
        calibrationDate: new Date("2024-03-15"),
        serialNumber: "SN-ANE-2024-005",
        observations: "En mantenimiento preventivo - sensor a reemplazar",
      },
      {
        name: "GPS de Alta Precisión",
        type: "Equipo de Posicionamiento",
        code: "GPS-006",
        description: "GPS diferencial de alta precisión para georeferenciación",
        status: "AVAILABLE",
        isCalibrated: true,
        calibrationDate: new Date("2024-06-01"),
        serialNumber: "SN-GPS-2024-006",
        observations: "Incluye antena externa y base magnética",
      },
      {
        name: "Termohigrómetro Digital",
        type: "Medidor Climático",
        code: "THD-007",
        description: "Medidor de temperatura y humedad relativa",
        status: "AVAILABLE",
        isCalibrated: true,
        calibrationDate: new Date("2024-08-01"),
        serialNumber: "SN-THD-2024-007",
        observations: "Con memoria interna y conexión USB",
      },
      {
        name: "Espectrofotómetro UV-Vis",
        type: "Equipo de Laboratorio",
        code: "ESP-008",
        description: "Espectrofotómetro UV-Visible para análisis de agua",
        status: "AVAILABLE",
        isCalibrated: true,
        calibrationDate: new Date("2024-09-10"),
        serialNumber: "SN-ESP-2024-008",
        observations: "Con set de cubetas y estándares",
      },
    ],
  });

  console.log("✅ Complete seed finished successfully!");
  console.log(`
📊 Summary:
- Company: AMBIENTALPE S.A.C.
- Users: ${createdUsers.length} users (super admin, admin, manager, operator, viewer)
- Bank Accounts: 3 (2 PEN, 1 USD)
- Clients: 5 (3 clients, 2 providers)
- Equipment: 8 items
- Roles & Permissions: Complete RBAC system

🔐 Login Credentials (contraseñas simplificadas para desarrollo):
- Super Admin: superadmin@ambientalpe.com / SuperAdmin123
- Admin: admin@ambientalpe.com / Admin123
- Manager: gestor@ambientalpe.com / Gestor123
- Operator: operador@ambientalpe.com / Operador123
- Viewer: viewer@ambientalpe.com / Viewer123
  `);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
