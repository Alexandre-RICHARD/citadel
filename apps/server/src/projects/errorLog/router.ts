import { createErrorLogBodySchema } from "@citadel/specs/src/projects/errorLog/endpoint/entries/createErrorLog/createErrorLogBodySchema.ts";
import type { ErrorLogEndpointRegistry } from "@citadel/specs/src/projects/errorLog/errorLogEndpointRegistry.type.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { Router as ExpressRouter } from "express";

import { createTypedExpressRouter } from "../../common/routing/createTypedExpressRouter.ts";
import { requestValidator } from "../../middleware/requestValidator.ts";
import { errorLogController } from "./controller/errorLogController.ts";

const expressRouter = ExpressRouter();

const typedRouter =
	createTypedExpressRouter<ErrorLogEndpointRegistry>(expressRouter);

typedRouter.POST(
	`${ApiPrefixEnum.ERROR_LOG}/entries`,
	errorLogController.create,
	requestValidator({ body: createErrorLogBodySchema }),
);

export const errorLogRouter = expressRouter;
