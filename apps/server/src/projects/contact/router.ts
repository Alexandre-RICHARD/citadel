import type { ContactEndpointRegistry } from "@citadel/specs/src/projects/contact/contactEndpointRegistry.type.ts";
import { sendContactMessageBodySchema } from "@citadel/specs/src/projects/contact/endpoint/messages/sendContactMessage/sendContactMessageBodySchema.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { Router as ExpressRouter } from "express";

import { createTypedExpressRouter } from "../../common/routing/createTypedExpressRouter.ts";
import { internalOnly } from "../../middleware/internalOnly.ts";
import { requestValidator } from "../../middleware/requestValidator.ts";
import { contactController } from "./controller/contactController.ts";

const expressRouter = ExpressRouter();

const typedRouter =
	createTypedExpressRouter<ContactEndpointRegistry>(expressRouter);

typedRouter.POST(
	`${ApiPrefixEnum.CONTACT}/messages`,
	contactController.sendMessage,
	requestValidator({ body: sendContactMessageBodySchema }),
);
typedRouter.GET(
	`${ApiPrefixEnum.INTERNAL}${ApiPrefixEnum.CONTACT}/unsent`,
	contactController.getUnsentCount,
	internalOnly,
);

export const contactRouter = expressRouter;
