import type { Request, Response } from "express";
import { usersService } from "../services/users.service";

// Zod já é utilizado no middleware de validação. 

export const authController = {
  async login(req: Request, res: Response) {
    const token = await usersService.authenticate(req.body);

    if (!token) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json({ token });
  },

  async register(req: Request, res: Response) {
    try {
      const user = await usersService.create(req.body);

      const token = await usersService.authenticate({
        email: req.body.email,
        password: req.body.password,
      });

      return res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      });
    } catch (error: any) {
      if (error.message?.includes("unique")) {
        return res.status(409).json({ message: "Email already registered" });
      }

      return res.status(500).json({ message: "Error creating user" });
    }
  },

  async logout(req: Request, res: Response) {
    res.json({ message: "Logout realizado com sucesso" });
  },
};