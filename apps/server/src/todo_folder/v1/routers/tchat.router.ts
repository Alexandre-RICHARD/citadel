import { Router as createRouter } from "express";

import { asyncHandler } from "../../middlewares/asyncRequestHandler.ts";
import { tchatController } from "../controllers/tchatController.ts";

export const tchatRouter = createRouter();

tchatRouter.get("/message", asyncHandler(tchatController.getMessages));
tchatRouter.post("/message", asyncHandler(tchatController.sendMessage));
