import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
// No local imports here

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Zod validation errors 
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      issues: err.issues,
    });
  }


  // JWT errors  - / / Validação já está acontecendo em ensureAuth, mas caso algo escape, a gente trata aqui
  if (err instanceof Error && (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") ) {
    return res.status(401).json({ message: "Invalid or expired token ?" });
  }


  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Tratamento específico para erro de violação de chave única 
    if (err.code === "P2002") {
      return res.status(409).json({
        message: "Conflict",
        meta: err.meta,
        code: err.code,
      });
    }


    // Registro não encontrado para update ou delete
    if(err.code === "P2025") {
      return res.status(404).json({
        message: "Record not found",
        meta: err.meta,
        code: err.code,
    });
  }

    // Erro genérico do prisma
      return res.status(400).json({
        message: "Database error",
        code: err.code,
    });
  }

  // Prisma errs(dados invalidos para o schema do prisma)

  // Campo invalido, tipo errado
  if(err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      message: "Database validation error",
    });
  }

  // prisma initialization error 
  if(err instanceof Prisma.PrismaClientInitializationError) {
    return res.status(500).json({
      message: "Database initialization error",
    });
  }

  if(err instanceof Prisma.PrismaClientRustPanicError) {
    return res.status(500).json({
      message: "Database panic error",
    });
  }

  // Erro genérico
  console.error(err);
    return res.status(500).json({ message: "Internal server error" });
}