import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;
// enable querying over fetch for edge environments (Vercel)
neonConfig.poolQueryViaFetch = true;

const connectionString = process.env.POSTGRES_PRISMA_URL;
if (!connectionString) {
  throw new Error('POSTGRES_PRISMA_URL is not defined');
}

const adapter = new PrismaNeon({ connectionString });

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prismaClientSingleton = () =>
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? [{ emit: 'event', level: 'query' }]
        : undefined,
  });

const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
