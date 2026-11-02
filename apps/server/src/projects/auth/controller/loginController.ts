import type { LoginWithPassword } from "@citadel/specs/src/projects/auth/endpoint/login/loginWithPassword/loginWithPasswordEndpoint.interface.ts";
import type { StartMailLogin } from "@citadel/specs/src/projects/auth/endpoint/login/startMailLogin/startMailLoginEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { asyncRequestHandler } from "../../../common/routing/asyncRequestHandler.ts";
import { writeFlowOutcomeCookies } from "../cookie/writeFlowOutcomeCookies.ts";
import { readBrowserContext } from "../helper/readBrowserContext.ts";
import { fromFlowOutcomeBeanToFlowStatusDto } from "../mapper/dtoBean/flow/fromFlowOutcomeBeanToFlowStatusDto.ts";
import { loginService } from "../service/loginService.ts";

export const loginController = {
	loginWithPassword: asyncRequestHandler<LoginWithPassword>(
		async (request, response) => {
			const outcome = await loginService.loginWithPassword(
				request.body,
				readBrowserContext(request),
			);

			writeFlowOutcomeCookies(response, outcome);
			response.set("Cache-Control", "no-store");
			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromFlowOutcomeBeanToFlowStatusDto(outcome, new Date()));
		},
	),

	startMailLogin: asyncRequestHandler<StartMailLogin>(
		async (request, response) => {
			const outcome = await loginService.startMailLogin(
				request.body,
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
