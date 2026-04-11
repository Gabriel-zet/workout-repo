import type { Request, Response, NextFunction } from "express";
import { ZodError, ZodObject, type ZodRawShape } from "zod";
// No local imports here

export const validateRequest =
  (schema: ZodObject<ZodRawShape>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          error: "Validação falhou",
          details: formattedErrors,
        });
      }

      res.status(400).json({
        error: "Erro na validação",
      });
    }
  };