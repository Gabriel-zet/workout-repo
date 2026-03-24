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

  FindManyId(userId: number){
        return prisma.workout.findMany({
            where: { userId },
            orderBy: { date: "desc" },
        });
  },

/*
  findManyByUserId(userId: number) {
    return prisma.workout.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });
  }, */

  // Ownership:  

  // ownership: só acha se for do usuário - adicionei exercicios também por sei lá ficou completo pelo menos - de inicio ia fazer gambiarra e desisti
findByIdForUser(id: string, userId: number) {
  return prisma.workout.findFirst({
    where: { id, userId },
    include: {
      workoutExercises: {
        orderBy: { order: "asc" },
        include: {
          exercise: true,
          sets: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });
},

  // ownership: só atualiza se for do usuário
  async updateByIdForUser(
    id: string,
    userId: number,
    data: Partial<CreateWorkoutInput>
  ) {
    // garante que existe e é do dono antes de atualizar. Se não existir ou não for do dono, retorna null
    const workout = await prisma.workout.findFirst({ where: { id, userId } });
    if (!workout) return null;

    return prisma.workout.update({
      where: { id },
      data,
    });
  },

  // ownership: só deleta se for do usuário
  async deleteByIdForUser(id: string, userId: number) {
    const workout = await prisma.workout.findFirst({ where: { id, userId } });
    if (!workout) return null;

    await prisma.workout.delete({ where: { id } });
    return true;
  },

// ---- sem verificação de ownership (só pra admin) Possivel feature se der vontade ----



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