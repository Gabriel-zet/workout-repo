import { workoutExercisesRepository } from "../repositories/workoutsExercises.repo.js";
import { workoutsRepository } from "../repositories/workouts.repo.js";
import { exercisesRepository } from "../repositories/exercises.repo.js";

export const workoutExercisesService = {

// adiciona exercício a workout, checando se workout e exercício existem e pertencem ao usuário
  async addToWorkout(userId: number, input: { workoutId: string; exerciseId: string; order: number; notes?: string }) {
    const workout = await workoutsRepository.findByIdForUser(input.workoutId, userId);
    if (!workout) return { ok: false as const, reason: "WORKOUT_NOT_FOUND" as const };

    const exercise = await exercisesRepository.findByIdForUser(input.exerciseId, userId);
    if (!exercise) return { ok: false as const, reason: "EXERCISE_NOT_FOUND" as const };

    const created = await workoutExercisesRepository.create({
      workoutId: input.workoutId,
      exerciseId: input.exerciseId,
      order: input.order,
      notes: input.notes,
    });

    return { ok: true as const, data: created };
  },


// lista exercícios de um workout, checando se o workout pertence ao usuário
  async listFromWorkout(userId: number, workoutId: string) {
    const workout = await workoutsRepository.findByIdForUser(workoutId, userId);
    if (!workout) return null;

    return workoutExercisesRepository.listByWorkoutId(workoutId);
  },


// remove exercício do workout, checando se o workout pertence ao usuário
  async remove(userId: number, workoutExerciseId: string) {
    const we = await workoutExercisesRepository.findById(workoutExerciseId);
    if (!we) return { ok: false as const, reason: "NOT_FOUND" as const };

    if (we.workout.userId !== userId) {
      return { ok: false as const, reason: "FORBIDDEN" as const };
    }

    await workoutExercisesRepository.deleteById(workoutExerciseId);
    return { ok: true as const };
  },
};