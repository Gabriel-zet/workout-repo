import { workoutsRepository } from "../repositories/workouts.repo";
import type { CreateWorkoutInput } from "../repositories/CreateWorkoutInput";

 // Camada de serviço para workouts Faltam validações mais complexas?  Lembrar de ADC
export const workoutsService = {
  // Cria um workout. Recebe um input tipado e repassa para o repositório persistir no banco
  async create(input: CreateWorkoutInput) {
    return workoutsRepository.create(input);
  },

  // Lista todos os workouts
  async list() {
    return workoutsRepository.findMany();
  },

// Busca um workout pelo id
  async getById(id: string) {
    const workout = await workoutsRepository.findById(id);
    return workout;
  },

  // Atualiza um workout pelo id > Partial<CreateWorkoutInput> permite atualizar só alguns campos
  async update(id: string, data: Partial<CreateWorkoutInput>) {
    return workoutsRepository.updateById(id, data);
  },

  // Remove um workout pelo id
  async remove(id: string) {
    return workoutsRepository.deleteById(id);
  },
};