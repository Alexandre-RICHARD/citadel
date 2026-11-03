import type { ConfirmTotpFactor } from "@citadel/specs/src/projects/auth/endpoint/factors/confirmTotpFactor/confirmTotpFactorEndpoint.interface.ts";
import type { CreateTotpFactor } from "@citadel/specs/src/projects/auth/endpoint/factors/createTotpFactor/createTotpFactorEndpoint.interface.ts";
import type { DeleteFactor } from "@citadel/specs/src/projects/auth/endpoint/factors/deleteFactor/deleteFactorEndpoint.interface.ts";
import type { ListFactors } from "@citadel/specs/src/projects/auth/endpoint/factors/listFactors/listFactorsEndpoint.interface.ts";
import type { StartEmailFactor } from "@citadel/specs/src/projects/auth/endpoint/factors/startEmailFactor/startEmailFactorEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { protectedRequestHandler } from "../../../common/routing/protectedRequestHandler.ts";
import { writeFlowOutcomeCookies } from "../cookie/writeFlowOutcomeCookies.ts";
import { readBrowserContext } from "../helper/readBrowserContext.ts";
import { fromFactorListBeanToFactorListDto } from "../mapper/dtoBean/factor/fromFactorListBeanToFactorListDto.ts";
import { fromFlowOutcomeBeanToFlowStatusDto } from "../mapper/dtoBean/flow/fromFlowOutcomeBeanToFlowStatusDto.ts";
import { factorService } from "../service/factorService.ts";

// Des secrets ou des codes de secours, et l'état d'un parcours : jamais gardés par un cache
const NO_STORE = "no-store";

export const factorController = {
	list: protectedRequestHandler<ListFactors>(
		async (_request, response, session) => {
			const factors = await factorService.list(session.userId);

			response.set("Cache-Control", NO_STORE);
			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromFactorListBeanToFactorListDto(factors));
		},
	),

	createTotp: protectedRequestHandler<CreateTotpFactor>(
		async (request, response, session) => {
			const setup = await factorService.createTotp(
				session.userId,
				request.body.name,
			);

			response.set("Cache-Control", NO_STORE);
			return response.status(HttpStatutCodeSuccessEnum.CREATED).json({
				factorId: setup.factorId,
				secret: setup.secretBase32,
				otpauthUri: setup.otpauthUri,
			});
		},
	),

	confirmTotp: protectedRequestHandler<ConfirmTotpFactor>(
		async (request, response, session) => {
			const recoveryCodes = await factorService.confirmTotp(
				session.userId,
				request.body,
				readBrowserContext(request).client,
			);

			response.set("Cache-Control", NO_STORE);
			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json({ recoveryCodes });
		},
	),

	startEmailFactor: protectedRequestHandler<StartEmailFactor>(
		async (request, response, session) => {
			const outcome = await factorService.startEmailFactor(
				session.userId,
				readBrowserContext(request),
			);

			writeFlowOutcomeCookies(response, outcome);
			response.set("Cache-Control", NO_STORE);
			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromFlowOutcomeBeanToFlowStatusDto(outcome, new Date()));
		},
	),

	delete: protectedRequestHandler<DeleteFactor>(
		async (request, response, session) => {
			await factorService.delete(
				session.userId,
				{ factorId: request.params.factorId, password: request.body.password },
				readBrowserContext(request).client,
			);

			return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();
		},
	),
};
