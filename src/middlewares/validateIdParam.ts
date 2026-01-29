import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

// Schema para validar o parâmetro :id da rota
// - deve ser uma string
// - deve ter pelo menos 1 caractere (não pode ser vazio)
// - mensagem personalizada caso falhe 
const idSchema = z.string().min(1, "Invalid id parameter");

// Middleware de validação do parâmetro de rota id
// Ex.: GET /workouts/:id, PATCH /workouts/:id, DELETE /workouts/:id
export function validateIdParam(req: Request, res: Response, next: NextFunction) {
  // safeParse valida sem lançar exceção:
  // - se der certo: { success: true, data: ... }
  // - se der errado: { success: false, error: ... }
  const parsed = idSchema.safeParse(req.params.id);

  // Se a validação falhar, responde 400 com detalhes do erro
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid id parameter",
      issues: parsed.error.issues, // lista de problemas (ex.: min length, tipo inválido, etc.)
    });
  }

  // Se passou, garante que `req.params.id` é a string validada
  req.params.id = parsed.data;

  // Continua para o próximo middleware/handler da rota
  next();
}