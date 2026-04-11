import express from "express";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";

// rotas
import { workoutsRoutes } from "./routes/workouts.routes.js";
import { usersRoutes } from "./routes/users.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import { meRoutes } from "./routes/me.routes.js";
import { exercisesRoutes } from "./routes/exercises.routes.js";
import { workoutsExercisesRoutes } from "./routes/workoutsExercises.routes.js";
import { setsRoutes } from "./routes/sets.routes.js";

// middlewares
import { errorHandler } from "./middlewares/errorHandler.js";
import { globalLimiter } from "./middlewares/rateLimiter.js";




const app = express();

app.set('trust proxy', 1);

app.use(helmet());
// cors deve ser restritivo antes de ir para produção /// -- => por enquanto vou manter assim por facilidade de desenvolvimento, mas depois tem que ser mais restritivo
app.use(cors());
app.use(express.json({ limit: "150kb" }));

app.use(globalLimiter); 

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

//middleware de tratamento de erros
app.use(errorHandler);

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`API rodando em http://localhost:${port}`);
});