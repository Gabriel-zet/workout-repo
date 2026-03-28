import type { Request, Response } from "express";
import { createExerciseSchema } from "../schemas/exercises.schema.js";
import { exercisesService } from "../services/exercises.service.js";



export const exercisesController = {
  async create(req: Request, res: Response) {
  // Existem cerca de 3 validações até o momento para auth, isso pode ser melhorado depois... 
    if (!req.userId) return res.status(401).json({ message: "Unauthenticated" });

    const body = createExerciseSchema.parse(req.body);

    const exercise = await exercisesService.create(req.userId, body.name);
    return res.status(201).json(exercise);
  },

  async list(req: Request, res: Response) {
    if (!req.userId) return res.status(401).json({ message: "Unauthenticated" });

    const exercises = await exercisesService.listByUser(req.userId);
    return res.json(exercises);
  },

  async remove(req: Request, res: Response) {
    if (!req.userId) return res.status(401).json({ message: "Unauthenticated" });

    const { id } = req.params;

    const ok = await exercisesService.remove(req.userId, id as string);
    if (!ok) return res.status(404).json({ message: "Exercise not found" });

    return res.status(204).send();
  },
};