import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authLimiter } from "../middlewares/rateLimiter";

export const authRoutes = Router();

authRoutes.post("/login", authLimiter, authController.login);

// Interessante trazer o register para o authRoutes, já que é a rota responsável por autenticação, e não tem nada a ver com usuários em si (que é o usersRoutes)