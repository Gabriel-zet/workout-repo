import { Router } from "express";
import { workoutsController } from "../controllers/workouts.controller.js";
import { validateIdParam } from "../middlewares/validateIdParam.js";
import { ensureAuth } from "../middlewares/ensureAuth.js";


export const workoutsRoutes = Router();

// workoutsRoutes.use(ensureAuth); 

// Somente listando user logado
workoutsRoutes.post("/create", ensureAuth, workoutsController.create);
workoutsRoutes.get("/list", ensureAuth, workoutsController.list);
workoutsRoutes.get("/profile/:id", ensureAuth, validateIdParam,workoutsController.getById);
workoutsRoutes.put("/profile/:id", ensureAuth, validateIdParam, workoutsController.update);
workoutsRoutes.delete("/delete/:id", ensureAuth, validateIdParam, workoutsController.remove);


// rota de teste pra listar tudo, sem nada :V loucuras 
//workoutsRoutes.get("/listall", workoutsController.listall);


