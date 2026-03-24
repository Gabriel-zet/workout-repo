import { Router } from "express";
import { ensureAuth } from "../middlewares/ensureAuth.js";
import { exercisesController } from "../controllers/exercises.controller.js";

export const exercisesRoutes = Router();

exercisesRoutes.use(ensureAuth);


// Rotas de exercícios - criar, listar e remover
exercisesRoutes.post("/", exercisesController.create);
exercisesRoutes.get("/", exercisesController.list);
exercisesRoutes.delete("/:id", exercisesController.remove);