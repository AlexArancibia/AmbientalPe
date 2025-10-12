import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { generateNextServiceOrderNumber } from "@/lib/document-number-generator";

const serviceOrderItemSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  days: z.number().optional(),
  unitPrice: z.number().min(0, "Unit price must be positive"),
});

export const serviceOrderRouter = router({
  // Get all service orders with pagination
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

      const [serviceOrders, total] = await Promise.all([
        ctx.db.serviceOrder.findMany({
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
        ctx.db.serviceOrder.count({ where }),
      ]);

      return {
        serviceOrders,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // Get service order by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const serviceOrder = await ctx.db.serviceOrder.findUnique({
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

      if (!serviceOrder || serviceOrder.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Service order not found",
        });
      }

      return serviceOrder;
    }),

  // Create new service order
  create: protectedProcedure
    .input(
      z.object({
        number: z.string().min(1, "Number is required"),
        date: z.coerce.date(),
        clientId: z.string().min(1, "Client is required"),
        description: z.string().optional(),
        currency: z.string().min(1, "Currency is required"),
        paymentTerms: z.string().optional(),
        gestorId: z.string().min(1, "Gestor is required"),
        attendantName: z.string().optional(),
        comments: z.string().optional(),
        status: z.string().min(1, "Status is required"),
        items: z.array(serviceOrderItemSchema).min(1, "At least one item is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { items, ...orderData } = input;

      // Check if number already exists
      const existingOrder = await ctx.db.serviceOrder.findUnique({
        where: { number: input.number },
      });

      if (existingOrder) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A service order with this number already exists",
        });
      }

      // Calculate totals from items
      const subtotal = items.reduce(
        (sum, item) => {
          const days = item.days || 1;
          return sum + item.quantity * days * item.unitPrice;
        },
        0
      );

      const igv = subtotal * 0.18;
      const total = subtotal + igv;

      // Create service order with items
      const serviceOrder = await ctx.db.serviceOrder.create({
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

      return serviceOrder;
    }),

  // Update service order
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        number: z.string().optional(),
        date: z.coerce.date().optional(),
        clientId: z.string().optional(),
        description: z.string().optional(),
        currency: z.string().optional(),
        paymentTerms: z.string().optional(),
        gestorId: z.string().optional(),
        attendantName: z.string().optional(),
        comments: z.string().optional(),
        status: z.string().optional(),
        items: z.array(serviceOrderItemSchema).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, items, ...inputData } = input;

      const existingOrder = await ctx.db.serviceOrder.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!existingOrder || existingOrder.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Service order not found",
        });
      }

      // Prepare update data
      const data: any = { ...inputData };

      // If items are being updated, recalculate totals
      if (items) {
        const subtotal = items.reduce((sum, item) => {
          const days = item.days || 1;
          return sum + item.quantity * days * item.unitPrice;
        }, 0);
        const igv = subtotal * 0.18;
        const total = subtotal + igv;

        data.subtotal = subtotal;
        data.igv = igv;
        data.total = total;

        // Delete existing items and create new ones
        await ctx.db.serviceOrderItem.updateMany({
          where: { serviceOrderId: id },
          data: { deletedAt: new Date() },
        });

        await ctx.db.serviceOrderItem.createMany({
          data: items.map(({ id: _, ...item }) => ({
            ...item,
            serviceOrderId: id,
          })),
        });
      }

      const updatedOrder = await ctx.db.serviceOrder.update({
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

  // Soft delete service order
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const serviceOrder = await ctx.db.serviceOrder.findUnique({
        where: { id: input.id },
      });

      if (!serviceOrder || serviceOrder.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Service order not found",
        });
      }

      // Soft delete order and its items
      await ctx.db.serviceOrder.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });

      await ctx.db.serviceOrderItem.updateMany({
        where: { serviceOrderId: input.id },
        data: { deletedAt: new Date() },
      });

      return { success: true };
    }),

  // Get next service order number
  getNextNumber: protectedProcedure.query(async ({ ctx }) => {
    // Fetch last 10 service orders to get the pattern
    const recentOrders = await ctx.db.serviceOrder.findMany({
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
    const nextNumber = generateNextServiceOrderNumber(existingNumbers);

    return { nextNumber };
  }),
});

