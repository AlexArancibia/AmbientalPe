import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { generateNextPurchaseOrderNumber } from "@/lib/document-number-generator";

const purchaseOrderItemSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
});

export const purchaseOrderRouter = router({
  // Get all purchase orders with pagination
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        status: z.string().optional(),
        clientId: z.string().optional(),
        gestorId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, status, clientId, gestorId } = input;
      const skip = (page - 1) * limit;

      const where: any = {
        deletedAt: null,
      };

      if (search) {
        where.OR = [
          { number: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { comments: { contains: search, mode: "insensitive" } },
        ];
      }

      if (status) {
        where.status = status;
      }

      if (clientId) {
        where.clientId = clientId;
      }

      if (gestorId) {
        where.gestorId = gestorId;
      }

      const [purchaseOrders, total] = await Promise.all([
        ctx.db.purchaseOrder.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            client: true,
            gestor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            items: {
              where: { deletedAt: null },
            },
          },
        }),
        ctx.db.purchaseOrder.count({ where }),
      ]);

      return {
        purchaseOrders,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // Get purchase order by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const purchaseOrder = await ctx.db.purchaseOrder.findUnique({
        where: { id: input.id },
        include: {
          client: true,
          gestor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            where: { deletedAt: null },
          },
        },
      });

      if (!purchaseOrder || purchaseOrder.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Purchase order not found",
        });
      }

      return purchaseOrder;
    }),

  // Create new purchase order
  create: protectedProcedure
    .input(
      z.object({
        number: z.string().min(1, "Number is required"),
        date: z.date(),
        clientId: z.string().min(1, "Provider is required"),
        description: z.string().optional(),
        currency: z.string().min(1, "Currency is required"),
        paymentTerms: z.string().optional(),
        gestorId: z.string().min(1, "Gestor is required"),
        attendantName: z.string().optional(),
        comments: z.string().optional(),
        status: z.string().min(1, "Status is required"),
        items: z.array(purchaseOrderItemSchema).min(1, "At least one item is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { items, ...orderData } = input;

      // Calculate totals
      const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      const igv = subtotal * 0.18;
      const total = subtotal + igv;

      // Check if number already exists
      const existingOrder = await ctx.db.purchaseOrder.findUnique({
        where: { number: input.number },
      });

      if (existingOrder) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A purchase order with this number already exists",
        });
      }

      const purchaseOrder = await ctx.db.purchaseOrder.create({
        data: {
          ...orderData,
          subtotal,
          igv,
          total,
          items: {
            create: items.map(({ id, ...item }) => item),
          },
        },
        include: {
          items: true,
          client: true,
          gestor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return purchaseOrder;
    }),

  // Update purchase order
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        number: z.string().optional(),
        date: z.date().optional(),
        clientId: z.string().optional(),
        description: z.string().optional(),
        currency: z.string().optional(),
        paymentTerms: z.string().optional(),
        gestorId: z.string().optional(),
        attendantName: z.string().optional(),
        comments: z.string().optional(),
        status: z.string().optional(),
        items: z.array(purchaseOrderItemSchema).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, items, ...restData } = input;

      const existingOrder = await ctx.db.purchaseOrder.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!existingOrder || existingOrder.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Purchase order not found",
        });
      }

      // Prepare update data
      let data: typeof restData & { subtotal?: number; igv?: number; total?: number } = { ...restData };

      // If items are being updated, recalculate totals
      if (items) {
        const subtotal = items.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice,
          0
        );
        const igv = subtotal * 0.18;
        const total = subtotal + igv;

        data.subtotal = subtotal;
        data.igv = igv;
        data.total = total;

        // Delete existing items and create new ones
        await ctx.db.purchaseOrderItem.updateMany({
          where: { purchaseOrderId: id },
          data: { deletedAt: new Date() },
        });

        await ctx.db.purchaseOrderItem.createMany({
          data: items.map(({ id: _, ...item }) => ({
            ...item,
            purchaseOrderId: id,
          })),
        });
      }

      const updatedOrder = await ctx.db.purchaseOrder.update({
        where: { id },
        data,
        include: {
          items: {
            where: { deletedAt: null },
          },
          client: true,
          gestor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return updatedOrder;
    }),

  // Soft delete purchase order
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const purchaseOrder = await ctx.db.purchaseOrder.findUnique({
        where: { id: input.id },
      });

      if (!purchaseOrder || purchaseOrder.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Purchase order not found",
        });
      }

      // Soft delete order and its items
      await ctx.db.purchaseOrder.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });

      await ctx.db.purchaseOrderItem.updateMany({
        where: { purchaseOrderId: input.id },
        data: { deletedAt: new Date() },
      });

      return { success: true };
    }),

  // Get next purchase order number
  getNextNumber: protectedProcedure.query(async ({ ctx }) => {
    // Fetch last 10 purchase orders to get the pattern
    const recentOrders = await ctx.db.purchaseOrder.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        number: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    const existingNumbers = recentOrders.map((o) => o.number);
    const nextNumber = generateNextPurchaseOrderNumber(existingNumbers);

    return { nextNumber };
  }),
});

