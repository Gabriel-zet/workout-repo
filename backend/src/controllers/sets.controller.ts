import type { Request, Response } from "express";
import { createSetSchema, updateSetSchema } from "../schemas/set.schema.js";
import { setsService } from "../services/sets.service.js";


export const setsController = {
  async create(req: Request, res: Response) {
    if (!req.userId) return res.status(401).json({ message: "Unauthenticated" });

    const { workoutExerciseId } = req.params;
    if (!workoutExerciseId || Array.isArray(workoutExerciseId)) {
      return res.status(400).json({ message: "Invalid workoutExerciseId parameter" });
    }

    const body = createSetSchema.parse(req.body);

    const result = await setsService.create(req.userId, {
      workoutExerciseId,
      order: body.order,
      reps: body.reps ?? null,
      weight: body.weight ?? null,
    });

    if (!result.ok) return res.status(404).json({ message: "WorkoutExercise not found" });

    return res.status(201).json(result.data);
  },

  async list(req: Request, res: Response) {
    if (!req.userId) return res.status(401).json({ message: "Unauthenticated" });

    const { workoutExerciseId } = req.params;
    if (!workoutExerciseId || Array.isArray(workoutExerciseId)) {
      return res.status(400).json({ message: "Invalid workoutExerciseId parameter" });
    }

    const sets = await setsService.list(req.userId, workoutExerciseId);
    if (!sets) return res.status(404).json({ message: "WorkoutExercise not found" });

    return res.json(sets);
  },

  async update(req: Request, res: Response) {
    if (!req.userId) return res.status(401).json({ message: "Unauthenticated" });

    const { setId } = req.params;
    if (!setId || Array.isArray(setId)) {
      return res.status(400).json({ message: "Invalid setId parameter" });
    }

    const body = updateSetSchema.parse(req.body);
    const updated = await setsService.update(req.userId, setId, body);

    if (!updated) return res.status(404).json({ message: "Set not found" });

    return res.json(updated);
  },

  async remove(req: Request, res: Response) {
    if (!req.userId) return res.status(401).json({ message: "Unauthenticated" });

    const { setId } = req.params;
    if (!setId || Array.isArray(setId)) {
      return res.status(400).json({ message: "Invalid setId parameter" });
    }

    const ok = await setsService.remove(req.userId, setId);
    if (!ok) return res.status(404).json({ message: "Set not found" });

    return res.status(204).send();
  },
};