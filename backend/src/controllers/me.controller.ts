import type { Request, Response } from "express";
import { usersService } from "../services/users.service.js";

export const meController = {
  async get(req: Request, res: Response) {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    const user = await usersService.getById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    // ??? Remove a senha do objeto user antes de enviar a resposta
    const { passwordHash, ...safeUser } = user as any;
    return res.json(safeUser);
  },
};