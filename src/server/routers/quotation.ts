import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { generateNextQuotationNumber } from "@/lib/document-number-generator";

const quotationItemSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  days: z.number().min(1, "Days must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
});

export const quotationRouter = router({
  // Get all quotations with pagination
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        status: z.string().optional(),
        clientId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, status, clientId } = input;
      const skip = (page - 1) * limit;

      const where: any = {
        deletedAt: null,
      };

      if (search) {
        where.OR = [
          { number: { contains: search, mode: "insensitive" } },
          { notes: { contains: search, mode: "insensitive" } },
        ];
      }

      if (status) {
        where.status = status;
      }

      if (clientId) {
        where.clientId = clientId;
      }

      const [quotations, total] = await Promise.all([
        ctx.db.quotation.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            client: true,
            items: {
              where: { deletedAt: null },
            },
          },
        }),
        ctx.db.quotation.count({ where }),
      ]);

      return {
        quotations,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // Get quotation by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const quotation = await ctx.db.quotation.findUnique({
        where: { id: input.id },
        include: {
          client: true,
          items: {
            where: { deletedAt: null },
          },
        },
      });

      if (!quotation || quotation.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quotation not found",
        });
      }

      return quotation;
    }),

  // Create new quotation
  create: protectedProcedure
    .input(
      z.object({
        number: z.string().min(1, "Number is required"),
        date: z.coerce.date(),
        clientId: z.string().min(1, "Client is required"),
        currency: z.string().min(1, "Currency is required"),
        equipmentReleaseDate: z.coerce.date(),
        validityDays: z.number().min(1),
        status: z.string().min(1, "Status is required"),
        notes: z.string().optional(),
        considerDays: z.number().optional(),
        returnDate: z.coerce.date().optional(),
        monitoringLocation: z.string().optional(),
        creditLine: z.number().optional(),
        items: z.array(quotationItemSchema).min(1, "At least one item is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { items, ...quotationData } = input;

      // Check if number already exists
      const existingQuotation = await ctx.db.quotation.findUnique({
        where: { number: input.number },
      });

      if (existingQuotation) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A quotation with this number already exists",
        });
      }

      // Calculate totals from items
      const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.days * item.unitPrice,
        0
      );

      const igv = subtotal * 0.18;
      const total = subtotal + igv;

      // Create quotation with items
      const quotation = await ctx.db.quotation.create({
        data: {
          ...quotationData,
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
        },
      });

      return quotation;
    }),

  // Update quotation
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        number: z.string().optional(),
        date: z.coerce.date().optional(),
        clientId: z.string().optional(),
        currency: z.string().optional(),
        equipmentReleaseDate: z.coerce.date().optional(),
        validityDays: z.number().optional(),
        status: z.string().optional(),
        notes: z.string().optional(),
        considerDays: z.number().optional(),
        returnDate: z.coerce.date().optional(),
        monitoringLocation: z.string().optional(),
        creditLine: z.number().optional(),
        items: z.array(quotationItemSchema).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, items, ...inputData } = input;

      const existingQuotation = await ctx.db.quotation.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!existingQuotation || existingQuotation.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quotation not found",
        });
      }

      // Prepare update data
      const data: any = { ...inputData };

      // If items are being updated, recalculate totals
      if (items) {
        const subtotal = items.reduce(
          (sum, item) => sum + item.quantity * item.days * item.unitPrice,
          0
        );
        const igv = subtotal * 0.18;
        const total = subtotal + igv;

        data.subtotal = subtotal;
        data.igv = igv;
        data.total = total;

        // Delete existing items and create new ones
        await ctx.db.quotationItem.updateMany({
          where: { quotationId: id },
          data: { deletedAt: new Date() },
        });

        await ctx.db.quotationItem.createMany({
          data: items.map(({ id: _, ...item }) => ({
            ...item,
            quotationId: id,
          })),
        });
      }

      const updatedQuotation = await ctx.db.quotation.update({
        where: { id },
        data,
        include: {
          items: {
            where: { deletedAt: null },
          },
          client: true,
        },
      });

      return updatedQuotation;
    }),

  // Soft delete quotation
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const quotation = await ctx.db.quotation.findUnique({
        where: { id: input.id },
      });

      if (!quotation || quotation.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quotation not found",
        });
      }

      // Soft delete quotation and its items
      await ctx.db.quotation.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });

      await ctx.db.quotationItem.updateMany({
        where: { quotationId: input.id },
        data: { deletedAt: new Date() },
      });

      return { success: true };
    }),

  // Get next quotation number
  getNextNumber: protectedProcedure.query(async ({ ctx }) => {
    // Fetch last 10 quotations to get the pattern
    const recentQuotations = await ctx.db.quotation.findMany({
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

    const existingNumbers = recentQuotations.map((q) => q.number);
    const nextNumber = generateNextQuotationNumber(existingNumbers);

    return { nextNumber };
  }),
});

