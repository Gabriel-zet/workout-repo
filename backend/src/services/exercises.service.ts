import { exercisesRepository } from "../repositories/exercises.repo.js";

export const exercisesService = {
  async create(userId: number, name: string) {
    // normaliza só pra evitar “Supino” vs “supino”, é apenas para evitar bagunça, não tem a intenção de ser uma regra de negócio ou algo do tipo
    const trimmed = name.trim();
    return exercisesRepository.create(userId, { name: trimmed });
  },

  async listByUser(userId: number) {
    return exercisesRepository.findManyByUserId(userId);
  },

  async remove(userId: number, exerciseId: string) {
    const exercise = await exercisesRepository.findByIdForUser(exerciseId, userId);
    if (!exercise) return null;

    await exercisesRepository.deleteByIdForUser(exerciseId, userId);
    return true;
  },
};