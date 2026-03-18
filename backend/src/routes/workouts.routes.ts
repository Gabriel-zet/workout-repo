import { Router } from "express";
import { workoutsController } from "../controllers/workouts.controller";
import { validateIdParam } from "../middlewares/validateIdParam";
import { ensureAuth } from "../middlewares/ensureAuth";


export const workoutsRoutes = Router();

// workoutsRoutes.use(ensureAuth); 

// Somente listando user logado
workoutsRoutes.post("/create", ensureAuth, workoutsController.create);
workoutsRoutes.get("/list", ensureAuth, workoutsController.list);
workoutsRoutes.get("/profile/:id", ensureAuth, validateIdParam,workoutsController.getById);
workoutsRoutes.put("/profile/:id", ensureAuth, validateIdParam, workoutsController.update);
workoutsRoutes.delete("/delete/:id", ensureAuth, validateIdParam, workoutsController.remove);


// rota de teste pra listar tudo, sem nada :V loucuras 
workoutsRoutes.get("/listall", workoutsController.listall);


