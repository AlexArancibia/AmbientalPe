import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";

export const serviceOrderItemRouter = router({
  // Get all service order items for a specific service order
  getByServiceOrder: protectedProcedure
    .input(z.object({ serviceOrderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.serviceOrderItem.findMany({
        where: {
          serviceOrderId: input.serviceOrderId,
          deletedAt: null,
        },
        orderBy: { createdAt: "asc" },
      });

      return items;
    }),

  // Get service order item by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.serviceOrderItem.findUnique({
        where: { id: input.id },
        include: {
          serviceOrder: true,
        },
      });

      if (!item || item.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Service order item not found",
        });
      }

      return item;
    }),

  // Update service order item
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

      const existingItem = await ctx.db.serviceOrderItem.findUnique({
        where: { id },
      });

      if (!existingItem || existingItem.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Service order item not found",
        });
      }

      const updatedItem = await ctx.db.serviceOrderItem.update({
        where: { id },
        data,
      });

      return updatedItem;
    }),

  // Soft delete service order item
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.serviceOrderItem.findUnique({
        where: { id: input.id },
      });

      if (!item || item.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Service order item not found",
        });
      }

      await ctx.db.serviceOrderItem.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });

      return { success: true };
    }),
});
