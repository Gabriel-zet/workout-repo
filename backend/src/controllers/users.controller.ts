import type { Request, Response } from "express";
import { z } from "zod";
import { createUserSchema } from "../schemas/users.schema.js";
import { usersService } from "../services/users.service.js";



export const usersController = {
  // Cria um usuário, isso pode ser usado para criar usuários administrativos ou para testes, já que o registro normal é feito via authController.register
  async create(req: Request, res: Response) {
    // payload da requisição
    const { body } = req;

    if(!body || Object.keys(body).length === 0){
        return res.status(400).json({message: "Request body cannot be empty"});
    } 

    const parsedBody = createUserSchema.parse(body);

    const user = await usersService.create(parsedBody);
    return res.status(201).json(user); 
  },


  
  // Lista todos os usuários
  async list(_req: Request, res: Response) {
    const users = await usersService.list();
    return res.json(users);
  },

  // Busca usuário por id
  async getById(req: Request, res: Response) {
    // Validação do id como número positivo
    const idSchema = z.coerce.number().int().positive();

    const id = idSchema.parse(req.params.id);  
    if(!id || Array.isArray(id)){
        return res.status(400).json({message: "Invalid id parameter"});
    }
    const user = await usersService.getById(id);
    if(!user){
        return res.status(404).json({message: "User not found"});
    }

    return res.json(user);
  },
  // Remove usuário por id
  async remove(req: Request, res: Response) {
    // Validação do id como número positivo
    const idSchema = z.coerce.number().int().positive();

    const id = idSchema.parse(req.params.id);
    if(!id || Array.isArray(id)){
        return res.status(400).json({message: "Invalid id parameter"});
    }
    const user = await usersService.getById(id);
    if(!user){
        return res.status(404).json({message: "User not found"});
    }

    await usersService.remove(id);
    return res.status(204).send();
  },
};