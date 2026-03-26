import { prisma } from "../database/prisma.js";
import { setsRepository } from "../repositories/sets.repo.js";

export const setsService = {
  async create(userId: number, input: { workoutExerciseId: string; order: number; reps?: number | null; weight?: string | null }) {
    // valida ownership no workoutExercise
    const we = await prisma.workoutExercise.findUnique({
      where: { id: input.workoutExerciseId },
      include: { workout: true },
    });

    if (!we || we.workout.userId !== userId) {
      return { ok: false as const, reason: "NOT_FOUND" as const };
    }

    const created = await setsRepository.create({
      workoutExerciseId: input.workoutExerciseId,
      order: input.order,
      reps: input.reps ?? null,
      weight: input.weight ?? null,
    });

    return { ok: true as const, data: created };
  },

  async list(userId: number, workoutExerciseId: string) {
    const we = await prisma.workoutExercise.findUnique({
      where: { id: workoutExerciseId },
      include: { workout: true },
    });

    if (!we || we.workout.userId !== userId) return null;

    return setsRepository.listByWorkoutExerciseId(workoutExerciseId);
  },

  async update(userId: number, setId: string, data: { reps?: number | null; weight?: string | null; order?: number }) {
    const existing = await setsRepository.findById(setId);

    if (!existing || existing.workoutExercise.workout.userId !== userId) {
      return null;
    }

    return setsRepository.updateById(setId, data);
  },

  async remove(userId: number, setId: string) {
    const existing = await setsRepository.findById(setId);

    if (!existing || existing.workoutExercise.workout.userId !== userId) {
      return false;
    }

    await setsRepository.deleteById(setId);
    return true;
  },
};