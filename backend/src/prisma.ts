import { PrismaClient } from "@prisma/client";

// Eén gedeelde Prisma-instantie voor de hele backend.
export const prisma = new PrismaClient();
