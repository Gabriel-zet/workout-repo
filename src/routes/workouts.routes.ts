import { Router } from "express";
import { workoutsController } from "../controllers/workouts.controller";
import { validateIdParam } from "../middlewares/validateIdParam";
import { ensureAuth } from "../middlewares/ensureAuth";

export const workoutsRoutes = Router();

workoutsRoutes.use(ensureAuth);

workoutsRoutes.post("/", workoutsController.create);
workoutsRoutes.get("/", workoutsController.list);
workoutsRoutes.get("/:id", validateIdParam,workoutsController.getById);
workoutsRoutes.put("/:id", validateIdParam, workoutsController.update);
workoutsRoutes.delete("/:id", validateIdParam, workoutsController.remove);