import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";

export const purchaseOrderItemRouter = router({
  // Get all purchase order items for a specific purchase order
  getByPurchaseOrder: protectedProcedure
    .input(z.object({ purchaseOrderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.purchaseOrderItem.findMany({
        where: {
          purchaseOrderId: input.purchaseOrderId,
          deletedAt: null,
        },
        orderBy: { createdAt: "asc" },
      });

      return items;
    }),

  // Get purchase order item by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.purchaseOrderItem.findUnique({
        where: { id: input.id },
        include: {
          purchaseOrder: true,
        },
      });

      if (!item || item.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Purchase order item not found",
        });
      }

      return item;
    }),

  // Update purchase order item
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        code: z.string().min(1, "Code is required").optional(),
        name: z.string().min(1, "Name is required").optional(),
        description: z.string().min(1, "Description is required").optional(),
        quantity: z.number().min(1, "Quantity must be at least 1").optional(),
        unitPrice: z.number().min(0, "Unit price must be positive").optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existingItem = await ctx.db.purchaseOrderItem.findUnique({
        where: { id },
      });

      if (!existingItem || existingItem.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Purchase order item not found",
        });
      }

      const updatedItem = await ctx.db.purchaseOrderItem.update({
        where: { id },
        data,
      });

      return updatedItem;
    }),

  // Soft delete purchase order item
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.purchaseOrderItem.findUnique({
        where: { id: input.id },
      });

      if (!item || item.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Purchase order item not found",
        });
      }

      await ctx.db.purchaseOrderItem.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });

      return { success: true };
    }),
});

