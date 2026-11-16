import type { BacklogEndpointRegistry } from "@citadel/specs/src/projects/backlog/backlogEndpointRegistry.type.ts";
import { getConnectedShowSeasonsPathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/nas/getConnectedShowSeasons/getConnectedShowSeasonsPathParamSchema.ts";
import { getConnectedUserMediaQueryParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/nas/getConnectedUserMedia/getConnectedUserMediaQueryParamSchema.ts";
import { setMediaVerifiedBodySchema } from "@citadel/specs/src/projects/backlog/endpoint/nas/setMediaVerified/setMediaVerifiedBodySchema.ts";
import { setMediaVerifiedPathParamSchema } from "@citadel/specs/src/projects/backlog/endpoint/nas/setMediaVerified/setMediaVerifiedPathParamSchema.ts";
import { unlockNasBodySchema } from "@citadel/specs/src/projects/backlog/endpoint/nas/unlockNas/unlockNasBodySchema.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { Router as ExpressRouter } from "express";

import { createTypedExpressRouter } from "../../common/routing/createTypedExpressRouter.ts";
import { requestValidator } from "../../middleware/requestValidator.ts";
import { nasController } from "./controller/nasController.ts";

const expressRouter = ExpressRouter();

const typedRouter =
	createTypedExpressRouter<BacklogEndpointRegistry>(expressRouter);

typedRouter.POST(
	`${ApiPrefixEnum.BACKLOG}/nas/unlock`,
	nasController.unlock,
	requestValidator({ body: unlockNasBodySchema }),
);

typedRouter.POST(`${ApiPrefixEnum.BACKLOG}/nas/lock`, nasController.lock);

typedRouter.GET(
	`${ApiPrefixEnum.BACKLOG}/nas/user-media`,
	nasController.getUserMedia,
	requestValidator({ query: getConnectedUserMediaQueryParamSchema }),
);

typedRouter.GET(
	`${ApiPrefixEnum.BACKLOG}/nas/user-media/:userMediaId/seasons`,
	nasController.getSeasons,
	requestValidator({ params: getConnectedShowSeasonsPathParamSchema }),
);

typedRouter.PUT(
	`${ApiPrefixEnum.BACKLOG}/nas/user-media/:userMediaId/verified`,
	nasController.setVerified,
	requestValidator({
		params: setMediaVerifiedPathParamSchema,
		body: setMediaVerifiedBodySchema,
	}),
);

typedRouter.GET(
	`${ApiPrefixEnum.BACKLOG}/nas/forgotten-media`,
	nasController.getForgottenMedia,
);

/**
 * Les routes du mode connecté (§3), montées seulement sur l'instance locale du NAS (MEDIA_STATE_DIR posée) : ailleurs,
 * elles n'existent pas (404, comme une adresse inconnue). Caddy les refuse aussi sur le domaine public
 */
export const nasRouter = expressRouter;
