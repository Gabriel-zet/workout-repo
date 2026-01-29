import { prisma } from "../database/prisma.js";
import type { CreateWorkoutInput } from "./CreateWorkoutInput.js";


export const workoutsRepository = {
  // Cria um workout no banco `data` deve seguir o formato de CreateWorkoutInput
  create(data: CreateWorkoutInput) {
    return prisma.workout.create({ data });
  },

  // Busca todos os workouts, ordenando por data (mais recentes primeiro)
  findMany() {
    return prisma.workout.findMany({ orderBy: { date: "desc" } });
  },

  // Busca um workout específico pelo id. Retorna `null` se não encontrar
  findById(id: string) {
    return prisma.workout.findUnique({ where: { id } });
  },

  // Atualiza um workout pelo id. Partial<CreateWorkoutInput> permite enviar apenas alguns campos para atualizar (ex.: só title, ou só notes)
  updateById(id: string, data: Partial<CreateWorkoutInput>) {
    return prisma.workout.update({ where: { id }, data });
  },

  // Remove um workout pelo id
  deleteById(id: string) {
    return prisma.workout.delete({ where: { id } });
  },
};