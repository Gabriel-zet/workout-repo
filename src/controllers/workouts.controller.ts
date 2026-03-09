import type { Request, Response } from "express";
import { z } from "zod";
import { workoutsService } from "../services/workouts.service";

// Schema de validação para CRIAÇÃO de workout
// - date: aceita string e converte para Date (z.coerce.date())
// - title: obrigatório e não pode ser vazio
// - notes: opcional
const createWorkoutSchema = z.object({
  date: z.coerce.date(), // aceita string ISO (ou similar) e converte pra Date
  title: z.string().min(1),
  userId: z.number(),
  notes: z.string().optional(),
});

// Schema de validação para ATUALIZAÇÃO (PATCH/PUT)
// Tudo opcional, porque pode-se atualizar apenas parte dos campos
// notes permite null
const updateWorkoutSchema = z.object({
  date: z.coerce.date().optional(),
  title: z.string().min(1).optional(),
  notes: z.string().nullable().optional(),
});

export const workoutsController = {
  // Cria um workout
  async create(req: Request, res: Response) {
    // payload da requisição
    const { body } = req;

    // Validação
    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({ message: "Request body cannot be empty" });
    }

    // Valida e normaliza os dados de entrada. Se estiver inválido, o Zod lança erro
    const parsedBody = createWorkoutSchema.parse(body);

    // Chama a camada de serviço para persistir o workout
    const workout = await workoutsService.create(parsedBody);

    // Retorna 201 com o recurso criado
    return res.status(201).json(workout);
  },

  // Lista todos os workouts
  async list(_req: Request, res: Response) {
    const workouts = await workoutsService.list();
    return res.json(workouts);
  },

  // Busca workout por id
  async getById(req: Request, res: Response) {
    const { id } = req.params;

    // Garante que id existe e não é array
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid id parameter" });
    }

    const workout = await workoutsService.getById(id);
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

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

    const workout = await workoutsService.update(id, body);
    return res.json(workout);
  },

  // Remove workout por id
  async remove(req: Request, res: Response) {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid id parameter" });
    }

    await workoutsService.remove(id);

    // 204 = sem conteúdo
    return res.status(204).send();
  },
};