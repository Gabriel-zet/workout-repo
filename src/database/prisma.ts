import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// Exporta uma instancia do Prisma para ser usada em toda a aplicação