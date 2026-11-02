import type { EndpointModel } from "@citadel/specs/src/specUtils/endpointModel.type.ts";

import type { CustomEndpointHandler } from "./customEndpointHandler.type.ts";
import type { ProtectedEndpointHandler } from "./protectedEndpointHandler.type.ts";

/**
 * Le contrôleur qu'accepte le routeur typé, selon `protected` dans les specs : un endpoint protégé exige un
 * protectedRequestHandler, un endpoint public le refuse. Les specs et la vérification de session ne peuvent donc pas
 * se contredire
 */
export type EndpointHandler<Endpoint extends EndpointModel> =
	Endpoint["request"]["protected"] extends true
		? ProtectedEndpointHandler<Endpoint>
		: CustomEndpointHandler<Endpoint> & { readonly isSessionRequired?: never };
