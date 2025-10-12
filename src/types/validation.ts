/**
 * Zod validation schemas using centralized enums
 * Reusable validation schemas for consistent validation across the app
 * AMBIENTALPE - Sistema de Gestión Ambiental
 */

import { z } from "zod";
import {
  COMPANY_TYPE,
  CURRENCY,
  EQUIPMENT_STATUS,
  LANGUAGE,
  ORDER_STATUS,
  PERMISSION_ACTION,
  PERMISSION_RESOURCE,
  THEME,
  USER_ROLE,
} from "./enums";

// ================================
// ENUM VALIDATION SCHEMAS
// ================================

// Company Type Schemas
export const companyTypeSchema = z.enum([
  COMPANY_TYPE.CLIENT,
  COMPANY_TYPE.PROVIDER,
]);

// Order Status Schemas
export const orderStatusSchema = z.enum([
  ORDER_STATUS.DRAFT,
  ORDER_STATUS.PENDING,
  ORDER_STATUS.APPROVED,
  ORDER_STATUS.IN_PROGRESS,
  ORDER_STATUS.COMPLETED,
  ORDER_STATUS.CANCELLED,
]);

// Equipment Status Schemas
export const equipmentStatusSchema = z.enum([
  EQUIPMENT_STATUS.AVAILABLE,
  EQUIPMENT_STATUS.IN_USE,
  EQUIPMENT_STATUS.MAINTENANCE,
  EQUIPMENT_STATUS.CALIBRATION,
  EQUIPMENT_STATUS.OUT_OF_SERVICE,
]);

// Currency Schemas
export const currencySchema = z.enum([
  CURRENCY.PEN,
  CURRENCY.USD,
  CURRENCY.EUR,
]);

// User Role Schemas
export const userRoleSchema = z.enum([
  USER_ROLE.SUPER_ADMIN,
  USER_ROLE.ADMIN,
  USER_ROLE.MANAGER,
  USER_ROLE.OPERATOR,
  USER_ROLE.VIEWER,
]);

// Language Schemas
export const languageSchema = z.enum([
  LANGUAGE.EN,
  LANGUAGE.ES,
  LANGUAGE.PT,
]);

// Theme Schemas
export const themeSchema = z.enum([
  THEME.LIGHT,
  THEME.DARK,
  THEME.AUTO,
]);

// Permission Action Schemas
export const permissionActionSchema = z.enum([
  PERMISSION_ACTION.CREATE,
  PERMISSION_ACTION.READ,
  PERMISSION_ACTION.UPDATE,
  PERMISSION_ACTION.DELETE,
  PERMISSION_ACTION.MANAGE,
]);

// Permission Resource Schemas
export const permissionResourceSchema = z.enum([
  PERMISSION_RESOURCE.USER,
  PERMISSION_RESOURCE.ROLE,
  PERMISSION_RESOURCE.PERMISSION,
  PERMISSION_RESOURCE.CLIENT,
  PERMISSION_RESOURCE.EQUIPMENT,
  PERMISSION_RESOURCE.QUOTATION,
  PERMISSION_RESOURCE.SERVICE_ORDER,
  PERMISSION_RESOURCE.PURCHASE_ORDER,
  PERMISSION_RESOURCE.COMPANY,
  PERMISSION_RESOURCE.DASHBOARD,
  PERMISSION_RESOURCE.ADMIN,
]);

// ================================
// COMMON VALIDATION SCHEMAS
// ================================

// Number schemas
export const positiveNumberSchema = z.number().positive();
export const nonNegativeNumberSchema = z.number().min(0);
export const percentageSchema = z.number().min(0).max(100);

// String schemas
export const requiredStringSchema = z.string().min(1, "Campo requerido");
export const optionalStringSchema = z.string().optional();
export const emailSchema = z.string().email("Email inválido");
export const passwordSchema = z.string().min(8, "La contraseña debe tener al menos 8 caracteres");
export const phoneSchema = z.string().regex(/^\+?[\d\s\-()]+$/, "Teléfono inválido");
export const rucSchema = z.string().regex(/^\d{11}$/, "RUC debe tener 11 dígitos");

// Date validation schemas
export const dateSchema = z
  .string()
  .refine((str) => !Number.isNaN(Date.parse(str)), {
    message: "Formato de fecha inválido",
  })
  .transform((str) => new Date(str));

export const optionalDateSchema = z
  .string()
  .refine((str) => !Number.isNaN(Date.parse(str)), {
    message: "Formato de fecha inválido",
  })
  .transform((str) => new Date(str))
  .optional();

// ================================
// BUSINESS VALIDATION SCHEMAS
// ================================

// Client/Provider Schemas
export const clientCreateSchema = z.object({
  name: requiredStringSchema,
  ruc: rucSchema,
  address: requiredStringSchema,
  type: companyTypeSchema,
  email: emailSchema,
  contactPerson: optionalStringSchema,
  creditLine: nonNegativeNumberSchema.optional(),
  paymentMethod: optionalStringSchema,
  startDate: optionalDateSchema,
});

export const clientUpdateSchema = z.object({
  id: requiredStringSchema,
  name: requiredStringSchema.optional(),
  address: requiredStringSchema.optional(),
  email: emailSchema.optional(),
  contactPerson: optionalStringSchema,
  creditLine: nonNegativeNumberSchema.optional(),
  paymentMethod: optionalStringSchema,
  startDate: optionalDateSchema,
});

// Equipment Schemas
export const equipmentCreateSchema = z.object({
  name: requiredStringSchema,
  type: requiredStringSchema,
  code: requiredStringSchema,
  description: requiredStringSchema,
  components: z.any().optional(), // JSON field
  status: equipmentStatusSchema,
  isCalibrated: z.boolean().optional(),
  calibrationDate: optionalDateSchema,
  serialNumber: optionalStringSchema,
  observations: optionalStringSchema,
});

export const equipmentUpdateSchema = z.object({
  id: requiredStringSchema,
  name: requiredStringSchema.optional(),
  type: requiredStringSchema.optional(),
  description: requiredStringSchema.optional(),
  components: z.any().optional(),
  status: equipmentStatusSchema.optional(),
  isCalibrated: z.boolean().optional(),
  calibrationDate: optionalDateSchema,
  serialNumber: optionalStringSchema,
  observations: optionalStringSchema,
});

// Quotation Item Schema
export const quotationItemSchema = z.object({
  code: requiredStringSchema,
  name: requiredStringSchema,
  description: requiredStringSchema,
  quantity: z.number().int().positive(),
  days: z.number().int().positive(),
  unitPrice: positiveNumberSchema,
});

// Quotation Schemas
export const quotationCreateSchema = z.object({
  clientId: requiredStringSchema,
  currency: currencySchema,
  equipmentReleaseDate: dateSchema,
  validityDays: z.number().int().positive(),
  considerDays: z.number().int().positive().optional(),
  returnDate: optionalDateSchema,
  monitoringLocation: optionalStringSchema,
  creditLine: nonNegativeNumberSchema.optional(),
  notes: optionalStringSchema,
  items: z.array(quotationItemSchema).min(1, "Debe agregar al menos un item"),
});

export const quotationUpdateSchema = z.object({
  id: requiredStringSchema,
  clientId: requiredStringSchema.optional(),
  currency: currencySchema.optional(),
  equipmentReleaseDate: dateSchema.optional(),
  validityDays: z.number().int().positive().optional(),
  status: orderStatusSchema.optional(),
  considerDays: z.number().int().positive().optional(),
  returnDate: optionalDateSchema,
  monitoringLocation: optionalStringSchema,
  creditLine: nonNegativeNumberSchema.optional(),
  notes: optionalStringSchema,
  items: z.array(quotationItemSchema).optional(),
});

// Service Order Item Schema
export const serviceOrderItemSchema = z.object({
  code: requiredStringSchema,
  name: requiredStringSchema,
  description: requiredStringSchema,
  quantity: z.number().int().positive(),
  days: z.number().int().positive().optional(),
  unitPrice: positiveNumberSchema,
});

// Service Order Schemas
export const serviceOrderCreateSchema = z.object({
  clientId: requiredStringSchema,
  description: optionalStringSchema,
  currency: currencySchema,
  paymentTerms: optionalStringSchema,
  gestorId: requiredStringSchema,
  attendantName: optionalStringSchema,
  comments: optionalStringSchema,
  items: z.array(serviceOrderItemSchema).min(1, "Debe agregar al menos un item"),
});

export const serviceOrderUpdateSchema = z.object({
  id: requiredStringSchema,
  clientId: requiredStringSchema.optional(),
  description: optionalStringSchema,
  currency: currencySchema.optional(),
  paymentTerms: optionalStringSchema,
  gestorId: requiredStringSchema.optional(),
  attendantName: optionalStringSchema,
  status: orderStatusSchema.optional(),
  comments: optionalStringSchema,
  items: z.array(serviceOrderItemSchema).optional(),
});

// Purchase Order Item Schema
export const purchaseOrderItemSchema = z.object({
  code: requiredStringSchema,
  name: requiredStringSchema,
  description: requiredStringSchema,
  quantity: z.number().int().positive(),
  unitPrice: positiveNumberSchema,
});

// Purchase Order Schemas
export const purchaseOrderCreateSchema = z.object({
  clientId: requiredStringSchema,
  description: optionalStringSchema,
  currency: currencySchema,
  paymentTerms: optionalStringSchema,
  gestorId: requiredStringSchema,
  attendantName: optionalStringSchema,
  comments: optionalStringSchema,
  items: z.array(purchaseOrderItemSchema).min(1, "Debe agregar al menos un item"),
});

export const purchaseOrderUpdateSchema = z.object({
  id: requiredStringSchema,
  clientId: requiredStringSchema.optional(),
  description: optionalStringSchema,
  currency: currencySchema.optional(),
  paymentTerms: optionalStringSchema,
  gestorId: requiredStringSchema.optional(),
  attendantName: optionalStringSchema,
  status: orderStatusSchema.optional(),
  comments: optionalStringSchema,
  items: z.array(purchaseOrderItemSchema).optional(),
});

// User Schemas
export const userCreateSchema = z.object({
  name: requiredStringSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  language: languageSchema.default(LANGUAGE.ES),
  position: optionalStringSchema,
  department: optionalStringSchema,
  role: optionalStringSchema,
});

export const userUpdateSchema = z.object({
  id: requiredStringSchema,
  name: requiredStringSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  language: languageSchema.optional(),
  position: optionalStringSchema,
  department: optionalStringSchema,
  role: optionalStringSchema,
});

// Company Schemas
export const companyCreateSchema = z.object({
  name: requiredStringSchema,
  ruc: rucSchema,
  address: requiredStringSchema,
  email: emailSchema,
  phone: phoneSchema,
  logo: optionalStringSchema,
});

export const companyUpdateSchema = z.object({
  id: requiredStringSchema,
  name: requiredStringSchema.optional(),
  address: requiredStringSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  logo: optionalStringSchema,
});

// Bank Account Schemas
export const bankAccountSchema = z.object({
  bankName: requiredStringSchema,
  accountNumber: requiredStringSchema,
  accountType: requiredStringSchema,
  currency: currencySchema,
  isDefault: z.boolean().default(false),
});

// Item Template Schemas (for reusable items)
export const itemTemplateCreateSchema = z.object({
  code: requiredStringSchema,
  name: requiredStringSchema,
  description: requiredStringSchema,
  quantity: z.number().int().positive().default(1),
  days: z.number().int().positive().optional(),
  unitPrice: positiveNumberSchema,
});

export const itemTemplateUpdateSchema = z.object({
  id: requiredStringSchema,
  code: requiredStringSchema.optional(),
  name: requiredStringSchema.optional(),
  description: requiredStringSchema.optional(),
  quantity: z.number().int().positive().optional(),
  days: z.number().int().positive().optional(),
  unitPrice: positiveNumberSchema.optional(),
});
