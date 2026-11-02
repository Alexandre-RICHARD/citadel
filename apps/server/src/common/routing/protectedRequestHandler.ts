import type { EndpointModel } from "@citadel/specs/src/specUtils/endpointModel.type.ts";

import type { AuthenticatedSessionBean } from "../../projects/auth/bean/authenticatedSessionBean.type.ts";
import { asyncRequestHandler } from "./asyncRequestHandler.ts";
import type { CustomEndpointRequest } from "./customEndpointRequest.type.ts";
import type { ProtectedEndpointHandler } from "./protectedEndpointHandler.type.ts";
import { requestSessions } from "./requestSessions.ts";
import type { ResponseMap } from "./responseMap.type.ts";
import type { TypedResponse } from "./typedResponse.type.ts";

/**
 * Le contrôleur d'un endpoint protégé : il reçoit la session de la requête, d'où il tire l'id de l'utilisateur (jamais
 * du corps ni de l'URL). Le routeur typé place requireSession devant : sans session, il n'est jamais appelé
 */
export function protectedRequestHandler<Endpoint extends EndpointModel>(
	fn: (
		request: CustomEndpointRequest<Endpoint>,
		response: TypedResponse<ResponseMap<Endpoint>>,
		session: AuthenticatedSessionBean,
	) => Promise<unknown>,
): ProtectedEndpointHandler<Endpoint> {
	const handler = asyncRequestHandler<Endpoint>(async (request, response) => {
		const session = requestSessions.get(request);
		// Un routeur qui aurait oublié requireSession : jamais de contrôleur protégé sans session
		if (session === undefined)
			throw new Error("Protected handler reached without a session");
		return fn(request, response, session);
	});
	return Object.assign(handler, { isSessionRequired: true as const });
}
