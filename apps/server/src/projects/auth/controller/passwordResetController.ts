import type { StartPasswordReset } from "@citadel/specs/src/projects/auth/endpoint/passwordResets/startPasswordReset/startPasswordResetEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { asyncRequestHandler } from "../../../common/routing/asyncRequestHandler.ts";
import { writeFlowOutcomeCookies } from "../cookie/writeFlowOutcomeCookies.ts";
import { readBrowserContext } from "../helper/readBrowserContext.ts";
import { fromFlowOutcomeBeanToFlowStatusDto } from "../mapper/dtoBean/flow/fromFlowOutcomeBeanToFlowStatusDto.ts";
import { passwordResetService } from "../service/passwordResetService.ts";

export const passwordResetController = {
	startPasswordReset: asyncRequestHandler<StartPasswordReset>(
		async (request, response) => {
			const outcome = await passwordResetService.start(
				request.body.identifier,
				readBrowserContext(request),
			);

			writeFlowOutcomeCookies(response, outcome);
			response.set("Cache-Control", "no-store");
			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromFlowOutcomeBeanToFlowStatusDto(outcome, new Date()));
		},
	),
};
