import type { EndpointModel } from "@citadel/specs/src/specUtils/endpointModel.type.ts";
import type { EndpointErrorMap } from "@citadel/specs/src/specUtils/error/endpointErrorMap.type.ts";

// Statut de succès -> données : chaque statut garde les siennes quand la réponse en prévoit plusieurs (200 avec corps, 204 sans)
type SuccessResponseMap<Response extends EndpointModel["response"]> = {
	[Status in Response["status"] & number]: Response extends {
		status: infer ResponseStatus;
		data: infer Data;
	}
		? Status extends ResponseStatus
			? Data
			: never
		: never;
};

export type ResponseMap<Endpoint extends EndpointModel> =
	EndpointErrorMap<Endpoint> & SuccessResponseMap<Endpoint["response"]>;
