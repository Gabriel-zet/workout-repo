import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string("Email é obrigatório")
      .min(1, "Email é obrigatório")
      .refine((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), {
        message: "Email inválido",
      })
      .transform((email) => email.toLowerCase().trim()),
    password: z
      .string()
      .min(6, "Senha deve ter pelo menos 6 caracteres")
      .max(100, "Senha muito longa"),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(100, "Nome muito longo")
      .transform((name) => name.trim()),
    email: z
      .string("Email é obrigatório")
      .min(1, "Email é obrigatório")
      .refine((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), {
        message: "Email inválido",
      })
      .transform((email) => email.toLowerCase().trim()),
    password: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .max(100, "Senha muito longa")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Senha deve ter maiúscula, minúscula e número"
      ),
    confirmPassword: z
      .string()
      .min(8, "Confirmação de senha obrigatória"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  }),
});
