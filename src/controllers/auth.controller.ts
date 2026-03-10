import type { Request, Response } from "express";
import { z } from "zod";
import { usersService } from "../services/users.service";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
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
};