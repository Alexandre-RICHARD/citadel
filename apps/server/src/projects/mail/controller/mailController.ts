import type { GetMailFailureSummary } from "@citadel/specs/src/projects/mail/endpoint/failures/getMailFailureSummary/getMailFailureSummaryEndpoint.interface.ts";
import type { GetMailStatus } from "@citadel/specs/src/projects/mail/endpoint/status/getMailStatus/getMailStatusEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { asyncRequestHandler } from "../../../common/routing/asyncRequestHandler.ts";
import { fromMailFailureSummaryBeanToMailFailureSummaryDto } from "../../../mail/failure/mapper/fromMailFailureSummaryBeanToMailFailureSummaryDto.ts";
import { mailService } from "../../../mail/mailService.ts";

export const mailController = {
	getStatus: asyncRequestHandler<GetMailStatus>(async (_request, response) => {
		const mailStatus = await mailService.getStatus();

		// Toujours l'état du moment : le site rouvre dès que le compteur retombe
		response.set("Cache-Control", "no-store");
		return response.status(HttpStatutCodeSuccessEnum.SUCCESS).json(mailStatus);
	}),

	getFailureSummary: asyncRequestHandler<GetMailFailureSummary>(
		async (_request, response) => {
			const summary = await mailService.getFailureSummary();

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromMailFailureSummaryBeanToMailFailureSummaryDto(summary));
		},
	),
};
