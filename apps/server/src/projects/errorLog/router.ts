import type { ErrorLogEndpointRegistry } from "@citadel/specs/src/projects/errorLog/errorLogEndpointRegistry.type.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { Router as ExpressRouter } from "express";

import { createTypedExpressRouter } from "../../common/routing/createTypedExpressRouter.ts";
import { errorLogController } from "./controller/errorLog.controller.ts";

const expressRouter = ExpressRouter();

const typedRouter =
	createTypedExpressRouter<ErrorLogEndpointRegistry>(expressRouter);

typedRouter.POST(`${ApiPrefixEnum.ERROR_LOG}/error`, errorLogController.create);

export const errorLogRouter = expressRouter;
