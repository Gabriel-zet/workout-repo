import express from "express";
import cors from "cors";
import "dotenv/config";
import { workoutsRoutes } from "./routes/workouts.routes";
import { usersRoutes } from "./routes/users.routes";
import { authRoutes } from "./routes/auth.routes";
import { meRoutes } from "./routes/me.routes";
import { errorHandler } from "./middlewares/errorHandler";
import { exercisesRoutes } from "./routes/exercises.routes";
import { workoutsExercisesRoutes } from "./routes/workoutsExercises.routes";
import { setsRoutes } from "./routes/sets.routes";



const app = express();

// cors deve ser restritivo antes de ir para produção /// -- => por enquanto vou manter assim por facilidade de desenvolvimento, mas depois tem que ser mais restritivo
app.use(cors());
app.use(express.json({ limit: "150kb" }));

app.use("/workouts", workoutsRoutes);
app.use("/user", usersRoutes);
app.use("/auth", authRoutes);
app.use("/exercises", exercisesRoutes);
app.use("/workout-exercises", workoutsExercisesRoutes);
app.use(meRoutes);
app.use(setsRoutes);
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(errorHandler);

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`API rodando em http://localhost:${port}`);
});