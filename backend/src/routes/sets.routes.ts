import { Router } from "express";
import { ensureAuth } from "../middlewares/ensureAuth.js";
import { setsController } from "../controllers/sets.controller.js";

export const setsRoutes = Router();

setsRoutes.use(ensureAuth);

// post e get de sets ficam dentro do escopo do workoutExercise, pq pra criar um set tem que ser dentro de um workoutExercise, e pra listar os sets tem que ser dentro de um workoutExercise tbm 
setsRoutes.post("/workout-exercises/:workoutExerciseId/sets", setsController.create);
setsRoutes.get("/workout-exercises/:workoutExerciseId/sets", setsController.list);

// update e delete de set ficam dentro do escopo do workoutExercise tbm, pra validar ownership via workout.userId
setsRoutes.put("/workout-exercises/:workoutExerciseId/sets/:setId", setsController.update);
setsRoutes.delete("/workout-exercises/:workoutExerciseId/sets/:setId", setsController.remove);