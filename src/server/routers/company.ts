import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";

export const companyRouter = router({
  // Get company information
  get: protectedProcedure.query(async ({ ctx }) => {
    const company = await ctx.db.company.findFirst({
      include: {
        bankAccounts: true,
      },
    });

    if (!company) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Company information not found",
      });
    }

    return company;
  }),

  // Create company information
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        ruc: z.string().min(11, "RUC must be at least 11 characters"),
        address: z.string().min(1, "Address is required"),
        email: z.string().email("Invalid email"),
        phone: z.string().min(1, "Phone is required"),
        logo: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if RUC already exists
      const existingCompany = await ctx.db.company.findUnique({
        where: { ruc: input.ruc },
      });

      if (existingCompany) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A company with this RUC already exists",
        });
      }

      const company = await ctx.db.company.create({
        data: input,
        include: {
          bankAccounts: true,
        },
      });

      return company;
    }),

  // Update company information
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required").optional(),
        ruc: z.string().min(11, "RUC must be at least 11 characters").optional(),
        address: z.string().min(1, "Address is required").optional(),
        email: z.string().email("Invalid email").optional(),
        phone: z.string().min(1, "Phone is required").optional(),
        logo: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existingCompany = await ctx.db.company.findUnique({
        where: { id },
      });

      if (!existingCompany) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }

      // Check if RUC is being changed and if it's already in use
      if (data.ruc && data.ruc !== existingCompany.ruc) {
        const rucInUse = await ctx.db.company.findUnique({
          where: { ruc: data.ruc },
        });

        if (rucInUse) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A company with this RUC already exists",
          });
        }
      }

      const updatedCompany = await ctx.db.company.update({
        where: { id },
        data,
        include: {
          bankAccounts: true,
        },
      });

      return updatedCompany;
    }),

  // Bank Account operations
  bankAccount: router({
    // Get all bank accounts for a company
    getAll: protectedProcedure
      .input(z.object({ companyId: z.string() }))
      .query(async ({ ctx, input }) => {
        const bankAccounts = await ctx.db.bankAccount.findMany({
          where: { companyId: input.companyId },
        });

        return bankAccounts;
      }),

    // Create bank account
    create: protectedProcedure
      .input(
        z.object({
          companyId: z.string(),
          bankName: z.string().min(1, "Bank name is required"),
          accountNumber: z.string().min(1, "Account number is required"),
          accountType: z.string().min(1, "Account type is required"),
          currency: z.string().min(1, "Currency is required"),
          isDefault: z.boolean().default(false),
          isDetraction: z.boolean().default(false),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // If this is set as default, unset other defaults
        if (input.isDefault) {
          await ctx.db.bankAccount.updateMany({
            where: {
              companyId: input.companyId,
              isDefault: true,
            },
            data: { isDefault: false },
          });
        }

        if (input.isDetraction) {
          await ctx.db.bankAccount.updateMany({
            where: {
              companyId: input.companyId,
              isDetraction: true,
            },
            data: { isDetraction: false },
          });
        }

        const data = input.isDetraction
          ? {
              ...input,
              accountType: "DETRACCION",
            }
          : input;

        const bankAccount = await ctx.db.bankAccount.create({
          data,
        });

        return bankAccount;
      }),

    // Update bank account
    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          bankName: z.string().min(1, "Bank name is required").optional(),
          accountNumber: z.string().min(1, "Account number is required").optional(),
          accountType: z.string().min(1, "Account type is required").optional(),
          currency: z.string().min(1, "Currency is required").optional(),
          isDefault: z.boolean().optional(),
          isDetraction: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;

        const existingAccount = await ctx.db.bankAccount.findUnique({
          where: { id },
        });

        if (!existingAccount) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Bank account not found",
          });
        }

        // If this is set as default, unset other defaults
        if (data.isDefault) {
          await ctx.db.bankAccount.updateMany({
            where: {
              companyId: existingAccount.companyId,
              isDefault: true,
              id: { not: id },
            },
            data: { isDefault: false },
          });
        }

        if (data.isDetraction) {
          await ctx.db.bankAccount.updateMany({
            where: {
              companyId: existingAccount.companyId,
              isDetraction: true,
              id: { not: id },
            },
            data: { isDetraction: false },
          });
        }

        const updateData =
          data.isDetraction === true
            ? {
                ...data,
                accountType: "DETRACCION",
              }
            : data;

        const updatedAccount = await ctx.db.bankAccount.update({
          where: { id },
          data: updateData,
        });

        return updatedAccount;
      }),

    // Delete bank account
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const bankAccount = await ctx.db.bankAccount.findUnique({
          where: { id: input.id },
        });

        if (!bankAccount) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Bank account not found",
          });
        }

        await ctx.db.bankAccount.delete({
          where: { id: input.id },
        });

        return { success: true };
      }),
  }),
});

