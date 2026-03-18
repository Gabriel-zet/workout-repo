import { Router } from "express";
import { ensureAuth } from "../middlewares/ensureAuth";
import { meController } from "../controllers/me.controller";

export const meRoutes = Router();

meRoutes.get("/me", ensureAuth, meController.get);