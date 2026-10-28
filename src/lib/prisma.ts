/**
 * SUTRA STUDIO — Database Client Singleton (Prisma + PostgreSQL)
 *
 * Provides lazy client instantiation with safe build-time fallback.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/sutrastudio";
    }
    if (!process.env.DIRECT_URL) {
      process.env.DIRECT_URL = process.env.DATABASE_URL;
    }
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = (client as any)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export default prisma;
