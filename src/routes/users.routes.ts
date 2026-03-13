import { Router } from "express";
import { usersController } from "../controllers/users.controller";


export const usersRoutes = Router();

// Rota de registro de usuário - não protegida por auth
usersRoutes.post("/register", usersController.create);

// ?? - essa rota deveria ser protegida por auth?
usersRoutes.get("/list", usersController.list);

// ADM TOOLS - ainda não protegido por auth
usersRoutes.get("/profile/:id", usersController.getById);
usersRoutes.delete("/delete/:id", usersController.remove); 