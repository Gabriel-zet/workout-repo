import { Router } from "express";
import { usersController } from "../controllers/users.controller";


export const usersRoutes = Router();

// Rota foi passada para authRoutes, já que é mais relacionado a autenticação do que a usuários em si --- IGNORE ---
// usersRoutes.post("/register", usersController.create); 

// ?? - essa rota deveria ser protegida por auth?
usersRoutes.get("/list", usersController.list);

// ADM TOOLS - ainda não protegido por auth
usersRoutes.get("/profile/:id", usersController.getById);
usersRoutes.delete("/delete/:id", usersController.remove); 