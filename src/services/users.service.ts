import { userRepo } from '../repositories/users.repo';
import type { CreateUserInput } from '../repositories/CreateUserInput';
import bcrypt from 'bcrypt';


export const usersService = {
  // Cria um usuário. Recebe um input tipado e repassa para o repositório persistir no banco
    async create(input: CreateUserInput) {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(input.password, saltRounds);

    return userRepo.create({
        email: input.email,
        name: input.name,
        passwordHash,
    });
    },

    // Lista todos os Usuarios 
    async list(){
        return userRepo.findMany();
    },

    // Busca um usuário pelo id
    async getById(id: number) {
        const user = await userRepo.findById(id);
        return user;
    },

    // remove um usuário pelo id
    async remove(id: number) {
        return userRepo.deleteById(id);
    }

  };