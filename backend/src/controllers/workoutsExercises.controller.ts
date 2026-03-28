import type { Request, Response } from "express";
import { addSchema } from "../schemas/workout.schema.js";
import { workoutExercisesService } from "../services/workoutExercises.service.js";



export const workoutExercisesController = {

  async add(req: Request, res: Response) {
    if (!req.userId) return res.status(401).json({ message: "Unauthenticated" });

    const body = addSchema.parse(req.body);
// delega pra service checar se workout e exercício existem e pertencem ao usuário, e criar associação
    const result = await workoutExercisesService.addToWorkout(req.userId, body);

    if (!result.ok) {
      if (result.reason === "WORKOUT_NOT_FOUND") return res.status(404).json({ message: "Workout not found" });
      if (result.reason === "EXERCISE_NOT_FOUND") return res.status(404).json({ message: "Exercise not found" });
      return res.status(400).json({ message: "Bad request" });
    }

    return res.status(201).json(result.data);
  },

  async listByWorkout(req: Request, res: Response) {
    if (!req.userId) return res.status(401).json({ message: "Unauthenticated" });

    const workoutId = req.params.workoutId;
    if (!workoutId || Array.isArray(workoutId)) {
      return res.status(400).json({ message: "Invalid workoutId parameter" });
    }

    const list = await workoutExercisesService.listFromWorkout(req.userId, workoutId);
    if (!list) return res.status(404).json({ message: "Workout not found" });

    return res.json(list);
  },

  async remove(req: Request, res: Response) {
    if (!req.userId) return res.status(401).json({ message: "Unauthenticated" });

    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid id parameter" });
    }

    const result = await workoutExercisesService.remove(req.userId, id);

    if (!result.ok) {
      if (result.reason === "NOT_FOUND") return res.status(404).json({ message: "WorkoutExercise not found" });
      if (result.reason === "FORBIDDEN") return res.status(404).json({ message: "WorkoutExercise not found" }); // não vaza info
    }

    return res.status(204).send();
  },
};