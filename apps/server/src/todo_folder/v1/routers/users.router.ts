import { Router as createRouter } from "express";

import { asyncHandler } from "../../middlewares/asyncRequestHandler.ts";
import { asyncSecurityHandler } from "../../middlewares/asyncSecurityHandler.ts";
import { usersController } from "../controllers/usersController.ts";

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
