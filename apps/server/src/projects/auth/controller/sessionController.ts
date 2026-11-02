import type { Logout } from "@citadel/specs/src/projects/auth/endpoint/sessions/logout/logoutEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { asyncRequestHandler } from "../../../common/routing/asyncRequestHandler.ts";
import { sessionCookie } from "../cookie/sessionCookie.ts";
import { sessionService } from "../service/sessionService.ts";

export const sessionController = {
	logout: asyncRequestHandler<Logout>(async (request, response) => {
		const token = sessionCookie.read(request);
		if (token !== undefined) await sessionService.delete(token);

		sessionCookie.clear(response);
		return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();
	}),
};
