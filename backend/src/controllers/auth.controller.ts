import type { Request, Response } from "express";
import { z } from "zod";
import { usersService } from "../services/users.service";

// Schema de Login
const loginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

// Schema de Register
const registerSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirme a senha"),
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

export const authController = {
  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid body",
        issues: parsed.error.issues,
      });
    }

    const token = await usersService.authenticate(parsed.data);

    if (!token) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json({ token });
  },

  async register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid body",
        issues: parsed.error.issues,
      });
    }

    try {
      const user = await usersService.create({
        email: parsed.data.email,
        password: parsed.data.password,
        name: parsed.data.name,
      });

      // Autentica automaticamente após registro -> melhoria de UX, evita que o usuário tenha que logar logo após se registrar
      const token = await usersService.authenticate({
        email: parsed.data.email,
        password: parsed.data.password,
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
      // Se email já existe
      if (error.message?.includes("unique")) {
        return res.status(409).json({ message: "Email already registered" });
      }

      return res.status(500).json({ message: "Error creating user" });
    }
  },

  async logout(req: Request, res: Response) {
    // Isso será alterado para invalidar o token no futuro(Refresh token), mas por enquanto é só uma resposta de sucesso para o cliente, já que estamos usando JWTs stateless
    res.json({ message: "Logout realizado com sucesso" });
  },
};