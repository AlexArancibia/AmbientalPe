import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";

export const quotationItemRouter = router({
  // Get all quotation items for a specific quotation
  getByQuotation: protectedProcedure
    .input(z.object({ quotationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.quotationItem.findMany({
        where: {
          quotationId: input.quotationId,
          deletedAt: null,
        },
        orderBy: { createdAt: "asc" },
      });

      return items;
    }),

  // Get quotation item by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.quotationItem.findUnique({
        where: { id: input.id },
        include: {
          quotation: true,
        },
      });

      if (!item || item.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quotation item not found",
        });
      }

      return item;
    }),

  // Update quotation item
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        code: z.string().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        quantity: z.number().optional(),
        days: z.number().optional(),
        unitPrice: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existingItem = await ctx.db.quotationItem.findUnique({
        where: { id },
      });

      if (!existingItem || existingItem.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quotation item not found",
        });
      }

      const updatedItem = await ctx.db.quotationItem.update({
        where: { id },
        data,
      });

      return updatedItem;
    }),

  // Soft delete quotation item
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.quotationItem.findUnique({
        where: { id: input.id },
      });

      if (!item || item.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quotation item not found",
        });
      }

      await ctx.db.quotationItem.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });

      return { success: true };
    }),
});
