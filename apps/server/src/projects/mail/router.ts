import type { MailEndpointRegistry } from "@citadel/specs/src/projects/mail/mailEndpointRegistry.type.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { Router as ExpressRouter } from "express";

import { createTypedExpressRouter } from "../../common/routing/createTypedExpressRouter.ts";
import { internalOnly } from "../../middleware/internalOnly.ts";
import { mailController } from "./controller/mailController.ts";

const expressRouter = ExpressRouter();

const typedRouter =
	createTypedExpressRouter<MailEndpointRegistry>(expressRouter);

typedRouter.GET(`${ApiPrefixEnum.MAIL}/status`, mailController.getStatus);
typedRouter.GET(
	`${ApiPrefixEnum.INTERNAL}${ApiPrefixEnum.MAIL}/failures`,
	mailController.getFailureSummary,
	internalOnly,
);

export const mailRouter = expressRouter;
