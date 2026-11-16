import type { CheckTmdbIds } from "@citadel/specs/src/projects/backlog/endpoint/showUpdates/checkTmdbIds/checkTmdbIdsEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { asyncRequestHandler } from "../../../common/routing/asyncRequestHandler.ts";
import { tmdbIdCheckService } from "../service/tmdbIdCheckService.ts";

export const tmdbIdCheckController = {
	// Route interne : le job media-tmdb d'infra-ops, par le réseau Docker (internalOnly)
	checkSlice: asyncRequestHandler<CheckTmdbIds>(async (_request, response) => {
		const result = await tmdbIdCheckService.checkSlice();
		return response.status(HttpStatutCodeSuccessEnum.SUCCESS).json(result);
	}),
};
