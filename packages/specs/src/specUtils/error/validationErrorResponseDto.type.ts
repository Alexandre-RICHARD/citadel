import type { ErrorResponseDto } from "./errorResponseDto.type.ts";
import type { TechnicalErrorCodeEnum } from "./technicalErrorCode.enum.ts";
import type { ValidationIssueDto } from "./validationIssueDto.type.ts";

// Corps d'une réponse 400 : `issues` détaille les champs invalides (vide si aucun champ précis n'est en cause)
export type ValidationErrorResponseDto = ErrorResponseDto<
	| TechnicalErrorCodeEnum.VALIDATION_FAILED
	| TechnicalErrorCodeEnum.MALFORMED_JSON
	| TechnicalErrorCodeEnum.INVALID_REQUEST
> & {
	issues: ValidationIssueDto[];
};
