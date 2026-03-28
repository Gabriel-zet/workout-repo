import z from "zod";

export const createExerciseSchema = z.object({
  name: z.string().min(1).max(80),
});