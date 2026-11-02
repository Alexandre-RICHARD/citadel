import type { AuthEndpointRegistry } from "@citadel/specs/src/projects/auth/authEndpointRegistry.type.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { Router as ExpressRouter } from "express";

import { createTypedExpressRouter } from "../../common/routing/createTypedExpressRouter.ts";
import { meController } from "./controller/meController.ts";
import { sessionController } from "./controller/sessionController.ts";

const expressRouter = ExpressRouter();

const typedRouter =
	createTypedExpressRouter<AuthEndpointRegistry>(expressRouter);

typedRouter.GET(`${ApiPrefixEnum.AUTH}/me`, meController.getMe);
typedRouter.POST(`${ApiPrefixEnum.AUTH}/logout`, sessionController.logout);

export const authRouter = expressRouter;
