import type { EndpointModel } from "../endpointModel.type.ts";
import type { HttpStatutCodeErrorEnum } from "../httpStatutCodeError.enum.ts";
import type { ErrorResponseDto } from "./errorResponseDto.type.ts";
import type { TechnicalErrorCodeEnum } from "./technicalErrorCode.enum.ts";

type DeclaredErrors<Endpoint extends EndpointModel> =
	Endpoint["error"] extends Record<number, unknown>
		? Endpoint["error"]
		: object;

// Ce que le serveur répond à une requête sans session valide, sur tout endpoint protégé
type SessionRequiredError = {
	[HttpStatutCodeErrorEnum.NEED_AUTHENTIFICATION]: ErrorResponseDto<TechnicalErrorCodeEnum.AUTHENTICATION_REQUIRED>;
};

// Les erreurs possibles d'un endpoint : celles qu'il déclare, plus le 401 quand il est protégé (jamais à écrire à la main)
export type EndpointErrorMap<Endpoint extends EndpointModel> =
	DeclaredErrors<Endpoint> &
		(Endpoint["request"]["protected"] extends true
			? SessionRequiredError
			: object);
