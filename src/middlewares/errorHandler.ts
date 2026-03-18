import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Zod validation
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      issues: err.issues,
    });
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // exemplo de tratamento específico para erro de violação de chave única
    if (err.code === "P2002") {
      return res.status(409).json({
        message: "Conflict",
        meta: err.meta,
      });
    }

    return res.status(400).json({
      message: "Database error",
      code: err.code,
    });
  }

  // Erro genérico
  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
}