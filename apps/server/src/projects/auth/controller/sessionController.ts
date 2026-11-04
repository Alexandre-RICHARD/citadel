import type { DeleteAllSessions } from "@citadel/specs/src/projects/auth/endpoint/sessions/deleteAllSessions/deleteAllSessionsEndpoint.interface.ts";
import type { DeleteOtherSessions } from "@citadel/specs/src/projects/auth/endpoint/sessions/deleteOtherSessions/deleteOtherSessionsEndpoint.interface.ts";
import type { DeleteSession } from "@citadel/specs/src/projects/auth/endpoint/sessions/deleteSession/deleteSessionEndpoint.interface.ts";
import type { ListSessions } from "@citadel/specs/src/projects/auth/endpoint/sessions/listSessions/listSessionsEndpoint.interface.ts";
import type { Logout } from "@citadel/specs/src/projects/auth/endpoint/sessions/logout/logoutEndpoint.interface.ts";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { asyncRequestHandler } from "../../../common/routing/asyncRequestHandler.ts";
import { protectedRequestHandler } from "../../../common/routing/protectedRequestHandler.ts";
import { NotFoundError } from "../../../error/NotFoundError.ts";
import { sessionCookie } from "../cookie/sessionCookie.ts";
import { fromSessionBeanToSessionDto } from "../mapper/dtoBean/session/fromSessionBeanToSessionDto.ts";
import { sessionService } from "../service/sessionService.ts";

export const sessionController = {
	logout: asyncRequestHandler<Logout>(async (request, response) => {
		const token = sessionCookie.read(request);
		if (token !== undefined) await sessionService.delete(token);

		sessionCookie.clear(response);
		return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();
	}),

	list: protectedRequestHandler<ListSessions>(
		async (_request, response, session) => {
			const sessions = await sessionService.list(
				session.userId,
				session.sessionId,
			);

			// Des adresses IP et des appareils : jamais gardés par un cache
			response.set("Cache-Control", "no-store");
			return response
				.status(HttpStatutCodeSuccessEnum.SUCCESS)
				.json({ sessions: sessions.map(fromSessionBeanToSessionDto) });
		},
	),

	// Celle de la requête comprise : plus de session, donc plus de cookie
	delete: protectedRequestHandler<DeleteSession>(
		async (request, response, session) => {
			const { sessionId } = request.params;
			if (!(await sessionService.deleteOfUser(session.userId, sessionId)))
				throw new NotFoundError(
					AuthErrorCodeEnum.SESSION_NOT_FOUND,
					"No session of this account has this id",
				);

			if (sessionId === session.sessionId) sessionCookie.clear(response);
			return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();
		},
	),

	deleteAll: protectedRequestHandler<DeleteAllSessions>(
		async (_request, response, session) => {
			await sessionService.deleteAllOfUser(session.userId);

			sessionCookie.clear(response);
			return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();
		},
	),

	deleteOthers: protectedRequestHandler<DeleteOtherSessions>(
		async (_request, response, session) => {
			await sessionService.deleteOthersOfUser(
				session.userId,
				session.sessionId,
			);

			return response.status(HttpStatutCodeSuccessEnum.NO_CONTENT).end();
		},
	),
};
