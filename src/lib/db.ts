import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const primsa = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = primsa;

export default primsa;