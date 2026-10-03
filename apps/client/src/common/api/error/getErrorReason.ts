import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum";

import { ApiError } from "./ApiError";
import type { ErrorReasons } from "./errorReasons.type";
import { getValidationIssuePhrase } from "./getValidationIssuePhrase";
import { technicalErrorReasons } from "./technicalErrorReasons";

type Dictionaries = {
	// Codes métier du projet : GAME_NOT_FOUND → « ce jeu n'existe plus »
	projectReasons?: ErrorReasons;
	// Nom de chaque champ du corps, pour détailler un 400 : name → « le nom »
	fieldLabels?: Readonly<Partial<Record<string, string>>>;
};

const UNREACHABLE_REASON = "le serveur est injoignable";
const UNEXPECTED_REASON = "une erreur inattendue est survenue";

const allReasons: ErrorReasons = technicalErrorReasons;

// Premier champ refusé d'un 400, nommé si le libellé du champ est connu
function getValidationReason(
	error: ApiError,
	fieldLabels: Dictionaries["fieldLabels"],
): string | null {
	const [issue] = error.issues;
	const fieldName = issue?.path[0];
	const fieldLabel =
		fieldName === undefined ? undefined : fieldLabels?.[String(fieldName)];
	if (issue === undefined || fieldLabel === undefined) return null;
	return `${fieldLabel} ${getValidationIssuePhrase(issue)}`;
}

// Raison d'un échec, à placer après « Impossible de … : ». Jamais le message technique du serveur
export function getErrorReason(
	error: unknown,
	{ projectReasons = {}, fieldLabels }: Dictionaries = {},
): string {
	if (!(error instanceof ApiError)) return UNEXPECTED_REASON;
	if (error.status === null) return UNREACHABLE_REASON;

	if (error.code === TechnicalErrorCodeEnum.VALIDATION_FAILED) {
		const validationReason = getValidationReason(error, fieldLabels);
		if (validationReason !== null) return validationReason;
	}

	const codeReason =
		error.code === null
			? undefined
			: (projectReasons[error.code] ?? allReasons[error.code]);
	if (codeReason !== undefined) return codeReason;

	// Code absent ou inconnu : seule la famille du statut est fiable
	return error.status >= Number(HttpStatutCodeErrorEnum.SERVER_ERROR)
		? technicalErrorReasons[TechnicalErrorCodeEnum.INTERNAL_ERROR]
		: technicalErrorReasons[TechnicalErrorCodeEnum.INVALID_REQUEST];
}
