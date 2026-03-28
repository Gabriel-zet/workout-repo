import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authLimiter } from "../middlewares/rateLimiter";
import { ensureAuth } from "../middlewares/ensureAuth";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import { validateRequest } from "../middlewares/validateRequest";

export const authRoutes = Router();


// Protegida por auth e com validação de dados
authRoutes.post("/login", authLimiter, validateRequest(loginSchema), authController.login); 

authRoutes.post("/logout", ensureAuth, authController.logout); // Rota de logout - protegida por auth, o user precisa estar autenticado para deslogar

// Rota de registro - protegida por rate limiter e validação de dados
authRoutes.post("/register", authLimiter, validateRequest(registerSchema), authController.register); 