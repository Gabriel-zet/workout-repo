import { z } from "zod";


export const createWorkoutSchema = z.object({
  date: z.coerce.date(),
  title: z.string().min(1),
  notes: z.string().optional(),
});

export const updateWorkoutSchema = z.object({
  date: z.coerce.date().optional(),
  title: z.string().min(1).optional(),
  notes: z.string().nullable().optional(),
});



// Schema para adicionar exercício a workout, usado no controller de workoutExercises
export const addSchema = z.object({
  workoutId: z.string().min(1),
  exerciseId: z.string().min(1),
  order: z.number().int().min(1),
  notes: z.string().optional(),
});
