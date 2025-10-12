/**
 * Type-safe enums and constants for AMBIENTALPE
 * Centralized management of all enum values and their types
 */

// Company Type Enum
export const COMPANY_TYPE = {
  CLIENT: "CLIENT",
  PROVIDER: "PROVIDER",
} as const;

// Order Status Enum
export const ORDER_STATUS = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

// Equipment Status Enum
export const EQUIPMENT_STATUS = {
  AVAILABLE: "AVAILABLE",
  IN_USE: "IN_USE",
  MAINTENANCE: "MAINTENANCE",
  CALIBRATION: "CALIBRATION",
  OUT_OF_SERVICE: "OUT_OF_SERVICE",
} as const;

// Currency Enum
export const CURRENCY = {
  PEN: "PEN", // Soles Peruanos
  USD: "USD", // Dólares
  EUR: "EUR", // Euros
} as const;

// User Role Enum (System roles)
export const USER_ROLE = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager", // Gestor
  OPERATOR: "operator", // Operador
  VIEWER: "viewer",
} as const;

// Language Enum
export const LANGUAGE = {
  EN: "EN",
  ES: "ES",
  PT: "PT",
} as const;

// Theme Enum
export const THEME = {
  LIGHT: "LIGHT",
  DARK: "DARK",
  AUTO: "AUTO",
} as const;

// Permission Action Enum
export const PERMISSION_ACTION = {
  CREATE: "CREATE",
  READ: "READ",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  MANAGE: "MANAGE",
} as const;

// Permission Resource Enum
export const PERMISSION_RESOURCE = {
  USER: "USER",
  ROLE: "ROLE",
  PERMISSION: "PERMISSION",
  CLIENT: "CLIENT",
  EQUIPMENT: "EQUIPMENT",
  QUOTATION: "QUOTATION",
  SERVICE_ORDER: "SERVICE_ORDER",
  PURCHASE_ORDER: "PURCHASE_ORDER",
  COMPANY: "COMPANY",
  DASHBOARD: "DASHBOARD",
  ADMIN: "ADMIN",
} as const;

// Type definitions derived from the constants
export type CompanyType = (typeof COMPANY_TYPE)[keyof typeof COMPANY_TYPE];
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
export type EquipmentStatus = (typeof EQUIPMENT_STATUS)[keyof typeof EQUIPMENT_STATUS];
export type Currency = (typeof CURRENCY)[keyof typeof CURRENCY];
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
export type Language = (typeof LANGUAGE)[keyof typeof LANGUAGE];
export type Theme = (typeof THEME)[keyof typeof THEME];
export type PermissionAction = (typeof PERMISSION_ACTION)[keyof typeof PERMISSION_ACTION];
export type PermissionResource = (typeof PERMISSION_RESOURCE)[keyof typeof PERMISSION_RESOURCE];

// Helper functions for validation
export const isValidCompanyType = (type: string): type is CompanyType => {
  return Object.values(COMPANY_TYPE).includes(type as CompanyType);
};

export const isValidOrderStatus = (status: string): status is OrderStatus => {
  return Object.values(ORDER_STATUS).includes(status as OrderStatus);
};

export const isValidEquipmentStatus = (status: string): status is EquipmentStatus => {
  return Object.values(EQUIPMENT_STATUS).includes(status as EquipmentStatus);
};

export const isValidCurrency = (currency: string): currency is Currency => {
  return Object.values(CURRENCY).includes(currency as Currency);
};

export const isValidUserRole = (role: string): role is UserRole => {
  return Object.values(USER_ROLE).includes(role as UserRole);
};

export const isValidLanguage = (lang: string): lang is Language => {
  return Object.values(LANGUAGE).includes(lang as Language);
};

export const isValidTheme = (theme: string): theme is Theme => {
  return Object.values(THEME).includes(theme as Theme);
};

export const isValidPermissionAction = (action: string): action is PermissionAction => {
  return Object.values(PERMISSION_ACTION).includes(action as PermissionAction);
};

export const isValidPermissionResource = (resource: string): resource is PermissionResource => {
  return Object.values(PERMISSION_RESOURCE).includes(resource as PermissionResource);
};
