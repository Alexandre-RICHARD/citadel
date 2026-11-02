import type { EndpointModel } from "@citadel/specs/src/specUtils/endpointModel.type.ts";
import type { NextFunction } from "express";

import type { CustomEndpointHandler } from "./customEndpointHandler.type.ts";
import type { CustomEndpointRequest } from "./customEndpointRequest.type.ts";
import type { ResponseMap } from "./responseMap.type.ts";
import type { TypedResponse } from "./typedResponse.type.ts";

export function asyncRequestHandler<Endpoint extends EndpointModel>(
	fn: (
		req: CustomEndpointRequest<Endpoint>,
		res: TypedResponse<ResponseMap<Endpoint>>,
		next: NextFunction,
	) => Promise<unknown>,
): CustomEndpointHandler<Endpoint> {
	return (req, res, next) => {
		Promise.resolve(
			fn(req, res as unknown as TypedResponse<ResponseMap<Endpoint>>, next),
			// Recommandé par Express
			// eslint-disable-next-line promise/no-callback-in-promise
		).catch(next);
	};
}
