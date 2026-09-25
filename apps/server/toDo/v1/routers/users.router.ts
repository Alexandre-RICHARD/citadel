import { Router as createRouter } from "express";

import { asyncHandler } from "../../middlewares/asyncRequestHandler";
import { asyncSecurityHandler } from "../../middlewares/asyncSecurityHandler";
import { usersController } from "../controllers/usersController";

export const usersRouter = createRouter();

usersRouter.get("/", asyncSecurityHandler(usersController.getUsers));
usersRouter.get(
  "/role/:role",
  asyncSecurityHandler(usersController.getUsersByRole),
);
usersRouter.post("/register", asyncHandler(usersController.register));
usersRouter.post("/login", asyncHandler(usersController.login));
usersRouter.put("/", asyncSecurityHandler(usersController.updateUser));
usersRouter.put(
  "/password",
  asyncSecurityHandler(usersController.updatePassword),
);
usersRouter.put("/mail", asyncSecurityHandler(usersController.updateMail));
usersRouter.delete("/:id", asyncSecurityHandler(usersController.deleteUser));
