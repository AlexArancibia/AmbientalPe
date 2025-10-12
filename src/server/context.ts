import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { initTRPC } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";

export interface Context {
  user?: {
    id: string;
    email: string;
    name: string;
  };
  db: PrismaClient;
  rbac?: unknown;
}

export const createContext = async (opts: {
  req: Request;
}): Promise<Context> => {
  try {
    // Get session from Better Auth using cookies
    const session = await auth.api.getSession({
      headers: opts.req.headers,
    });

    if (!session?.user) {
      return {
        db: prisma,
      };
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
      db: prisma,
    };
  } catch (_error) {
    return {
      db: prisma,
    };
  }
};

export const t = initTRPC.context<Context>().create();
