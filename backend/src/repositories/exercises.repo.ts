import { prisma } from "../database/prisma.js";

export type CreateExerciseInput = {
  name: string;
};

export const exercisesRepository = {
  create(userId: number, data: CreateExerciseInput) {
    return prisma.exercise.create({
      data: {
        name: data.name,
        userId,
      },
    });
  },

  findManyByUserId(userId: number) {
    return prisma.exercise.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
  },

  findByIdForUser(id: string, userId: number) {
    return prisma.exercise.findFirst({
      where: { id, userId },
    });
  },

  deleteByIdForUser(id: string, userId: number) {
    // Primeiro checa no service/controller e só depois deleta
    return prisma.exercise.delete({
      where: { id, userId },
    });
  },
};