import { PrismaClient } from '@prisma/client';

import { logger } from './logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client with Pino logging
const prismaWithLogging = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

/**
 * Global Prisma client instance with logging configuration
 * Uses singleton pattern to prevent multiple instances in development
 */
export const prisma = globalForPrisma.prisma ?? prismaWithLogging;

// Set up Pino logging for Prisma events
if (!globalForPrisma.prisma) {
  prismaWithLogging.$on('query', e => {
    logger.debug({
      msg: 'Prisma query',
      prisma: {
        query: e.query,
        params: e.params,
        duration: e.duration,
        target: e.target,
      },
    });
  });

  prismaWithLogging.$on('error', e => {
    logger.error({
      msg: 'Prisma error',
      prisma: {
        target: e.target,
        timestamp: e.timestamp,
      },
    });
  });

  prismaWithLogging.$on('info', e => {
    logger.info({
      msg: 'Prisma info',
      prisma: {
        message: e.message,
        target: e.target,
        timestamp: e.timestamp,
      },
    });
  });

  prismaWithLogging.$on('warn', e => {
    logger.warn({
      msg: 'Prisma warning',
      prisma: {
        message: e.message,
        target: e.target,
        timestamp: e.timestamp,
      },
    });
  });
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
