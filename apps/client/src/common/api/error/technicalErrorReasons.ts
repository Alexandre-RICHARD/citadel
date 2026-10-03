import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum";

// Raison affichée après « Impossible de … : » pour chaque code technique
export const technicalErrorReasons: Record<TechnicalErrorCodeEnum, string> = {
	[TechnicalErrorCodeEnum.VALIDATION_FAILED]: "la saisie a été refusée",
	[TechnicalErrorCodeEnum.MALFORMED_JSON]: "la requête envoyée est illisible",
	[TechnicalErrorCodeEnum.INVALID_REQUEST]: "la requête a été refusée",
	[TechnicalErrorCodeEnum.ROUTE_NOT_FOUND]:
		"cette action n'existe pas sur le serveur",
	[TechnicalErrorCodeEnum.METHOD_NOT_ALLOWED]:
		"cette action n'est pas acceptée par le serveur",
	[TechnicalErrorCodeEnum.INTERNAL_ERROR]: "le serveur a rencontré une erreur",
};
