import type { EndpointModel } from "@citadel/specs/src/specUtils/endpointModel.type.ts";

import type { CustomEndpointHandler } from "./customEndpointHandler.type.ts";

// Le contrôleur d'un endpoint protégé (protectedRequestHandler) : le routeur typé place requireSession devant lui
export type ProtectedEndpointHandler<Endpoint extends EndpointModel> =
	CustomEndpointHandler<Endpoint> & { readonly isSessionRequired: true };
