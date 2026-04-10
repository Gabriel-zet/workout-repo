import type { Request, Response } from "express";
import { usersService } from "../services/users.service";

// Zod já é utilizado no middleware de validação. 

export const authController = {
  async login(req: Request, res: Response) {
    const tokens = await usersService.authenticate(req.body);

    if (!tokens) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json({ tokens });
  },

  async register(req: Request, res: Response) {
    try {
      const user = await usersService.create(req.body);
      // Após criar o usuário, já autentica e retorna os tokens
      const tokens = await usersService.authenticate({
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
        ...tokens,
      });
    } catch (error: any) {

    if (error.code === 'P2002') {
        return res.status(409).json({ 
        message: "Email already registered" 
      });
    }
      // 
      return res.status(500).json({ 
        message: "Error creating user",
        error: error.message,
      });
    }
  },

  async logout(req: Request, res: Response) {
    await usersService.logout(req.userId!);
    return res.json({ message: "Logged out successfully" });
  },

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    const tokens = await usersService.refreshAccessToken(refreshToken);

    if (!tokens) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    return res.json(tokens);
  },
};