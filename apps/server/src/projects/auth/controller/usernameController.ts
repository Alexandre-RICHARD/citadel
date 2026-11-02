import type { GetUsernameAvailability } from "@citadel/specs/src/projects/auth/endpoint/usernames/getUsernameAvailability/getUsernameAvailabilityEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { asyncRequestHandler } from "../../../common/routing/asyncRequestHandler.ts";
import { userService } from "../service/userService.ts";

export const usernameController = {
	getAvailability: asyncRequestHandler<GetUsernameAvailability>(
		async (request, response) => {
			// `request.ip` : l'IP réelle, posée par le middleware realClientIp
			const isAvailable = await userService.isUsernameAvailable(
				request.params.username,
				request.ip ?? "unknown",
			);

			// L'état du moment : un pseudo libre peut être pris la seconde suivante
			response.set("Cache-Control", "no-store");
			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json({ isAvailable });
		},
	),
};
