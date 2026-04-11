import z from "zod";
// No local imports here

export const createExerciseSchema = z.object({
  name: z.string().min(1).max(80),
});