import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString =
  process.env.POSTGRES_PRISMA_URL ?? process.env.DATABASE_URL;

if (!connectionString || typeof connectionString !== "string") {
  throw new Error(
    "DATABASE_URL/POSTGRES_PRISMA_URL não está definido ou não é uma string."
  );
}

const adapter = new PrismaNeon({ connectionString });

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export default prisma;