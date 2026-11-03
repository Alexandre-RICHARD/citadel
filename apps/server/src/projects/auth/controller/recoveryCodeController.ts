import type { RegenerateRecoveryCodes } from "@citadel/specs/src/projects/auth/endpoint/recoveryCodes/regenerateRecoveryCodes/regenerateRecoveryCodesEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { protectedRequestHandler } from "../../../common/routing/protectedRequestHandler.ts";
import { readBrowserContext } from "../helper/readBrowserContext.ts";
import { recoveryCodeService } from "../service/recoveryCodeService.ts";

export const recoveryCodeController = {
	regenerate: protectedRequestHandler<RegenerateRecoveryCodes>(
		async (request, response, session) => {
			const recoveryCodes = await recoveryCodeService.regenerate(
				session.userId,
				request.body.password,
				readBrowserContext(request).client,
			);

			// Montrés cette seule fois : jamais gardés par un cache
			response.set("Cache-Control", "no-store");
			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json({ recoveryCodes });
		},
	),
};
