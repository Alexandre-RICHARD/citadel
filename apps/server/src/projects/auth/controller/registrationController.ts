import type { StartRegistration } from "@citadel/specs/src/projects/auth/endpoint/registrations/startRegistration/startRegistrationEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { asyncRequestHandler } from "../../../common/routing/asyncRequestHandler.ts";
import { writeFlowOutcomeCookies } from "../cookie/writeFlowOutcomeCookies.ts";
import { readBrowserContext } from "../helper/readBrowserContext.ts";
import { fromFlowOutcomeBeanToFlowStatusDto } from "../mapper/dtoBean/flow/fromFlowOutcomeBeanToFlowStatusDto.ts";
import { fromStartRegistrationBodyDtoToRegistrationBean } from "../mapper/dtoBean/registration/fromStartRegistrationBodyDtoToRegistrationBean.ts";
import { registrationService } from "../service/registrationService.ts";

export const registrationController = {
	startRegistration: asyncRequestHandler<StartRegistration>(
		async (request, response) => {
			const outcome = await registrationService.start(
				fromStartRegistrationBodyDtoToRegistrationBean(request.body),
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
