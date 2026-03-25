import { prisma } from "../database/prisma.js";

export type CreateWorkoutExerciseInput = {
  workoutId: string;
  exerciseId: string;
  order: number;
  notes?: string;
};

export const workoutExercisesRepository = {
// cria associação entre exercício e workout, com ordem e notas
  create(data: CreateWorkoutExerciseInput) {
    return prisma.workoutExercise.create({
      data: {
        workoutId: data.workoutId,
        exerciseId: data.exerciseId,
        order: data.order,
        notes: data.notes,
      },
      include: {
        exercise: true,
        sets: { orderBy: { order: "asc" } },
      },
    });
  },


// lista por workoutId, ordenando por ordem dos exercícios no treino
  listByWorkoutId(workoutId: string) {
    return prisma.workoutExercise.findMany({
      where: { workoutId },
      orderBy: { order: "asc" },
      include: {
        exercise: true,
        sets: { orderBy: { order: "asc" } },
      },
    });
  },

// busca por id, incluindo o workout para checar ownership
  findById(id: string) {
    return prisma.workoutExercise.findUnique({
      where: { id },
      include: {
        workout: true, // pra checar ownership via workout.userId
      },
    });
  },

// remove por id
  deleteById(id: string) {
    return prisma.workoutExercise.delete({
      where: { id },
    });
  },
};