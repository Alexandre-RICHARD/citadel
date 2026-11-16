import type { GetConnectedShowSeasons } from "@citadel/specs/src/projects/backlog/endpoint/nas/getConnectedShowSeasons/getConnectedShowSeasonsEndpoint.interface.ts";
import type { GetConnectedUserMedia } from "@citadel/specs/src/projects/backlog/endpoint/nas/getConnectedUserMedia/getConnectedUserMediaEndpoint.interface.ts";
import type { GetForgottenMedia } from "@citadel/specs/src/projects/backlog/endpoint/nas/getForgottenMedia/getForgottenMediaEndpoint.interface.ts";
import type { GetNasStatus } from "@citadel/specs/src/projects/backlog/endpoint/nas/getNasStatus/getNasStatusEndpoint.interface.ts";
import type { LockNas } from "@citadel/specs/src/projects/backlog/endpoint/nas/lockNas/lockNasEndpoint.interface.ts";
import type { SetMediaVerified } from "@citadel/specs/src/projects/backlog/endpoint/nas/setMediaVerified/setMediaVerifiedEndpoint.interface.ts";
import type { UnlockNas } from "@citadel/specs/src/projects/backlog/endpoint/nas/unlockNas/unlockNasEndpoint.interface.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { protectedRequestHandler } from "../../../common/routing/protectedRequestHandler.ts";
import { nasSettings } from "../../../configuration/nasSettings.ts";
import type { NasSettings } from "../../../configuration/nasSettings.type.ts";
import { fromConnectedShowSeasonBeanListToDto } from "../mapper/dtoBean/nas/fromConnectedShowSeasonBeanListToDto.ts";
import { fromConnectedUserMediaPageToConnectedUserMediaListDto } from "../mapper/dtoBean/nas/fromConnectedUserMediaPageToConnectedUserMediaListDto.ts";
import { fromGetConnectedUserMediaDtoToBean } from "../mapper/dtoBean/nas/fromGetConnectedUserMediaDtoToBean.ts";
import { assertNasUnlocked } from "../nas/access/assertNasUnlocked.ts";
import { unlockCookie } from "../nas/access/unlockCookie.ts";
import { nasService } from "../service/nasService.ts";

// Les routes du NAS ne sont montées qu'avec ces réglages (nasRouter) : leur absence ici est un oubli du routeur
function requireSettings(): NasSettings {
	if (nasSettings === null)
		throw new Error("NAS route reached without MEDIA_STATE_DIR");
	return nasSettings;
}

export const nasController = {
	// Monté partout : le serveur public répond que le mode connecté n'existe pas
	getStatus: protectedRequestHandler<GetNasStatus>(
		async (request, response, session) => {
			const status = await nasService.getStatus(
				nasSettings,
				request,
				session.userId,
			);
			return response.status(HttpStatutCodeSuccessEnum.SUCCESS).json(status);
		},
	),

	unlock: protectedRequestHandler<UnlockNas>(
		async (request, response, session) => {
			const settings = requireSettings();
			const token = await nasService.unlock(
				settings,
				session.userId,
				// `request.ip` : l'IP réelle, posée par le middleware realClientIp
				request.ip ?? "unknown",
				request.body.password,
			);
			unlockCookie.set(response, token, settings.unlockDurationMs);
			return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();
		},
	),

	lock: protectedRequestHandler<LockNas>(async (_request, response) => {
		unlockCookie.clear(response);
		return Promise.resolve(
			response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end(),
		);
	}),

	getUserMedia: protectedRequestHandler<GetConnectedUserMedia>(
		async (request, response, session) => {
			const settings = requireSettings();
			assertNasUnlocked(settings, request, session.userId);
			const page = await nasService.getConnectedUserMedia(
				settings,
				session.userId,
				fromGetConnectedUserMediaDtoToBean(request.query),
			);
			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromConnectedUserMediaPageToConnectedUserMediaListDto(page));
		},
	),

	getSeasons: protectedRequestHandler<GetConnectedShowSeasons>(
		async (request, response, session) => {
			const settings = requireSettings();
			assertNasUnlocked(settings, request, session.userId);
			const seasons = await nasService.getConnectedShowSeasons(
				settings,
				session.userId,
				{ userMediaId: request.params.userMediaId },
			);
			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json(fromConnectedShowSeasonBeanListToDto(seasons));
		},
	),

	setVerified: protectedRequestHandler<SetMediaVerified>(
		async (request, response, session) => {
			const settings = requireSettings();
			assertNasUnlocked(settings, request, session.userId);
			await nasService.setVerified(settings, session.userId, {
				userMediaId: request.params.userMediaId,
				episodeIds: request.body.episodeIds,
				isVerified: request.body.isVerified,
			});
			return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();
		},
	),

	getForgottenMedia: protectedRequestHandler<GetForgottenMedia>(
		async (request, response, session) => {
			const settings = requireSettings();
			assertNasUnlocked(settings, request, session.userId);
			const forgottenMedia = await nasService.getForgottenMedia(
				settings,
				session.userId,
			);
			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json({ forgottenMedia });
		},
	),
};
