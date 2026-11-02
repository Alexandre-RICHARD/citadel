import type { GetMe } from "@citadel/specs/src/projects/auth/endpoint/me/getMe/getMeEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { protectedRequestHandler } from "../../../common/routing/protectedRequestHandler.ts";
import { fromMeBeanToMeDto } from "../mapper/dtoBean/user/fromMeBeanToMeDto.ts";
import { userService } from "../service/userService.ts";

export const meController = {
	getMe: protectedRequestHandler<GetMe>(async (_request, response, session) => {
		const me = await userService.getMe(session.userId);

		// Des données personnelles : jamais gardées par un cache
		response.set("Cache-Control", "no-store");
		return response
			.status(HttpStatutCodeSuccessEnum.SUCCESS)
			.json(fromMeBeanToMeDto(me));
	}),
};
