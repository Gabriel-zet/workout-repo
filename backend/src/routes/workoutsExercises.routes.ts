import { Router } from "express";
import { ensureAuth } from "../middlewares/ensureAuth.js";
import { workoutExercisesController } from "../controllers/workoutsExercises.controller.js";

export const workoutsExercisesRoutes = Router();

workoutsExercisesRoutes.use(ensureAuth);

// cria WorkoutExercise (associa exercício a treino)
workoutsExercisesRoutes.post("/", workoutExercisesController.add);

// lista por workoutId 
workoutsExercisesRoutes.get("/workout/:workoutId", workoutExercisesController.listByWorkout);

// remove por id WorkoutExercise
workoutsExercisesRoutes.delete("/:id", workoutExercisesController.remove);