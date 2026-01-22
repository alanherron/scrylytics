import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prismaInstance: PrismaClient | null = null;

function getPrismaClient(): PrismaClient | null {
  if (prismaInstance) {
    return prismaInstance;
  }

  try {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
    
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prismaInstance;
    }
    
    return prismaInstance;
  } catch (error) {
    console.error('Failed to initialize Prisma Client:', error);
    return null;
  }
}

export const prisma: PrismaClient | null = globalForPrisma.prisma ?? getPrismaClient() ?? null;

