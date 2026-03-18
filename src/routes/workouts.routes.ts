import { Router } from "express";
import { workoutsController } from "../controllers/workouts.controller";
import { validateIdParam } from "../middlewares/validateIdParam";
import { ensureAuth } from "../middlewares/ensureAuth";


export const workoutsRoutes = Router();

// workoutsRoutes.use(ensureAuth); 

// Somente listando user logado
workoutsRoutes.post("/create", workoutsController.create, ensureAuth);
workoutsRoutes.get("/list", workoutsController.list, ensureAuth);
workoutsRoutes.get("/profile/:id", validateIdParam,workoutsController.getById, ensureAuth);
workoutsRoutes.put("/profile/:id", validateIdParam, workoutsController.update, ensureAuth);
workoutsRoutes.delete("/delete/:id", validateIdParam, workoutsController.remove, ensureAuth);


// rota de teste pra listar tudo, sem nada :V loucuras 
workoutsRoutes.get("/listall", workoutsController.listall);


