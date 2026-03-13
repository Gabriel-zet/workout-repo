import { Router } from "express";
import { usersController } from "../controllers/users.controller";


export const usersRoutes = Router();


usersRoutes.post("/register", usersController.create);
usersRoutes.get("/list", usersController.list);
usersRoutes.get("/profile/:id", usersController.getById);
usersRoutes.delete("/delete/:id", usersController.remove); 