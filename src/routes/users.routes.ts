import { Router } from "express";
import { usersController } from "../controllers/users.controller";


export const usersRoutes = Router();


usersRoutes.post("/", usersController.create);
usersRoutes.get("/", usersController.list);
usersRoutes.get("/:id", usersController.getById);
usersRoutes.delete("/:id", usersController.remove); 