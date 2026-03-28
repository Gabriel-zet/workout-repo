import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authLimiter } from "../middlewares/rateLimiter";
import { ensureAuth } from "../middlewares/ensureAuth";

export const authRoutes = Router();

authRoutes.post("/login", authLimiter, authController.login); // Rota de login - não protegida por auth mas com rate limiter para evitar abusos

authRoutes.post("/logout", ensureAuth, authController.logout); // Rota de logout - protegida por auth, o user precisa estar autenticado para deslogar

authRoutes.post("/register", authLimiter, authController.register); // Rota de registro de usuário - não protegida por auth mas com rate limiter para evitar abusos