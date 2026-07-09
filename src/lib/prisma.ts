import { PrismaClient } from '@prisma/client';
import { matchEventEmitter } from './eventEmitter';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  }).$extends({
    query: {
      match: {
        async update({ args, query }) {
          const result = await query(args);
          // Emit an event that this match was updated
          matchEventEmitter.emit(`matchUpdated:${result.id}`, result);
          return result;
        },
      },
    },
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
