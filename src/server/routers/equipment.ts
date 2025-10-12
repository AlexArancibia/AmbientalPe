import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";

export const equipmentRouter = router({
  // Get all equipment with pagination
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, status } = input;
      const skip = (page - 1) * limit;

      const where: any = {
        deletedAt: null,
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      if (status) {
        where.status = status;
      }

      const [equipment, total] = await Promise.all([
        ctx.db.equipment.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        ctx.db.equipment.count({ where }),
      ]);

      return {
        equipment,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // Get equipment by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const equipment = await ctx.db.equipment.findUnique({
        where: { id: input.id },
      });

      if (!equipment || equipment.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Equipment not found",
        });
      }

      return equipment;
    }),

  // Create new equipment
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        type: z.string().min(1, "Type is required"),
        code: z.string().min(1, "Code is required"),
        description: z.string().min(1, "Description is required"),
        components: z.any().optional(),
        status: z.string().min(1, "Status is required"),
        isCalibrated: z.boolean().optional(),
        calibrationDate: z.date().optional(),
        serialNumber: z.string().optional(),
        observations: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if code already exists
      const existingEquipment = await ctx.db.equipment.findUnique({
        where: { code: input.code },
      });

      if (existingEquipment) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Equipment with this code already exists",
        });
      }

      const equipment = await ctx.db.equipment.create({
        data: input,
      });

      return equipment;
    }),

  // Update equipment
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required").optional(),
        type: z.string().min(1, "Type is required").optional(),
        code: z.string().min(1, "Code is required").optional(),
        description: z.string().min(1, "Description is required").optional(),
        components: z.any().optional(),
        status: z.string().min(1, "Status is required").optional(),
        isCalibrated: z.boolean().optional(),
        calibrationDate: z.date().optional(),
        serialNumber: z.string().optional(),
        observations: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existingEquipment = await ctx.db.equipment.findUnique({
        where: { id },
      });

      if (!existingEquipment || existingEquipment.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Equipment not found",
        });
      }

      // Check if code is being changed and if it's already in use
      if (data.code && data.code !== existingEquipment.code) {
        const codeInUse = await ctx.db.equipment.findUnique({
          where: { code: data.code },
        });

        if (codeInUse) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Equipment with this code already exists",
          });
        }
      }

      const updatedEquipment = await ctx.db.equipment.update({
        where: { id },
        data,
      });

      return updatedEquipment;
    }),

  // Soft delete equipment
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const equipment = await ctx.db.equipment.findUnique({
        where: { id: input.id },
      });

      if (!equipment || equipment.deletedAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Equipment not found",
        });
      }

      // Soft delete
      await ctx.db.equipment.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });

      return { success: true };
    }),
});

