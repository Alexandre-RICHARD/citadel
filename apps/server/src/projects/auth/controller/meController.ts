import type { ChangePassword } from "@citadel/specs/src/projects/auth/endpoint/me/changePassword/changePasswordEndpoint.interface.ts";
import type { DeleteMe } from "@citadel/specs/src/projects/auth/endpoint/me/deleteMe/deleteMeEndpoint.interface.ts";
import type { DeleteProjectData } from "@citadel/specs/src/projects/auth/endpoint/me/deleteProjectData/deleteProjectDataEndpoint.interface.ts";
import type { ExportMyData } from "@citadel/specs/src/projects/auth/endpoint/me/exportMyData/exportMyDataEndpoint.interface.ts";
import type { GetMe } from "@citadel/specs/src/projects/auth/endpoint/me/getMe/getMeEndpoint.interface.ts";
import type { StartEmailChange } from "@citadel/specs/src/projects/auth/endpoint/me/startEmailChange/startEmailChangeEndpoint.interface.ts";
import type { UpdateMe } from "@citadel/specs/src/projects/auth/endpoint/me/updateMe/updateMeEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { protectedRequestHandler } from "../../../common/routing/protectedRequestHandler.ts";
import { sessionCookie } from "../cookie/sessionCookie.ts";
import { writeFlowOutcomeCookies } from "../cookie/writeFlowOutcomeCookies.ts";
import { readBrowserContext } from "../helper/readBrowserContext.ts";
import { fromFlowOutcomeBeanToFlowStatusDto } from "../mapper/dtoBean/flow/fromFlowOutcomeBeanToFlowStatusDto.ts";
import { fromMeBeanToMeDto } from "../mapper/dtoBean/user/fromMeBeanToMeDto.ts";
import { accountDeletionService } from "../service/accountDeletionService.ts";
import { accountExportService } from "../service/accountExportService.ts";
import { emailChangeService } from "../service/emailChangeService.ts";
import { passwordChangeService } from "../service/passwordChangeService.ts";
import { projectDataDeletionService } from "../service/projectDataDeletionService.ts";
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

	updateMe: protectedRequestHandler<UpdateMe>(
		async (request, response, session) => {
			const me = await userService.updateProfile(session.userId, request.body);

			response.set("Cache-Control", "no-store");
			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromMeBeanToMeDto(me));
		},
	),

	changePassword: protectedRequestHandler<ChangePassword>(
		async (request, response, session) => {
			await passwordChangeService.change(
				{
					userId: session.userId,
					sessionId: session.sessionId,
					currentPassword: request.body.currentPassword,
					newPassword: request.body.newPassword,
				},
				readBrowserContext(request).client,
			);

			return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();
		},
	),

	startEmailChange: protectedRequestHandler<StartEmailChange>(
		async (request, response, session) => {
			const outcome = await emailChangeService.start(
				session.userId,
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

	exportMyData: protectedRequestHandler<ExportMyData>(
		async (_request, response, session) => {
			const archive = await accountExportService.buildArchive(session.userId);

			// Des données personnelles : un fichier à télécharger, jamais gardé par un cache
			response.set({
				"Cache-Control": "no-store",
				"Content-Type": "application/zip",
				"Content-Disposition": `attachment; filename="citadel-mes-donnees-${new Date().toISOString().slice(0, 10)}.zip"`,
			});
			return response.status(HttpStatutCodeSuccessEnum.SUCCESS).send(archive);
		},
	),

	deleteProjectData: protectedRequestHandler<DeleteProjectData>(
		async (request, response, session) => {
			await projectDataDeletionService.deleteProject(
				session.userId,
				request.params.project,
				request.body.password,
				readBrowserContext(request).client,
			);

			return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();
		},
	),

	deleteMe: protectedRequestHandler<DeleteMe>(
		async (request, response, session) => {
			await accountDeletionService.delete(
				session.userId,
				request.body,
				readBrowserContext(request).client,
			);

			// Le compte emporte ses sessions : le cookie n'a plus rien à ouvrir
			sessionCookie.clear(response);
			return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();
		},
	),
};
