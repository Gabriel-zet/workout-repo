import { Router } from "express";
import { workoutsController } from "../controllers/workouts.controller";
import { validateIdParam } from "../middlewares/validateIdParam";
import { ensureAuth } from "../middlewares/ensureAuth";

export const workoutsRoutes = Router();

workoutsRoutes.use(ensureAuth);

workoutsRoutes.post("/create", workoutsController.create);
workoutsRoutes.get("/list", workoutsController.list);
workoutsRoutes.get("/profile/:id", validateIdParam,workoutsController.getById);
workoutsRoutes.put("/profile/:id", validateIdParam, workoutsController.update);
workoutsRoutes.delete("/delete/:id", validateIdParam, workoutsController.remove);