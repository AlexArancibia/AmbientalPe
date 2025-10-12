import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";

export const quotationItemTemplateRouter = router({
  // Get all quotation item templates with pagination
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search } = input;
      const skip = (page - 1) * limit;

      const where: any = {
        deletedAt: null,
      };

      if (search) {
        where.OR = [
          { code: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const [items, total] = await Promise.all([
        ctx.db.quotationItemTemplate.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        ctx.db.quotationItemTemplate.count({ where }),
      ]);

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // Get quotation item template by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const template = await ctx.db.quotationItemTemplate.findUnique({
        where: { id: input.id },
      });

      if (!template || template.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quotation item template not found",
        });
      }

      return template;
    }),

  // Create new quotation item template
  create: protectedProcedure
    .input(
      z.object({
        code: z.string().min(1, "Code is required"),
        name: z.string().min(1, "Name is required"),
        description: z.string().min(1, "Description is required"),
        quantity: z.number().min(1, "Quantity must be at least 1").default(1),
        days: z.number().min(1, "Days must be at least 1").default(1),
        unitPrice: z.number().min(0, "Unit price must be positive"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if code already exists
      const existing = await ctx.db.quotationItemTemplate.findUnique({
        where: { code: input.code },
      });

      if (existing && !existing.deletedAt) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A template with this code already exists",
        });
      }

      const template = await ctx.db.quotationItemTemplate.create({
        data: input,
      });

      return template;
    }),

  // Update quotation item template
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        code: z.string().min(1, "Code is required").optional(),
        name: z.string().min(1, "Name is required").optional(),
        description: z.string().min(1, "Description is required").optional(),
        quantity: z.number().min(1, "Quantity must be at least 1").optional(),
        days: z.number().min(1, "Days must be at least 1").optional(),
        unitPrice: z.number().min(0, "Unit price must be positive").optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existingTemplate = await ctx.db.quotationItemTemplate.findUnique({
        where: { id },
      });

      if (!existingTemplate || existingTemplate.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quotation item template not found",
        });
      }

      // Check code uniqueness if updating code
      if (data.code && data.code !== existingTemplate.code) {
        const codeExists = await ctx.db.quotationItemTemplate.findUnique({
          where: { code: data.code },
        });

        if (codeExists && !codeExists.deletedAt) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A template with this code already exists",
          });
        }
      }

      const updatedTemplate = await ctx.db.quotationItemTemplate.update({
        where: { id },
        data,
      });

      return updatedTemplate;
    }),

  // Soft delete quotation item template
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const template = await ctx.db.quotationItemTemplate.findUnique({
        where: { id: input.id },
      });

      if (!template || template.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quotation item template not found",
        });
      }

      await ctx.db.quotationItemTemplate.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });

      return { success: true };
    }),
});

