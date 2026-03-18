import { workoutsRepository } from "../repositories/workouts.repo";
import type { CreateWorkoutInput } from "../repositories/CreateWorkoutInput";

 // Camada de serviço para workouts Faltam validações mais complexas?  Lembrar de ADC
export const workoutsService = {
  // Cria um workout. Recebe um input tipado e repassa para o repositório persistir no banco
  async create(input: CreateWorkoutInput) {
    return workoutsRepository.create(input);
  },

  // lista todos os workouts. Sem paginação, sem filtro, sem nada. Só pra testar mesmo
  async list() {
    return workoutsRepository.findMany();
  }, 


  async listByUser(userId: number) {
    return workoutsRepository.FindManyId(userId);
  },

// Busca um workout pelo id
  async getByIdForUser(id: string, userId: number) {
    const workout = await workoutsRepository.findByIdForUser(id, userId);
    return workout;
  },

  // Atualiza um workout pelo id > Partial<CreateWorkoutInput> permite atualizar só alguns campos
  async updateByIdForUser(id: string, userId: number, data: Partial<CreateWorkoutInput>) {
    return workoutsRepository.updateByIdForUser(id, userId, data);
  },

  // Remove um workout pelo id
  async removeByIdForUser(id: string, userId: number) {
    return workoutsRepository.deleteByIdForUser(id, userId);
  },
};