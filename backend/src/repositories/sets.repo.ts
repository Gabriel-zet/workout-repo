import { prisma } from "../database/prisma.js";


// Fazer uma validação de weight e reps no service, pra não deixar passar valores negativos ou zero

export type CreateSetInput = {
  workoutExerciseId: string;
  order: number;
  reps?: number | null;
  weight?: string | null; // string pq Prisma Decimal
};

export type UpdateSetInput = {
  reps?: number | null;
  weight?: string | null;
  order?: number;
};

export const setsRepository = {
  create(data: CreateSetInput) {
    return prisma.set.create({
      data: {
        workoutExerciseId: data.workoutExerciseId,
        order: data.order,
        reps: data.reps ?? null,
        weight: data.weight ?? null, // Prisma aceita string pra Decimal
      },
    });
  },

  listByWorkoutExerciseId(workoutExerciseId: string) {
    return prisma.set.findMany({
      where: { workoutExerciseId },
      orderBy: { order: "asc" },
    });
  },

  findById(id: string) {
    return prisma.set.findUnique({
      where: { id },
      include: {
        workoutExercise: {
          include: {
            workout: true, // pra validar ownership via workout.userId
          },
        },
      },
    });
  },

  updateById(id: string, data: UpdateSetInput) {
    return prisma.set.update({
      where: { id },
      data: {
        reps: data.reps,
        weight: data.weight,
        order: data.order,
      },
    });
  },

  deleteById(id: string) {
    return prisma.set.delete({
      where: { id },
    });
  },
};