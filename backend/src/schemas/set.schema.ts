import { z } from "zod";
// No local imports here

export const createSetSchema = z.object({
  order: z.number().int().min(1),
  reps: z.number().int().min(0).optional().nullable(),
  weight: z.string().regex(/^\d+(\.\d{1,2})?$/).optional().nullable(), // "40" | "40.5" | "40.50"
});

export const updateSetSchema = z.object({
  order: z.number().int().min(1).optional(),
  reps: z.number().int().min(0).optional().nullable(),
  weight: z.string().regex(/^\d+(\.\d{1,2})?$/).optional().nullable(),
});