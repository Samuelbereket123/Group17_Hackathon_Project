const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined
}

export const prisma = globalForPrisma.prisma ?? (async () => {
  const { PrismaClient } = await import('@prisma/client') as any;
  return new PrismaClient();
})();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 