import { Router as createRouter } from "express";

import { asyncHandler } from "../../middlewares/asyncRequestHandler";
import { tchatController } from "../controllers/tchatController";

export const tchatRouter = createRouter();

tchatRouter.get("/message", asyncHandler(tchatController.getMessages));
tchatRouter.post("/message", asyncHandler(tchatController.sendMessage));
