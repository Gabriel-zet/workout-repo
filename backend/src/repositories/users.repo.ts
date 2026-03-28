import { prisma } from '../database/prisma.js';
import type { CreateUserRepoInput } from './CreateUserRepoInput.js';


export const userRepo = {
  // Cria um usuário no banco `data` deve seguir o formato de CreateUserInput
    create(data: CreateUserRepoInput) {
        return prisma.user.create({ data });
    },

    // Busca todos os usuários, ordenando por nome              
    findMany(){
        return prisma.user.findMany({ orderBy: { name: 'asc' } });
    },

    // Busca um usuário específico pelo id. Retorna `null` se não encontrar
    findById(id: number){
        return prisma.user.findUnique({ 
            where: { id },
                select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                passwordHash: false,
    },
        });
    },

    // Delete um usuário pelo id
    deleteById(id: number){
        return prisma.user.delete({ where: { id } });
    },

    findByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });

},
};