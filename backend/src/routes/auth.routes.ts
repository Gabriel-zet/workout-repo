import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authLimiter } from "../middlewares/rateLimiter";
import { ensureAuth } from "../middlewares/ensureAuth";
import { validateRequest } from "../middlewares/validateRequest";
import { refreshSchema, registerSchema, loginSchema } from "../schemas/auth.schema";

export const authRoutes = Router();

authRoutes.post("/login", authLimiter, validateRequest(loginSchema), authController.login); // Rota de login - não protegida por auth mas com rate limiter para evitar abusos

authRoutes.post("/logout", ensureAuth, authController.logout); // Rota de logout - protegida por auth, o user precisa estar autenticado para deslogar

authRoutes.post("/register", authLimiter, validateRequest(registerSchema), authController.register); // Rota de registro de usuário - não protegida por auth mas com rate limiter para evitar abusos

authRoutes.post("/refresh", validateRequest(refreshSchema), authController.refresh); // Rota de refresh token com validação do refresh token
