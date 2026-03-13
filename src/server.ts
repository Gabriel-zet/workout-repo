import express from "express";
import cors from "cors";
import "dotenv/config";
import { workoutsRoutes } from "./routes/workouts.routes";
import { usersRoutes } from "./routes/users.routes";
import { authRoutes } from "./routes/auth.routes";
import { meRoutes } from "./routes/me.routes";



const app = express();

app.use(cors());
app.use(express.json());

app.use("/workouts", workoutsRoutes);
app.use("/user", usersRoutes);
app.use("/auth", authRoutes);
app.use(meRoutes);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`API rodando em http://localhost:${port}`);
});