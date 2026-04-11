import type { Request, Response } from "express";
import { createWorkoutSchema, updateWorkoutSchema } from "../schemas/workout.schema.js";
import { workoutsService } from "../services/workouts.service.js";



export const workoutsController = {

  // Lista todos os workouts t t 
  async listall(_req: Request, res: Response) {
    const workouts = await workoutsService.list();
    return res.json(workouts);
  }, 


  // Cria um workout
async create(req: Request, res: Response) {
  
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  const parsedBody = createWorkoutSchema.parse(req.body);

  const workout = await workoutsService.create({
    ...parsedBody,
    date: parsedBody.date,
    userId: req.userId,
  });

  return res.status(201).json(workout);
},

  // Lista todos os workouts do usuário logado 
  async list(_req: Request, res: Response) {
    if (!_req.userId) return res.status(401).json({ message: "Unauthenticated" });

    const workouts = await workoutsService.listByUser(_req.userId);
    return res.json(workouts);
  },

  // Busca workout por id
  async getById(req: Request, res: Response) {
  if (!req.userId) return res.status(401).json({ message: "Unauthenticated" });

  const { id } = req.params;
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Invalid id parameter" });
  }

  const workout = await workoutsService.getByIdForUser(id, req.userId);
  if (!workout) return res.status(404).json({ message: "Workout not found" });

  return res.json(workout);
},

  // Atualiza workout por id
  async update(req: Request, res: Response) {
    const { id } = req.params;

    // Validação
    if (!req.body || Object.keys(req.body).length === 0 || !id || Array.isArray(id)) {
      return res
        .status(400)
        .json({ message: "Request body cannot be empty and id must be valid" });
    }

    // Validação 
    const body = updateWorkoutSchema.parse(req.body);
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthenticated" });
    } 
    const workout = await workoutsService.updateByIdForUser(id, req.userId, body);

    if (!workout) {
      return res.status(404).json({ message: "Workout not found or not owned by user" });
    }
    return res.json(workout);
  },

  // Remove workout por id
  async remove(req: Request, res: Response) {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid id parameter" });
    } else if (!req.userId) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    await workoutsService.removeByIdForUser(id, req.userId!);

    // 204 = sem conteúdo
    return res.status(204).send();
  },
};