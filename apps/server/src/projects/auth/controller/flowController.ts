import type { AbandonFlow } from "@citadel/specs/src/projects/auth/endpoint/flow/abandonFlow/abandonFlowEndpoint.interface.ts";
import type { GetFlow } from "@citadel/specs/src/projects/auth/endpoint/flow/getFlow/getFlowEndpoint.interface.ts";
import type { ResendFlowMail } from "@citadel/specs/src/projects/auth/endpoint/flow/resendFlowMail/resendFlowMailEndpoint.interface.ts";
import type { SubmitFlowCode } from "@citadel/specs/src/projects/auth/endpoint/flow/submitFlowCode/submitFlowCodeEndpoint.interface.ts";
import type { SubmitFlowLink } from "@citadel/specs/src/projects/auth/endpoint/flow/submitFlowLink/submitFlowLinkEndpoint.interface.ts";
import type { SubmitNewPassword } from "@citadel/specs/src/projects/auth/endpoint/flow/submitNewPassword/submitNewPasswordEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { asyncRequestHandler } from "../../../common/routing/asyncRequestHandler.ts";
import { flowCookie } from "../cookie/flowCookie.ts";
import { writeFlowOutcomeCookies } from "../cookie/writeFlowOutcomeCookies.ts";
import { readBrowserContext } from "../helper/readBrowserContext.ts";
import { fromFlowBeanToFlowStatusDto } from "../mapper/dtoBean/flow/fromFlowBeanToFlowStatusDto.ts";
import { fromFlowOutcomeBeanToFlowStatusDto } from "../mapper/dtoBean/flow/fromFlowOutcomeBeanToFlowStatusDto.ts";
import { flowCompletionService } from "../service/flowCompletionService.ts";
import { flowService } from "../service/flowService.ts";
import { passwordResetService } from "../service/passwordResetService.ts";

// Chaque réponse d'un parcours dit où il en est : jamais gardée par un cache
const NO_STORE = "no-store";

export const flowController = {
	getFlow: asyncRequestHandler<GetFlow>(async (request, response) => {
		const flowToken = flowCookie.read(request);
		const flow = await flowService.findCurrent(flowToken);
		// Un cookie qui ne mène plus à rien (parcours expiré, terminé ailleurs) n'a plus à être envoyé
		if (flow === null && flowToken !== undefined) flowCookie.clear(response);

		response.set("Cache-Control", NO_STORE);
		return response
			.status(HttpStatutCodeSuccessEnum.SUCCESS)
			.json(
				fromFlowBeanToFlowStatusDto(
					flow === null ? null : flowService.toBean(flow),
					new Date(),
				),
			);
	}),

	abandonFlow: asyncRequestHandler<AbandonFlow>(async (request, response) => {
		await flowService.abandon(flowCookie.read(request));

		flowCookie.clear(response);
		return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();
	}),

	resendMail: asyncRequestHandler<ResendFlowMail>(async (request, response) => {
		const outcome = await flowService.resend(readBrowserContext(request));

		writeFlowOutcomeCookies(response, outcome);
		response.set("Cache-Control", NO_STORE);
		return response
			.status(HttpStatutCodeSuccessEnum.SUCCESS)
			.json(fromFlowOutcomeBeanToFlowStatusDto(outcome, new Date()));
	}),

	submitCode: asyncRequestHandler<SubmitFlowCode>(async (request, response) => {
		const outcome = await flowCompletionService.completeMailStep(
			{ kind: "code", code: request.body.code },
			readBrowserContext(request),
			request.body.username,
		);

		writeFlowOutcomeCookies(response, outcome);
		response.set("Cache-Control", NO_STORE);
		return response
			.status(HttpStatutCodeSuccessEnum.SUCCESS)
			.json(fromFlowOutcomeBeanToFlowStatusDto(outcome, new Date()));
	}),

	submitLink: asyncRequestHandler<SubmitFlowLink>(async (request, response) => {
		const outcome = await flowCompletionService.completeMailStep(
			{ kind: "link", linkToken: request.body.token },
			readBrowserContext(request),
			request.body.username,
		);

		writeFlowOutcomeCookies(response, outcome);
		response.set("Cache-Control", NO_STORE);
		return response
			.status(HttpStatutCodeSuccessEnum.SUCCESS)
			.json(fromFlowOutcomeBeanToFlowStatusDto(outcome, new Date()));
	}),

	submitNewPassword: asyncRequestHandler<SubmitNewPassword>(
		async (request, response) => {
			const outcome = await passwordResetService.setNewPassword(
				request.body.password,
				readBrowserContext(request),
			);

			writeFlowOutcomeCookies(response, outcome);
			response.set("Cache-Control", NO_STORE);
			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromFlowOutcomeBeanToFlowStatusDto(outcome, new Date()));
		},
	),
};
