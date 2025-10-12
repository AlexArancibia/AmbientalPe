import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { CompanyType } from "@prisma/client";

export const clientRouter = router({
  // Get all clients with pagination
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(1000).default(10),
        search: z.string().optional(),
        type: z.nativeEnum(CompanyType).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, type } = input;
      const skip = (page - 1) * limit;

      const where: any = {
        deletedAt: null,
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { ruc: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      if (type) {
        where.type = type;
      }

      const [clients, total] = await Promise.all([
        ctx.db.client.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        ctx.db.client.count({ where }),
      ]);

      return {
        clients,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // Get client by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const client = await ctx.db.client.findUnique({
        where: { id: input.id },
      });

      if (!client || client.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      return client;
    }),

  // Create new client
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        ruc: z.string().min(11, "RUC must be at least 11 characters"),
        address: z.string().min(1, "Address is required"),
        type: z.nativeEnum(CompanyType),
        email: z.string().email("Invalid email"),
        contactPerson: z.string().optional(),
        creditLine: z.number().min(0).optional(),
        paymentMethod: z.string().optional(),
        startDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if RUC already exists
      const existingClient = await ctx.db.client.findUnique({
        where: { ruc: input.ruc },
      });

      if (existingClient) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A client with this RUC already exists",
        });
      }

      const client = await ctx.db.client.create({
        data: input,
      });

      return client;
    }),

  // Update client
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required").optional(),
        ruc: z.string().min(11, "RUC must be at least 11 characters").optional(),
        address: z.string().min(1, "Address is required").optional(),
        type: z.nativeEnum(CompanyType).optional(),
        email: z.string().email("Invalid email").optional(),
        contactPerson: z.string().optional(),
        creditLine: z.number().min(0).optional(),
        paymentMethod: z.string().optional(),
        startDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existingClient = await ctx.db.client.findUnique({
        where: { id },
      });

      if (!existingClient || existingClient.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      // Check if RUC is being changed and if it's already in use
      if (data.ruc && data.ruc !== existingClient.ruc) {
        const rucInUse = await ctx.db.client.findUnique({
          where: { ruc: data.ruc },
        });

        if (rucInUse) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A client with this RUC already exists",
          });
        }
      }

      const updatedClient = await ctx.db.client.update({
        where: { id },
        data,
      });

      return updatedClient;
    }),

  // Soft delete client
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const client = await ctx.db.client.findUnique({
        where: { id: input.id },
      });

      if (!client || client.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      // Soft delete
      await ctx.db.client.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });

      return { success: true };
    }),
});

