import type { CancelMediaImport } from "@citadel/specs/src/projects/backlog/endpoint/mediaImports/cancelMediaImport/cancelMediaImportEndpoint.interface.ts";
import type { GetMediaImport } from "@citadel/specs/src/projects/backlog/endpoint/mediaImports/getMediaImport/getMediaImportEndpoint.interface.ts";
import type { StartMediaImport } from "@citadel/specs/src/projects/backlog/endpoint/mediaImports/startMediaImport/startMediaImportEndpoint.interface.ts";
import type { ValidateMediaImport } from "@citadel/specs/src/projects/backlog/endpoint/mediaImports/validateMediaImport/validateMediaImportEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { protectedRequestHandler } from "../../../common/routing/protectedRequestHandler.ts";
import { fromMediaImportBeanToMediaImportDto } from "../mapper/dtoBean/media/fromMediaImportBeanToMediaImportDto.ts";
import { fromStartMediaImportDtoToMediaImportEntryBeans } from "../mapper/dtoBean/media/fromStartMediaImportDtoToMediaImportEntryBeans.ts";
import { mediaImportService } from "../service/mediaImportService.ts";

export const mediaImportController = {
	start: protectedRequestHandler<StartMediaImport>(
		async (request, response, session) => {
			const mediaImport = await mediaImportService.startImport(
				session.userId,
				fromStartMediaImportDtoToMediaImportEntryBeans(request.body),
			);

			return response
				.status(HttpStatutCodeSuccessEnum.CREATED)
				.json(fromMediaImportBeanToMediaImportDto(mediaImport));
		},
	),

	get: protectedRequestHandler<GetMediaImport>(
		async (_request, response, session) => {
			const mediaImport = await mediaImportService.getImport(session.userId);

			// Toujours la progression du moment : le front la relit jusqu'à la fin de la lecture
			response.set("Cache-Control", "no-store");
			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromMediaImportBeanToMediaImportDto(mediaImport));
		},
	),

	validate: protectedRequestHandler<ValidateMediaImport>(
		async (_request, response, session) => {
			const addedCount = await mediaImportService.validateImport(
				session.userId,
			);

			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json({ addedCount });
		},
	),

	cancel: protectedRequestHandler<CancelMediaImport>(
		async (_request, response, session) => {
			await mediaImportService.cancelImport(session.userId);

			return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();
		},
	),
};
