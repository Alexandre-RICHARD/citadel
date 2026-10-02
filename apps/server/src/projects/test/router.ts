import type { TestEndpointRegistry } from "@citadel/specs/src/projects/test/testEndpointRegistry.type.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { Router as ExpressRouter } from "express";

import { createTypedExpressRouter } from "../../common/routing/createTypedExpressRouter.ts";
import { testController } from "./controller/testController.ts";

const expressRouter = ExpressRouter();

const typedRouter =
	createTypedExpressRouter<TestEndpointRegistry>(expressRouter);

typedRouter.GET(`${ApiPrefixEnum.TEST}/test/:id`, testController.getOne);
typedRouter.GET(`${ApiPrefixEnum.TEST}/test`, testController.getAll);
typedRouter.POST(`${ApiPrefixEnum.TEST}/test`, testController.create);
typedRouter.PUT(`${ApiPrefixEnum.TEST}/test/:id`, testController.update);
typedRouter.DELETE(`${ApiPrefixEnum.TEST}/test/:id`, testController.delete);

export const testRouter = expressRouter;
