import { Router } from "express";
import { ensureAuth } from "../middlewares/ensureAuth.js";
import { meController } from "../controllers/me.controller.js";

export const meRoutes = Router();

meRoutes.get("/me", ensureAuth, meController.get);